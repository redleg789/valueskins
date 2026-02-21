// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IProfessionRegistry} from "./IProfessionRegistry.sol";
import {IPersonaRegistry} from "./IPersonaRegistry.sol";

/**
 * @title ProfessionRegistry
 * @author Valueskins Team
 * @notice AI-controlled profession management with level tracking
 * @dev Integrates with PersonaRegistry for ownership validation
 * 
 * Key Features:
 * - AI (oracle) controls profession creation, merging, and removal
 * - Users pay to add professions to their personas
 * - Levels 1-4 visible to creators, real score hidden
 * - Level changes tracked for decay mechanics
 */
contract ProfessionRegistry is 
    IProfessionRegistry,
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuard,
    UUPSUpgradeable
{
    // ============ Constants ============
    
    /// @notice Maximum level (5)
    /// PATENT-RELEVANT: 5-level system where each level directly maps to a
    /// pricing multiplier (1x, 1.5x, 2.5x, 5x, 10x) that auto-adjusts
    /// what brands pay creators — no human review required.
    uint8 public constant MAX_LEVEL = 5;
    
    /// @notice Precision for real score (10000 = 100%)
    uint256 public constant SCORE_PRECISION = 10000;

    // ============ State Variables ============
    
    /// @notice Reference to PersonaRegistry for ownership checks
    IPersonaRegistry public personaRegistry;
    
    /// @notice Address authorized to update levels (AI oracle)
    address public levelOracle;
    
    /// @notice Counter for profession IDs
    uint256 private _professionIdCounter;
    
    /// @notice Price to add a profession to a persona
    uint256 public professionAddPrice;
    
    /// @notice Mapping of profession ID to Profession struct
    mapping(uint256 => Profession) private _professions;
    
    /// @notice Array of all profession IDs (for enumeration)
    uint256[] private _allProfessionIds;
    
    /// @notice Mapping of personaId => professionId => PersonaProfession
    mapping(uint256 => mapping(uint256 => PersonaProfession)) private _personaProfessions;
    
    /// @notice Mapping of personaId => array of profession IDs
    mapping(uint256 => uint256[]) private _personaProfessionIds;
    
    /// @notice Mapping to track merged professions (old => new)
    mapping(uint256 => uint256) private _mergedInto;

    // ============ Errors ============
    
    error InsufficientPayment(uint256 required, uint256 provided);
    error ProfessionDoesNotExist(uint256 professionId);
    error ProfessionNotActive(uint256 professionId);
    error PersonaProfessionExists(uint256 personaId, uint256 professionId);
    error PersonaProfessionNotExists(uint256 personaId, uint256 professionId);
    error NotPersonaOwner(uint256 personaId, address caller);
    error NotOracle(address caller);
    error InvalidLevel(uint8 level);
    error InvalidParameter(string param);
    error TransferFailed();
    error ZeroAddress();

    // ============ Modifiers ============
    
    modifier onlyOracle() {
        if (msg.sender != levelOracle) revert NotOracle(msg.sender);
        _;
    }

    // ============ Initializer ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @notice Initializes the contract
     * @param owner_ The owner address
     * @param personaRegistry_ The PersonaRegistry contract address
     * @param levelOracle_ The authorized oracle address
     * @param professionAddPrice_ Initial price to add profession
     */
    function initialize(
        address owner_,
        address personaRegistry_,
        address levelOracle_,
        uint256 professionAddPrice_
    ) external initializer {
        if (owner_ == address(0) || personaRegistry_ == address(0) || levelOracle_ == address(0)) {
            revert ZeroAddress();
        }
        
        __Ownable_init(owner_);
        
        personaRegistry = IPersonaRegistry(personaRegistry_);
        levelOracle = levelOracle_;
        professionAddPrice = professionAddPrice_;
        _professionIdCounter = 1;
    }

    // ============ User Functions ============
    
    /**
     * @notice Adds a profession to a persona (user pays)
     * @param personaId The persona ID
     * @param professionId The profession ID to add
     */
    function addProfessionToPersona(
        uint256 personaId,
        uint256 professionId
    ) external payable nonReentrant {
        // Validate ownership via PersonaRegistry
        IPersonaRegistry.Persona memory persona = personaRegistry.getPersona(personaId);
        if (persona.owner != msg.sender) {
            revert NotPersonaOwner(personaId, msg.sender);
        }
        
        // Validate profession exists and is active
        if (!_professions[professionId].isActive) {
            revert ProfessionNotActive(professionId);
        }
        
        // Resolve merged profession
        uint256 actualProfessionId = _resolveMerged(professionId);
        
        // Check not already added
        if (_personaProfessions[personaId][actualProfessionId].exists) {
            revert PersonaProfessionExists(personaId, actualProfessionId);
        }
        
        // Check payment
        if (msg.value < professionAddPrice) {
            revert InsufficientPayment(professionAddPrice, msg.value);
        }
        
        // Add profession to persona
        _personaProfessions[personaId][actualProfessionId] = PersonaProfession({
            professionId: actualProfessionId,
            level: 1, // Start at level 1
            realScore: 0,
            addedAt: block.timestamp,
            lastLevelChange: block.timestamp,
            exists: true
        });
        
        _personaProfessionIds[personaId].push(actualProfessionId);
        
        emit ProfessionAdded(personaId, actualProfessionId, msg.value);

        _refundExcess(msg.value - professionAddPrice);
    }

    // ============ Oracle Functions ============
    
    /**
     * @notice Updates level and real score for a persona's profession
     * @dev Only callable by authorized oracle
     * @param personaId The persona ID
     * @param professionId The profession ID
     * @param newLevel The new visible level (1-5)
     * @param realScore The hidden real score (0-10000)
     */
    function updateLevel(
        uint256 personaId,
        uint256 professionId,
        uint8 newLevel,
        uint256 realScore
    ) external onlyOracle {
        if (newLevel == 0 || newLevel > MAX_LEVEL) revert InvalidLevel(newLevel);
        if (realScore > SCORE_PRECISION) revert InvalidParameter("realScore");
        
        uint256 actualProfessionId = _resolveMerged(professionId);
        
        PersonaProfession storage pp = _personaProfessions[personaId][actualProfessionId];
        if (!pp.exists) revert PersonaProfessionNotExists(personaId, actualProfessionId);
        
        if (pp.level != newLevel) {
            pp.lastLevelChange = block.timestamp;
        }
        
        pp.level = newLevel;
        pp.realScore = realScore;
        
        emit LevelUpdated(personaId, actualProfessionId, newLevel);
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Creates a new profession (admin/AI controlled)
     * @param name The profession name
     * @param category The profession category
     * @param description The profession description
     * @return professionId The created profession ID
     */
    function createProfession(
        string calldata name,
        string calldata category,
        string calldata description
    ) external onlyOwner returns (uint256 professionId) {
        professionId = _professionIdCounter++;
        
        _professions[professionId] = Profession({
            id: professionId,
            name: name,
            category: category,
            description: description,
            isActive: true,
            createdAt: block.timestamp
        });
        
        _allProfessionIds.push(professionId);
        
        emit ProfessionCreated(professionId, name, category);
    }
    
    /**
     * @notice Updates a profession
     * @param professionId The profession ID
     * @param name The new name
     * @param isActive Whether the profession is active
     */
    function updateProfession(
        uint256 professionId,
        string calldata name,
        bool isActive
    ) external onlyOwner {
        if (_professions[professionId].id == 0) revert ProfessionDoesNotExist(professionId);
        
        _professions[professionId].name = name;
        _professions[professionId].isActive = isActive;
        
        emit ProfessionUpdated(professionId, name, isActive);
    }
    
    /**
     * @notice Merges multiple professions into one
     * @dev Users with old professions will automatically use the merged one
     * @param fromIds The profession IDs to merge from
     * @param toId The profession ID to merge into
     */
    function mergeProfessions(
        uint256[] calldata fromIds,
        uint256 toId
    ) external onlyOwner {
        if (_professions[toId].id == 0) revert ProfessionDoesNotExist(toId);
        
        for (uint256 i = 0; i < fromIds.length; i++) {
            if (_professions[fromIds[i]].id == 0) revert ProfessionDoesNotExist(fromIds[i]);
            
            _professions[fromIds[i]].isActive = false;
            _mergedInto[fromIds[i]] = toId;
        }
        
        emit ProfessionsMerged(fromIds, toId);
    }
    
    function setProfessionAddPrice(uint256 newPrice) external onlyOwner {
        professionAddPrice = newPrice;
    }
    
    function setLevelOracle(address newOracle) external onlyOwner {
        if (newOracle == address(0)) revert ZeroAddress();
        levelOracle = newOracle;
    }
    
    function setPersonaRegistry(address newRegistry) external onlyOwner {
        if (newRegistry == address(0)) revert ZeroAddress();
        personaRegistry = IPersonaRegistry(newRegistry);
    }
    
    function withdraw(address payable to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        (bool success, ) = to.call{value: address(this).balance}("");
        if (!success) revert TransferFailed();
    }

    // ============ View Functions ============
    
    function getProfession(uint256 professionId) external view returns (Profession memory) {
        uint256 actualId = _resolveMerged(professionId);
        if (_professions[actualId].id == 0) revert ProfessionDoesNotExist(actualId);
        return _professions[actualId];
    }
    
    function getActiveProfessions() external view returns (Profession[] memory) {
        // First pass: count active professions
        uint256 activeCount = _countActiveProfessions();

        // Second pass: collect active professions
        Profession[] memory active = new Profession[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < _allProfessionIds.length; i++) {
            uint256 profId = _allProfessionIds[i];
            if (_professions[profId].isActive) {
                active[index++] = _professions[profId];
            }
        }

        return active;
    }

    /// @notice Helper function to count active professions
    function _countActiveProfessions() internal view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < _allProfessionIds.length; i++) {
            if (_professions[_allProfessionIds[i]].isActive) {
                count++;
            }
        }
        return count;
    }
    
    function getPersonaProfessions(uint256 personaId) external view returns (PersonaProfession[] memory) {
        uint256[] storage profIds = _personaProfessionIds[personaId];
        PersonaProfession[] memory result = new PersonaProfession[](profIds.length);
        
        for (uint256 i = 0; i < profIds.length; i++) {
            result[i] = _personaProfessions[personaId][profIds[i]];
        }
        
        return result;
    }
    
    function getPersonaProfession(
        uint256 personaId,
        uint256 professionId
    ) external view returns (PersonaProfession memory) {
        uint256 actualId = _resolveMerged(professionId);
        if (!_personaProfessions[personaId][actualId].exists) {
            revert PersonaProfessionNotExists(personaId, actualId);
        }
        return _personaProfessions[personaId][actualId];
    }
    
    function getProfessionAddPrice() external view returns (uint256) {
        return professionAddPrice;
    }

    // ============ Internal Functions ============

    function _resolveMerged(uint256 professionId) internal view returns (uint256) {
        uint256 current = professionId;
        while (_mergedInto[current] != 0) {
            current = _mergedInto[current];
        }
        return current;
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
