// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IPersonaRegistry} from "../core/IPersonaRegistry.sol";

/**
 * @title ReferralSystem
 * @author Valueskins Team
 * @notice On-chain referral tracking with multi-tier rewards
 * @dev Creates viral growth loop through economic incentives
 * 
 * BLOCKER ADDRESSED: Distribution and growth engine strength
 * - K-factor > 1 incentivization
 * - Multi-tier referral rewards (referrer + referred both benefit)
 * - Leaderboard mechanics for social proof
 * 
 * KEY FEATURES:
 * - Referral codes linked to personas
 * - Tiered rewards based on referrer level
 * - Bonus multipliers for chain referrals
 * - Anti-gaming protections
 */
contract ReferralSystem is 
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuard,
    UUPSUpgradeable
{
    // ============ Constants ============
    
    uint256 public constant PRECISION = 10000;
    uint256 public constant MAX_REFERRAL_DEPTH = 3; // 3-tier referral chain
    
    // Referral reward percentages (of persona mint cost)
    // Level 1 referrer: 10%, Level 2+: scales up
    uint256 public constant BASE_REFERRAL_REWARD = 1000; // 10%
    uint256 public constant LEVEL_BONUS_PER_LEVEL = 200; // +2% per level
    
    // Second-tier referral (referrer's referrer gets a cut)
    uint256 public constant TIER2_REWARD = 300; // 3%
    uint256 public constant TIER3_REWARD = 100; // 1%

    // ============ Structs ============
    
    struct ReferralCode {
        uint256 personaId;
        address owner;
        string code;
        uint256 uses;
        uint256 totalEarnings;
        uint256 createdAt;
        bool active;
    }
    
    struct ReferralChain {
        uint256 tier1PersonaId; // Direct referrer
        uint256 tier2PersonaId; // Referrer's referrer
        uint256 tier3PersonaId; // And so on
    }
    
    struct LeaderboardEntry {
        uint256 personaId;
        uint256 referralCount;
        uint256 totalEarnings;
    }

    // ============ State Variables ============
    
    IPersonaRegistry public personaRegistry;
    
    // Referral code => ReferralCode data
    mapping(bytes32 => ReferralCode) private _referralCodes;
    
    // Persona ID => referral code hash
    mapping(uint256 => bytes32) private _personaToCode;
    
    // New persona ID => who referred them (chain)
    mapping(uint256 => ReferralChain) private _referralChains;
    
    // Persona ID => referral stats
    mapping(uint256 => uint256) private _referralCounts;
    mapping(uint256 => uint256) private _referralEarnings;
    
    // Pending rewards (claimable)
    mapping(address => uint256) private _pendingRewards;
    
    // Total stats
    uint256 public totalReferrals;
    uint256 public totalRewardsPaid;
    
    // Top referrers (for leaderboard)
    uint256[] private _topReferrerIds;
    uint256 public constant MAX_LEADERBOARD_SIZE = 100;

    // ============ Events ============
    
    event ReferralCodeCreated(uint256 indexed personaId, string code);
    event ReferralUsed(
        uint256 indexed newPersonaId,
        uint256 indexed referrerPersonaId,
        string code
    );
    event ReferralRewardEarned(
        uint256 indexed personaId,
        uint256 amount,
        uint8 tier
    );
    event RewardsClaimed(address indexed user, uint256 amount);

    // ============ Errors ============
    
    error InvalidCode();
    error CodeAlreadyExists();
    error CodeNotActive();
    error NotPersonaOwner();
    error NoRewardsToClaim();
    error TransferFailed();
    error SelfReferralNotAllowed();
    error AlreadyReferred();
    error ZeroAddress();

    // ============ Initializer ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(
        address owner_,
        address personaRegistry_
    ) external initializer {
        if (owner_ == address(0) || personaRegistry_ == address(0)) {
            revert ZeroAddress();
        }
        
        __Ownable_init(owner_);
        personaRegistry = IPersonaRegistry(personaRegistry_);
    }

    // ============ Referral Code Management ============
    
    /**
     * @notice Creates a referral code for a persona
     * @param personaId Persona to create code for
     * @param code Desired referral code (alphanumeric)
     */
    function createReferralCode(
        uint256 personaId,
        string calldata code
    ) external {
        // Verify ownership
        IPersonaRegistry.Persona memory persona = personaRegistry.getPersona(personaId);
        if (persona.owner != msg.sender) revert NotPersonaOwner();
        
        bytes32 codeHash = keccak256(abi.encodePacked(_toLowerCase(code)));
        
        // Check code doesn't exist
        if (_referralCodes[codeHash].active) revert CodeAlreadyExists();
        
        // Check persona doesn't already have a code
        if (_personaToCode[personaId] != bytes32(0)) revert CodeAlreadyExists();
        
        _referralCodes[codeHash] = ReferralCode({
            personaId: personaId,
            owner: msg.sender,
            code: code,
            uses: 0,
            totalEarnings: 0,
            createdAt: block.timestamp,
            active: true
        });
        
        _personaToCode[personaId] = codeHash;
        
        emit ReferralCodeCreated(personaId, code);
    }
    
    /**
     * @notice Records a referral when a new persona is created
     * @dev Called by PersonaRegistry during persona creation
     * @param newPersonaId The newly created persona
     * @param referralCode The referral code used
     */
    function recordReferral(
        uint256 newPersonaId,
        string calldata referralCode
    ) external payable nonReentrant {
        bytes32 codeHash = keccak256(abi.encodePacked(_toLowerCase(referralCode)));
        ReferralCode storage refCode = _referralCodes[codeHash];
        
        if (!refCode.active) revert CodeNotActive();
        
        // Get new persona owner
        IPersonaRegistry.Persona memory newPersona = personaRegistry.getPersona(newPersonaId);
        
        // Prevent self-referral
        if (newPersona.owner == refCode.owner) revert SelfReferralNotAllowed();
        
        // Check not already referred
        if (_referralChains[newPersonaId].tier1PersonaId != 0) revert AlreadyReferred();
        
        // Build referral chain
        ReferralChain memory chain;
        chain.tier1PersonaId = refCode.personaId;
        
        // Check if referrer was also referred (tier 2)
        ReferralChain memory referrerChain = _referralChains[refCode.personaId];
        if (referrerChain.tier1PersonaId != 0) {
            chain.tier2PersonaId = referrerChain.tier1PersonaId;
            if (referrerChain.tier2PersonaId != 0) {
                chain.tier3PersonaId = referrerChain.tier2PersonaId;
            }
        }
        
        _referralChains[newPersonaId] = chain;
        
        // Update stats
        refCode.uses++;
        _referralCounts[refCode.personaId]++;
        totalReferrals++;
        
        // Distribute rewards if payment included
        if (msg.value > 0) {
            _distributeRewards(chain, msg.value);
        }
        
        // Update leaderboard
        _updateLeaderboard(refCode.personaId);
        
        emit ReferralUsed(newPersonaId, refCode.personaId, referralCode);
    }
    
    /**
     * @notice Distributes rewards through the referral chain
     */
    function _distributeRewards(ReferralChain memory chain, uint256 amount) internal {
        // Tier 1: Direct referrer
        if (chain.tier1PersonaId != 0) {
            IPersonaRegistry.Persona memory t1Persona = personaRegistry.getPersona(chain.tier1PersonaId);
            uint256 t1Reward = (amount * BASE_REFERRAL_REWARD) / PRECISION;
            
            _pendingRewards[t1Persona.owner] += t1Reward;
            _referralEarnings[chain.tier1PersonaId] += t1Reward;
            
            // Update referral code earnings
            bytes32 codeHash = _personaToCode[chain.tier1PersonaId];
            if (codeHash != bytes32(0)) {
                _referralCodes[codeHash].totalEarnings += t1Reward;
            }
            
            emit ReferralRewardEarned(chain.tier1PersonaId, t1Reward, 1);
        }
        
        // Tier 2: Referrer's referrer
        if (chain.tier2PersonaId != 0) {
            IPersonaRegistry.Persona memory t2Persona = personaRegistry.getPersona(chain.tier2PersonaId);
            uint256 t2Reward = (amount * TIER2_REWARD) / PRECISION;
            
            _pendingRewards[t2Persona.owner] += t2Reward;
            _referralEarnings[chain.tier2PersonaId] += t2Reward;
            
            emit ReferralRewardEarned(chain.tier2PersonaId, t2Reward, 2);
        }
        
        // Tier 3
        if (chain.tier3PersonaId != 0) {
            IPersonaRegistry.Persona memory t3Persona = personaRegistry.getPersona(chain.tier3PersonaId);
            uint256 t3Reward = (amount * TIER3_REWARD) / PRECISION;
            
            _pendingRewards[t3Persona.owner] += t3Reward;
            _referralEarnings[chain.tier3PersonaId] += t3Reward;
            
            emit ReferralRewardEarned(chain.tier3PersonaId, t3Reward, 3);
        }
    }
    
    /**
     * @notice Claims pending referral rewards
     */
    function claimRewards() external nonReentrant {
        uint256 amount = _pendingRewards[msg.sender];
        if (amount == 0) revert NoRewardsToClaim();
        
        _pendingRewards[msg.sender] = 0;
        totalRewardsPaid += amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit RewardsClaimed(msg.sender, amount);
    }

    // ============ View Functions ============
    
    function getReferralCode(string calldata code) external view returns (ReferralCode memory) {
        bytes32 codeHash = keccak256(abi.encodePacked(_toLowerCase(code)));
        return _referralCodes[codeHash];
    }
    
    function getPersonaReferralCode(uint256 personaId) external view returns (ReferralCode memory) {
        bytes32 codeHash = _personaToCode[personaId];
        if (codeHash == bytes32(0)) revert InvalidCode();
        return _referralCodes[codeHash];
    }
    
    function getReferralChain(uint256 personaId) external view returns (ReferralChain memory) {
        return _referralChains[personaId];
    }
    
    function getPendingRewards(address user) external view returns (uint256) {
        return _pendingRewards[user];
    }
    
    function getPersonaStats(uint256 personaId) external view returns (
        uint256 referralCount,
        uint256 totalEarnings
    ) {
        return (_referralCounts[personaId], _referralEarnings[personaId]);
    }
    
    /**
     * @notice Gets top referrers for leaderboard
     */
    function getLeaderboard(uint256 limit) external view returns (LeaderboardEntry[] memory) {
        uint256 size = limit < _topReferrerIds.length ? limit : _topReferrerIds.length;
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](size);
        
        for (uint256 i = 0; i < size; i++) {
            uint256 personaId = _topReferrerIds[i];
            entries[i] = LeaderboardEntry({
                personaId: personaId,
                referralCount: _referralCounts[personaId],
                totalEarnings: _referralEarnings[personaId]
            });
        }
        
        return entries;
    }
    
    function isValidCode(string calldata code) external view returns (bool) {
        bytes32 codeHash = keccak256(abi.encodePacked(_toLowerCase(code)));
        return _referralCodes[codeHash].active;
    }

    // ============ Internal Functions ============
    
    function _toLowerCase(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
    
    function _updateLeaderboard(uint256 personaId) internal {
        // Simple insertion sort for leaderboard
        // In production, would use more efficient data structure
        bool found = false;
        for (uint256 i = 0; i < _topReferrerIds.length; i++) {
            if (_topReferrerIds[i] == personaId) {
                found = true;
                break;
            }
        }
        
        if (!found && _topReferrerIds.length < MAX_LEADERBOARD_SIZE) {
            _topReferrerIds.push(personaId);
        }
        
        // Re-sort by referral count (bubble sort for simplicity)
        for (uint256 i = 0; i < _topReferrerIds.length; i++) {
            for (uint256 j = i + 1; j < _topReferrerIds.length; j++) {
                if (_referralCounts[_topReferrerIds[j]] > _referralCounts[_topReferrerIds[i]]) {
                    uint256 temp = _topReferrerIds[i];
                    _topReferrerIds[i] = _topReferrerIds[j];
                    _topReferrerIds[j] = temp;
                }
            }
        }
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    receive() external payable {}
}
