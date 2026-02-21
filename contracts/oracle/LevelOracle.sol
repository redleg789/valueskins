// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IProfessionRegistry} from "../core/IProfessionRegistry.sol";

/**
 * @title LevelOracle
 * @author Valueskins Team
 * @notice Bridge between off-chain scoring engine and on-chain level updates
 * @dev Receives signed level updates from authorized oracle and pushes to contracts
 * 
 * Key Features:
 * - Receives batch level updates from off-chain scoring
 * - Pushes updates to ProfessionRegistry
 * - Maintains update history for auditing
 * - Rate limiting to prevent spam
 */
contract LevelOracle is 
    Initializable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    // ============ Constants ============
    
    /// @notice Maximum batch size for updates
    uint256 public constant MAX_BATCH_SIZE = 100;
    
    /// @notice Minimum time between updates for same persona-profession (anti-spam)
    uint256 public constant MIN_UPDATE_INTERVAL = 1 hours;

    // ============ Structs ============
    
    struct LevelUpdate {
        uint256 personaId;
        uint256 professionId;
        uint8 newLevel;
        uint256 realScore;
        uint256 timestamp;
    }

    // ============ State Variables ============
    
    /// @notice Reference to ProfessionRegistry
    IProfessionRegistry public professionRegistry;
    
    /// @notice Authorized oracle signers
    mapping(address => bool) public authorizedOracles;
    
    /// @notice Last update timestamp for persona-profession pair
    mapping(bytes32 => uint256) public lastUpdateTimestamp;
    
    /// @notice Total updates processed
    uint256 public totalUpdatesProcessed;
    
    /// @notice Nonce for replay protection
    uint256 public nonce;

    // ============ Events ============
    
    event OracleAuthorized(address indexed oracle, bool authorized);
    event LevelUpdateProcessed(
        uint256 indexed personaId,
        uint256 indexed professionId,
        uint8 oldLevel,
        uint8 newLevel,
        uint256 realScore
    );
    event BatchUpdateProcessed(uint256 count, uint256 newNonce);

    // ============ Errors ============
    
    error NotAuthorizedOracle(address caller);
    error BatchTooLarge(uint256 size);
    error UpdateTooFrequent(uint256 personaId, uint256 professionId);
    error InvalidNonce(uint256 expected, uint256 provided);
    error ZeroAddress();
    error EmptyBatch();

    // ============ Modifiers ============
    
    modifier onlyOracle() {
        if (!authorizedOracles[msg.sender]) revert NotAuthorizedOracle(msg.sender);
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
     * @param professionRegistry_ The ProfessionRegistry contract address
     * @param initialOracle_ Initial authorized oracle address
     */
    function initialize(
        address owner_,
        address professionRegistry_,
        address initialOracle_
    ) external initializer {
        if (owner_ == address(0) || professionRegistry_ == address(0) || initialOracle_ == address(0)) {
            revert ZeroAddress();
        }
        
        __Ownable_init(owner_);
        
        professionRegistry = IProfessionRegistry(professionRegistry_);
        authorizedOracles[initialOracle_] = true;
        
        emit OracleAuthorized(initialOracle_, true);
    }

    // ============ Oracle Functions ============
    
    /**
     * @notice Processes a single level update
     * @param personaId The persona ID
     * @param professionId The profession ID
     * @param newLevel The new visible level (1-4)
     * @param realScore The hidden real score (0-10000)
     */
    function updateLevel(
        uint256 personaId,
        uint256 professionId,
        uint8 newLevel,
        uint256 realScore
    ) external onlyOracle {
        _processUpdate(personaId, professionId, newLevel, realScore);
    }
    
    /**
     * @notice Processes a batch of level updates
     * @param updates Array of LevelUpdate structs
     * @param expectedNonce Expected nonce for replay protection
     */
    function batchUpdateLevels(
        LevelUpdate[] calldata updates,
        uint256 expectedNonce
    ) external onlyOracle {
        if (updates.length == 0) revert EmptyBatch();
        if (updates.length > MAX_BATCH_SIZE) revert BatchTooLarge(updates.length);
        if (expectedNonce != nonce) revert InvalidNonce(nonce, expectedNonce);
        
        for (uint256 i = 0; i < updates.length; i++) {
            _processUpdate(
                updates[i].personaId,
                updates[i].professionId,
                updates[i].newLevel,
                updates[i].realScore
            );
        }
        
        nonce++;
        
        emit BatchUpdateProcessed(updates.length, nonce);
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Authorizes or deauthorizes an oracle
     * @param oracle The oracle address
     * @param authorized Whether the oracle is authorized
     */
    function setAuthorizedOracle(address oracle, bool authorized) external onlyOwner {
        if (oracle == address(0)) revert ZeroAddress();
        authorizedOracles[oracle] = authorized;
        emit OracleAuthorized(oracle, authorized);
    }
    
    /**
     * @notice Updates the ProfessionRegistry reference
     * @param newRegistry The new ProfessionRegistry address
     */
    function setProfessionRegistry(address newRegistry) external onlyOwner {
        if (newRegistry == address(0)) revert ZeroAddress();
        professionRegistry = IProfessionRegistry(newRegistry);
    }
    
    /**
     * @notice Resets nonce (emergency only)
     * @param newNonce The new nonce value
     */
    function resetNonce(uint256 newNonce) external onlyOwner {
        nonce = newNonce;
    }

    // ============ View Functions ============
    
    /**
     * @notice Gets the key for persona-profession pair
     * @param personaId The persona ID
     * @param professionId The profession ID
     * @return The bytes32 key
     */
    function getUpdateKey(uint256 personaId, uint256 professionId) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(personaId, professionId));
    }
    
    /**
     * @notice Checks if an update is allowed (rate limiting)
     * @param personaId The persona ID
     * @param professionId The profession ID
     * @return Whether the update is allowed
     */
    function canUpdate(uint256 personaId, uint256 professionId) external view returns (bool) {
        bytes32 key = getUpdateKey(personaId, professionId);
        return block.timestamp >= lastUpdateTimestamp[key] + MIN_UPDATE_INTERVAL;
    }
    
    /**
     * @notice Gets the current nonce
     * @return The current nonce
     */
    function getCurrentNonce() external view returns (uint256) {
        return nonce;
    }

    // ============ Internal Functions ============
    
    /**
     * @notice Internal function to process a single update
     */
    function _processUpdate(
        uint256 personaId,
        uint256 professionId,
        uint8 newLevel,
        uint256 realScore
    ) internal {
        bytes32 key = getUpdateKey(personaId, professionId);
        
        // Rate limiting check
        if (block.timestamp < lastUpdateTimestamp[key] + MIN_UPDATE_INTERVAL) {
            revert UpdateTooFrequent(personaId, professionId);
        }
        
        // Get current level for event
        uint8 oldLevel = 0;
        try professionRegistry.getPersonaProfession(personaId, professionId) returns (
            IProfessionRegistry.PersonaProfession memory pp
        ) {
            oldLevel = pp.level;
        } catch {
            // Persona-profession doesn't exist, skip
            return;
        }
        
        // Update in ProfessionRegistry
        professionRegistry.updateLevel(personaId, professionId, newLevel, realScore);
        
        // Update tracking
        lastUpdateTimestamp[key] = block.timestamp;
        totalUpdatesProcessed++;
        
        emit LevelUpdateProcessed(personaId, professionId, oldLevel, newLevel, realScore);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
