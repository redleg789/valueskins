// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IPersonaRegistry} from "./IPersonaRegistry.sol";

/**
 * @title PersonaRegistry
 * @author Valueskins Team
 * @notice Core persona management with exponential pricing and decay mechanics
 * @dev Upgradeable via UUPS proxy pattern
 * 
 * Key Features:
 * - Unlimited personas per wallet
 * - Exponential pricing: price = basePrice * (multiplier ^ personaCount)
 * - Decay tracking for inactive personas
 * - Upkeep payment system for maintenance
 */
contract PersonaRegistry is 
    IPersonaRegistry,
    Initializable,
    OwnableUpgradeable, 
    ReentrancyGuard,
    UUPSUpgradeable 
{
    // ============ Constants ============
    
    /// @notice Precision for percentage calculations (100% = 10000)
    uint256 public constant PRECISION = 10000;
    
    /// @notice Minimum base price (0.001 ETH)
    uint256 public constant MIN_BASE_PRICE = 0.001 ether;
    
    /// @notice Maximum multiplier (10x)
    uint256 public constant MAX_MULTIPLIER = 100000; // 10x in PRECISION

    // ============ State Variables ============
    
    /// @notice Counter for persona IDs
    uint256 private _personaIdCounter;
    
    /// @notice Base price for first persona (default: 0.01 ETH)
    uint256 public basePrice;
    
    /// @notice Price multiplier for subsequent personas (default: 2x = 20000 in PRECISION)
    uint256 public priceMultiplier;
    
    /// @notice Weekly decay rate for inactive personas (default: 10% = 1000 in PRECISION)
    uint256 public decayRate;
    
    /// @notice Upkeep period in seconds (default: 1 week)
    uint256 public upkeepPeriod;
    
    /// @notice Inactivity threshold before decay applies (default: 2 weeks)
    uint256 public inactivityThreshold;
    
    /// @notice Upkeep cost per period (default: 0.001 ETH)
    uint256 public upkeepCost;
    
    /// @notice Mapping of persona ID to Persona struct
    mapping(uint256 => Persona) private _personas;
    
    /// @notice Mapping of owner address to array of persona IDs
    mapping(address => uint256[]) private _ownerPersonas;
    
    /// @notice Mapping to track persona index in owner's array (for efficient removal)
    mapping(uint256 => uint256) private _personaIndexInOwnerArray;

    // ============ Errors ============
    
    error InsufficientPayment(uint256 required, uint256 provided);
    error PersonaDoesNotExist(uint256 personaId);
    error NotPersonaOwner(uint256 personaId, address caller);
    error InvalidParameter(string param);
    error TransferFailed();
    error ZeroAddress();

    // ============ Initializer ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @notice Initializes the contract
     * @param owner_ The owner address
     * @param basePrice_ The base price for first persona
     * @param priceMultiplier_ The price multiplier (in PRECISION, 20000 = 2x)
     */
    function initialize(
        address owner_,
        uint256 basePrice_,
        uint256 priceMultiplier_
    ) external initializer {
        if (owner_ == address(0)) revert ZeroAddress();
        if (basePrice_ < MIN_BASE_PRICE) revert InvalidParameter("basePrice");
        if (priceMultiplier_ < PRECISION || priceMultiplier_ > MAX_MULTIPLIER) {
            revert InvalidParameter("priceMultiplier");
        }
        
        __Ownable_init(owner_);
        
        basePrice = basePrice_;
        priceMultiplier = priceMultiplier_;
        decayRate = 1000; // 10%
        upkeepPeriod = 1 weeks;
        inactivityThreshold = 2 weeks;
        upkeepCost = 0.001 ether;
        _personaIdCounter = 1; // Start from 1
    }

    // ============ External Functions ============
    
    /**
     * @notice Creates a new persona for the caller
     * @param displayName The display name for the persona
     * @param avatarUri The avatar URI (IPFS or HTTP)
     * @return personaId The ID of the created persona
     */
    function createPersona(
        string calldata displayName,
        string calldata avatarUri
    ) external payable nonReentrant returns (uint256 personaId) {
        uint256 price = getNextPersonaPrice(msg.sender);
        
        if (msg.value < price) {
            revert InsufficientPayment(price, msg.value);
        }
        
        personaId = _personaIdCounter++;
        
        _personas[personaId] = Persona({
            id: personaId,
            owner: msg.sender,
            displayName: displayName,
            avatarUri: avatarUri,
            createdAt: block.timestamp,
            lastActive: block.timestamp,
            upkeepPaidUntil: block.timestamp + upkeepPeriod,
            exists: true
        });
        
        _personaIndexInOwnerArray[personaId] = _ownerPersonas[msg.sender].length;
        _ownerPersonas[msg.sender].push(personaId);
        
        emit PersonaCreated(personaId, msg.sender, displayName, price);

        _refundExcess(msg.value - price);
    }
    
    /**
     * @notice Updates a persona's display info
     * @param personaId The persona ID to update
     * @param displayName The new display name
     * @param avatarUri The new avatar URI
     */
    function updatePersona(
        uint256 personaId,
        string calldata displayName,
        string calldata avatarUri
    ) external {
        _requireOwner(personaId);
        
        Persona storage persona = _personas[personaId];
        persona.displayName = displayName;
        persona.avatarUri = avatarUri;
        
        emit PersonaUpdated(personaId, displayName, avatarUri);
    }
    
    /**
     * @notice Records activity for a persona (called by authorized services)
     * @param personaId The persona ID
     */
    function recordActivity(uint256 personaId) external {
        _requireExists(personaId);
        // In production, this would be restricted to authorized callers
        
        _personas[personaId].lastActive = block.timestamp;
        
        emit PersonaActivityRecorded(personaId, block.timestamp);
    }
    
    /**
     * @notice Pays upkeep for a persona to prevent decay
     * @param personaId The persona ID
     */
    function payUpkeep(uint256 personaId) external payable nonReentrant {
        _requireExists(personaId);
        
        if (msg.value < upkeepCost) {
            revert InsufficientPayment(upkeepCost, msg.value);
        }
        
        Persona storage persona = _personas[personaId];
        
        // Extend upkeep from current end or now, whichever is later
        uint256 startFrom = persona.upkeepPaidUntil > block.timestamp 
            ? persona.upkeepPaidUntil 
            : block.timestamp;
        
        persona.upkeepPaidUntil = startFrom + upkeepPeriod;
        
        emit UpkeepPaid(personaId, msg.value, persona.upkeepPaidUntil);

        _refundExcess(msg.value - upkeepCost);
    }

    // ============ View Functions ============
    
    /**
     * @notice Gets a persona by ID
     * @param personaId The persona ID
     * @return The Persona struct
     */
    function getPersona(uint256 personaId) external view returns (Persona memory) {
        _requireExists(personaId);
        return _personas[personaId];
    }
    
    /**
     * @notice Gets all persona IDs for an owner
     * @param owner The owner address
     * @return Array of persona IDs
     */
    function getPersonasByOwner(address owner) external view returns (uint256[] memory) {
        return _ownerPersonas[owner];
    }
    
    /**
     * @notice Gets the count of personas for an owner
     * @param owner The owner address
     * @return The count
     */
    function getPersonaCount(address owner) external view returns (uint256) {
        return _ownerPersonas[owner].length;
    }
    
    /**
     * @notice Calculates the price for the next persona
     * @param owner The owner address
     * @return The price in wei
     */
    function getNextPersonaPrice(address owner) public view returns (uint256) {
        uint256 count = _ownerPersonas[owner].length;
        
        if (count == 0) {
            return basePrice;
        }
        
        // Exponential pricing: basePrice * (multiplier/PRECISION) ^ count
        // To avoid overflow, we calculate iteratively
        uint256 price = basePrice;
        for (uint256 i = 0; i < count; i++) {
            price = (price * priceMultiplier) / PRECISION;
        }
        
        return price;
    }
    
    /**
     * @notice Checks if a persona is considered active
     * @param personaId The persona ID
     * @return True if active (no decay applies)
     */
    function isPersonaActive(uint256 personaId) external view returns (bool) {
        _requireExists(personaId);
        Persona storage persona = _personas[personaId];
        
        // Persona is active if recently active or upkeep is paid
        return persona.lastActive + inactivityThreshold > block.timestamp ||
               persona.upkeepPaidUntil > block.timestamp;
    }
    
    /**
     * @notice Calculates decay amount for an inactive persona
     * @param personaId The persona ID
     * @return The decay amount (for scoring purposes)
     */
    function getDecayAmount(uint256 personaId) external view returns (uint256) {
        _requireExists(personaId);
        Persona storage persona = _personas[personaId];

        // No decay if active or upkeep paid
        if (persona.lastActive + inactivityThreshold > block.timestamp ||
            persona.upkeepPaidUntil > block.timestamp) {
            return 0;
        }

        // Calculate weeks of inactivity beyond threshold
        uint256 inactiveTime = block.timestamp - (persona.lastActive + inactivityThreshold);
        uint256 weeksInactive = inactiveTime / 1 weeks;

        // Cap weeks to prevent overflow (100 weeks = ~2 years)
        if (weeksInactive > 100) weeksInactive = 100;

        // Decay formula: remaining = initial * (1 - rate)^weeks
        // For efficiency, we use approximation: decay ≈ 1 - (1 - rate)^weeks
        uint256 multiplier = PRECISION - decayRate;
        uint256 remaining = PRECISION;

        for (uint256 i = 0; i < weeksInactive; i++) {
            remaining = (remaining * multiplier) / PRECISION;
        }

        return PRECISION - remaining;
    }

    // ============ Admin Functions ============
    
    function setBasePrice(uint256 newBasePrice) external onlyOwner {
        if (newBasePrice < MIN_BASE_PRICE) revert InvalidParameter("basePrice");
        basePrice = newBasePrice;
    }
    
    function setPriceMultiplier(uint256 newMultiplier) external onlyOwner {
        if (newMultiplier < PRECISION || newMultiplier > MAX_MULTIPLIER) {
            revert InvalidParameter("priceMultiplier");
        }
        priceMultiplier = newMultiplier;
    }
    
    function setDecayRate(uint256 newDecayRate) external onlyOwner {
        if (newDecayRate > PRECISION) revert InvalidParameter("decayRate");
        decayRate = newDecayRate;
    }
    
    function setUpkeepPeriod(uint256 newPeriod) external onlyOwner {
        if (newPeriod == 0) revert InvalidParameter("upkeepPeriod");
        upkeepPeriod = newPeriod;
    }
    
    function setUpkeepCost(uint256 newCost) external onlyOwner {
        upkeepCost = newCost;
    }
    
    function setInactivityThreshold(uint256 newThreshold) external onlyOwner {
        if (newThreshold == 0) revert InvalidParameter("inactivityThreshold");
        inactivityThreshold = newThreshold;
    }
    
    function withdraw(address payable to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        (bool success, ) = to.call{value: address(this).balance}("");
        if (!success) revert TransferFailed();
    }

    // ============ Internal Functions ============

    function _requireExists(uint256 personaId) internal view {
        if (!_personas[personaId].exists) {
            revert PersonaDoesNotExist(personaId);
        }
    }

    function _requireOwner(uint256 personaId) internal view {
        _requireExists(personaId);
        if (_personas[personaId].owner != msg.sender) {
            revert NotPersonaOwner(personaId, msg.sender);
        }
    }

    /// @notice Refunds excess payment to sender
    /// @param amount The amount to refund
    function _refundExcess(uint256 amount) internal {
        if (amount > 0) {
            (bool success, ) = msg.sender.call{value: amount}("");
            if (!success) revert TransferFailed();
        }
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ============ Receive ============
    
    receive() external payable {}
}
