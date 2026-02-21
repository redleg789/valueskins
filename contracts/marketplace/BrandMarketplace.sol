// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IProfessionRegistry} from "../core/IProfessionRegistry.sol";
import {IPersonaRegistry} from "../core/IPersonaRegistry.sol";

/**
 * @title BrandMarketplace
 * @author Valueskins Team
 * @notice Marketplace connecting brands with verified creators
 * @dev Core revenue model: Platform takes percentage of all transactions
 * 
 * BLOCKER ADDRESSED: Revenue compounding and repeat spend mechanics
 * - Transaction-based revenue (take rate on every deal)
 * - Platform earns as creators earn (aligned incentives)
 * - Brands pay premium for verified talent access
 * 
 * KEY FEATURES:
 * - Brands post opportunities with level requirements
 * - Creators apply, brands select, escrow payment
 * - Platform takes configurable fee (default 5%)
 * - Supports ETH and ERC20 payments
 */
contract BrandMarketplace is 
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuard,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    // ============ Constants ============
    
    uint256 public constant PRECISION = 10000;
    uint256 public constant MAX_PLATFORM_FEE = 2000; // 20% max
    uint256 public constant MIN_OPPORTUNITY_DURATION = 1 days;
    uint256 public constant MAX_OPPORTUNITY_DURATION = 365 days;

    // ============ Enums ============
    
    enum OpportunityStatus { Open, Filled, Completed, Cancelled, Disputed }
    enum ApplicationStatus { Pending, Accepted, Rejected, Withdrawn }

    // ============ Structs ============
    
    struct Opportunity {
        uint256 id;
        address brand;
        string title;
        string description;
        string category;
        uint256 requiredProfessionId;
        uint8 requiredLevel;
        uint256 reward;            // In wei (ETH) or token units
        address paymentToken;      // address(0) = ETH
        uint256 deadline;
        uint256 createdAt;
        OpportunityStatus status;
        uint256 selectedPersonaId;
        bool exists;
    }

    struct Application {
        uint256 opportunityId;
        uint256 personaId;
        address applicant;
        string pitch;
        uint256 appliedAt;
        ApplicationStatus status;
        bool exists;
    }

    struct BrandProfile {
        string name;
        string category;
        string logoUri;
        uint256 totalDeals;
        uint256 totalSpent;
        bool verified;
        bool exists;
    }

    // ============ State Variables ============
    
    IPersonaRegistry public personaRegistry;
    IProfessionRegistry public professionRegistry;
    
    uint256 private _opportunityIdCounter;
    uint256 public platformFee; // In PRECISION (500 = 5%)
    address public feeRecipient;
    
    // Total platform revenue (for transparency)
    uint256 public totalPlatformRevenue;
    uint256 public totalCreatorPayouts;
    uint256 public totalDealsCompleted;
    
    mapping(uint256 => Opportunity) private _opportunities;
    mapping(uint256 => Application[]) private _opportunityApplications;
    mapping(uint256 => mapping(uint256 => uint256)) private _applicationIndex; // opportunityId => personaId => index
    mapping(address => BrandProfile) private _brandProfiles;
    mapping(address => uint256[]) private _brandOpportunities;
    
    // Escrow balances
    mapping(uint256 => uint256) private _escrowBalances;

    // ============ Events ============
    
    event OpportunityCreated(
        uint256 indexed opportunityId,
        address indexed brand,
        uint256 requiredProfessionId,
        uint8 requiredLevel,
        uint256 reward
    );
    event ApplicationSubmitted(
        uint256 indexed opportunityId,
        uint256 indexed personaId,
        address applicant
    );
    event ApplicationAccepted(
        uint256 indexed opportunityId,
        uint256 indexed personaId
    );
    event DealCompleted(
        uint256 indexed opportunityId,
        uint256 indexed personaId,
        uint256 creatorPayout,
        uint256 platformFeeAmount
    );
    event OpportunityCancelled(uint256 indexed opportunityId);
    event DisputeRaised(uint256 indexed opportunityId, address indexed raisedBy);
    event BrandProfileUpdated(address indexed brand, string name);

    // ============ Errors ============
    
    error InsufficientPayment(uint256 required, uint256 provided);
    error OpportunityDoesNotExist(uint256 opportunityId);
    error OpportunityNotOpen(uint256 opportunityId);
    error NotBrandOwner(uint256 opportunityId);
    error NotPersonaOwner(uint256 personaId);
    error InsufficientLevel(uint256 personaId, uint8 required, uint8 actual);
    error AlreadyApplied(uint256 opportunityId, uint256 personaId);
    error ApplicationNotFound(uint256 opportunityId, uint256 personaId);
    error InvalidDeadline();
    error InvalidFee();
    error TransferFailed();
    error ZeroAddress();
    error OpportunityExpired();
    error NotFilled();
    error AlreadyCompleted();

    // ============ Initializer ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(
        address owner_,
        address personaRegistry_,
        address professionRegistry_,
        address feeRecipient_,
        uint256 platformFee_
    ) external initializer {
        if (owner_ == address(0) || personaRegistry_ == address(0) || 
            professionRegistry_ == address(0) || feeRecipient_ == address(0)) {
            revert ZeroAddress();
        }
        if (platformFee_ > MAX_PLATFORM_FEE) revert InvalidFee();
        
        __Ownable_init(owner_);
        
        personaRegistry = IPersonaRegistry(personaRegistry_);
        professionRegistry = IProfessionRegistry(professionRegistry_);
        feeRecipient = feeRecipient_;
        platformFee = platformFee_;
        _opportunityIdCounter = 1;
    }

    // ============ Brand Functions ============
    
    /**
     * @notice Creates a new opportunity with escrowed payment
     * @param title Opportunity title
     * @param description Full description
     * @param category Category (e.g., "Sponsorship", "Job", "Commission")
     * @param requiredProfessionId Required profession ID
     * @param requiredLevel Minimum level required (1-5)
     * @param reward Payment amount
     * @param paymentToken Token address (address(0) for ETH)
     * @param duration Duration in seconds
     */
    function createOpportunity(
        string calldata title,
        string calldata description,
        string calldata category,
        uint256 requiredProfessionId,
        uint8 requiredLevel,
        uint256 reward,
        address paymentToken,
        uint256 duration
    ) external payable nonReentrant returns (uint256 opportunityId) {
        if (duration < MIN_OPPORTUNITY_DURATION || duration > MAX_OPPORTUNITY_DURATION) {
            revert InvalidDeadline();
        }
        
        // Escrow payment
        if (paymentToken == address(0)) {
            if (msg.value < reward) revert InsufficientPayment(reward, msg.value);
        } else {
            IERC20(paymentToken).safeTransferFrom(msg.sender, address(this), reward);
        }
        
        opportunityId = _opportunityIdCounter++;
        
        _opportunities[opportunityId] = Opportunity({
            id: opportunityId,
            brand: msg.sender,
            title: title,
            description: description,
            category: category,
            requiredProfessionId: requiredProfessionId,
            requiredLevel: requiredLevel,
            reward: reward,
            paymentToken: paymentToken,
            deadline: block.timestamp + duration,
            createdAt: block.timestamp,
            status: OpportunityStatus.Open,
            selectedPersonaId: 0,
            exists: true
        });
        
        _escrowBalances[opportunityId] = reward;
        _brandOpportunities[msg.sender].push(opportunityId);
        
        // Update brand profile
        if (!_brandProfiles[msg.sender].exists) {
            _brandProfiles[msg.sender] = BrandProfile({
                name: "",
                category: category,
                logoUri: "",
                totalDeals: 0,
                totalSpent: 0,
                verified: false,
                exists: true
            });
        }
        
        emit OpportunityCreated(opportunityId, msg.sender, requiredProfessionId, requiredLevel, reward);
        
        // Refund excess ETH
        if (paymentToken == address(0) && msg.value > reward) {
            (bool success, ) = msg.sender.call{value: msg.value - reward}("");
            if (!success) revert TransferFailed();
        }
    }
    
    /**
     * @notice Accepts an application (brand only)
     */
    function acceptApplication(
        uint256 opportunityId,
        uint256 personaId
    ) external nonReentrant {
        Opportunity storage opp = _opportunities[opportunityId];
        if (!opp.exists) revert OpportunityDoesNotExist(opportunityId);
        if (opp.brand != msg.sender) revert NotBrandOwner(opportunityId);
        if (opp.status != OpportunityStatus.Open) revert OpportunityNotOpen(opportunityId);
        if (block.timestamp > opp.deadline) revert OpportunityExpired();
        
        uint256 appIndex = _applicationIndex[opportunityId][personaId];
        Application storage app = _opportunityApplications[opportunityId][appIndex];
        if (!app.exists || app.personaId != personaId) {
            revert ApplicationNotFound(opportunityId, personaId);
        }
        
        app.status = ApplicationStatus.Accepted;
        opp.status = OpportunityStatus.Filled;
        opp.selectedPersonaId = personaId;
        
        emit ApplicationAccepted(opportunityId, personaId);
    }
    
    /**
     * @notice Marks deal as completed and releases payment (brand only)
     */
    function completeDeal(uint256 opportunityId) external nonReentrant {
        Opportunity storage opp = _opportunities[opportunityId];
        if (!opp.exists) revert OpportunityDoesNotExist(opportunityId);
        if (opp.brand != msg.sender) revert NotBrandOwner(opportunityId);
        if (opp.status != OpportunityStatus.Filled) revert NotFilled();
        
        opp.status = OpportunityStatus.Completed;
        
        uint256 escrowAmount = _escrowBalances[opportunityId];
        _escrowBalances[opportunityId] = 0;
        
        // Calculate fees
        uint256 feeAmount = (escrowAmount * platformFee) / PRECISION;
        uint256 creatorPayout = escrowAmount - feeAmount;
        
        // Get creator address
        IPersonaRegistry.Persona memory persona = personaRegistry.getPersona(opp.selectedPersonaId);
        address creator = persona.owner;
        
        // Transfer to creator
        if (opp.paymentToken == address(0)) {
            (bool success1, ) = creator.call{value: creatorPayout}("");
            if (!success1) revert TransferFailed();
            (bool success2, ) = feeRecipient.call{value: feeAmount}("");
            if (!success2) revert TransferFailed();
        } else {
            IERC20(opp.paymentToken).safeTransfer(creator, creatorPayout);
            IERC20(opp.paymentToken).safeTransfer(feeRecipient, feeAmount);
        }
        
        // Update stats
        totalPlatformRevenue += feeAmount;
        totalCreatorPayouts += creatorPayout;
        totalDealsCompleted++;
        _brandProfiles[opp.brand].totalDeals++;
        _brandProfiles[opp.brand].totalSpent += opp.reward;
        
        emit DealCompleted(opportunityId, opp.selectedPersonaId, creatorPayout, feeAmount);
    }
    
    /**
     * @notice Cancels opportunity and refunds escrow (brand only, before filled)
     */
    function cancelOpportunity(uint256 opportunityId) external nonReentrant {
        Opportunity storage opp = _opportunities[opportunityId];
        if (!opp.exists) revert OpportunityDoesNotExist(opportunityId);
        if (opp.brand != msg.sender) revert NotBrandOwner(opportunityId);
        if (opp.status != OpportunityStatus.Open) revert OpportunityNotOpen(opportunityId);
        
        opp.status = OpportunityStatus.Cancelled;
        
        uint256 escrowAmount = _escrowBalances[opportunityId];
        _escrowBalances[opportunityId] = 0;
        
        // Refund brand
        if (opp.paymentToken == address(0)) {
            (bool success, ) = opp.brand.call{value: escrowAmount}("");
            if (!success) revert TransferFailed();
        } else {
            IERC20(opp.paymentToken).safeTransfer(opp.brand, escrowAmount);
        }
        
        emit OpportunityCancelled(opportunityId);
    }

    // ============ Creator Functions ============
    
    /**
     * @notice Applies to an opportunity
     * @param opportunityId Opportunity to apply for
     * @param personaId Persona to apply with
     * @param pitch Application pitch
     */
    function applyToOpportunity(
        uint256 opportunityId,
        uint256 personaId,
        string calldata pitch
    ) external nonReentrant {
        Opportunity storage opp = _opportunities[opportunityId];
        if (!opp.exists) revert OpportunityDoesNotExist(opportunityId);
        if (opp.status != OpportunityStatus.Open) revert OpportunityNotOpen(opportunityId);
        if (block.timestamp > opp.deadline) revert OpportunityExpired();
        
        // Verify persona ownership
        IPersonaRegistry.Persona memory persona = personaRegistry.getPersona(personaId);
        if (persona.owner != msg.sender) revert NotPersonaOwner(personaId);
        
        // Verify level requirement
        IProfessionRegistry.PersonaProfession memory pp = professionRegistry.getPersonaProfession(
            personaId, 
            opp.requiredProfessionId
        );
        if (pp.level < opp.requiredLevel) {
            revert InsufficientLevel(personaId, opp.requiredLevel, pp.level);
        }
        
        // Check not already applied
        if (_opportunityApplications[opportunityId].length > 0) {
            uint256 idx = _applicationIndex[opportunityId][personaId];
            if (idx < _opportunityApplications[opportunityId].length &&
                _opportunityApplications[opportunityId][idx].personaId == personaId) {
                revert AlreadyApplied(opportunityId, personaId);
            }
        }
        
        // Store application
        uint256 newIndex = _opportunityApplications[opportunityId].length;
        _opportunityApplications[opportunityId].push(Application({
            opportunityId: opportunityId,
            personaId: personaId,
            applicant: msg.sender,
            pitch: pitch,
            appliedAt: block.timestamp,
            status: ApplicationStatus.Pending,
            exists: true
        }));
        _applicationIndex[opportunityId][personaId] = newIndex;
        
        emit ApplicationSubmitted(opportunityId, personaId, msg.sender);
    }

    // ============ View Functions ============
    
    function getOpportunity(uint256 opportunityId) external view returns (Opportunity memory) {
        if (!_opportunities[opportunityId].exists) revert OpportunityDoesNotExist(opportunityId);
        return _opportunities[opportunityId];
    }
    
    function getApplications(uint256 opportunityId) external view returns (Application[] memory) {
        return _opportunityApplications[opportunityId];
    }
    
    function getBrandProfile(address brand) external view returns (BrandProfile memory) {
        return _brandProfiles[brand];
    }
    
    function getBrandOpportunities(address brand) external view returns (uint256[] memory) {
        return _brandOpportunities[brand];
    }
    
    function getEscrowBalance(uint256 opportunityId) external view returns (uint256) {
        return _escrowBalances[opportunityId];
    }
    
    /**
     * @notice Platform revenue metrics (transparency)
     */
    function getRevenueMetrics() external view returns (
        uint256 platformRevenue,
        uint256 creatorPayouts,
        uint256 dealsCompleted,
        uint256 currentFeeRate
    ) {
        return (totalPlatformRevenue, totalCreatorPayouts, totalDealsCompleted, platformFee);
    }

    // ============ Admin Functions ============
    
    function setPlatformFee(uint256 newFee) external onlyOwner {
        if (newFee > MAX_PLATFORM_FEE) revert InvalidFee();
        platformFee = newFee;
    }
    
    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert ZeroAddress();
        feeRecipient = newRecipient;
    }
    
    function updateBrandProfile(
        address brand,
        string calldata name,
        string calldata logoUri,
        bool verified
    ) external onlyOwner {
        BrandProfile storage profile = _brandProfiles[brand];
        profile.name = name;
        profile.logoUri = logoUri;
        profile.verified = verified;
        if (!profile.exists) profile.exists = true;
        emit BrandProfileUpdated(brand, name);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    receive() external payable {}
}
