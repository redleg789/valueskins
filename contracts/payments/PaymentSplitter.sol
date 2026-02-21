// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title PaymentSplitter
 * @author Valueskins Team
 * @notice Centralized fee collection and distribution
 * @dev All platform contracts can send fees here for unified management
 * 
 * Key Features:
 * - Receives fees from all platform contracts
 * - Configurable split between treasury, team, and reserves
 * - Batch withdrawal functionality
 * - Fee tracking per source
 */
contract PaymentSplitter is 
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuard,
    UUPSUpgradeable
{
    // ============ Constants ============
    
    /// @notice Precision for percentage calculations (100% = 10000)
    uint256 public constant PRECISION = 10000;
    
    /// @notice Maximum number of payees
    uint256 public constant MAX_PAYEES = 10;

    // ============ Structs ============
    
    struct Payee {
        address payable addr;
        uint256 share; // In PRECISION (e.g., 5000 = 50%)
        string name;
    }

    // ============ State Variables ============
    
    /// @notice Array of payees
    Payee[] public payees;
    
    /// @notice Total shares (should equal PRECISION)
    uint256 public totalShares;
    
    /// @notice Mapping of source address to total received
    mapping(address => uint256) public receivedFromSource;
    
    /// @notice Mapping of payee address to total released
    mapping(address => uint256) public releasedToPayee;
    
    /// @notice Total amount received
    uint256 public totalReceived;
    
    /// @notice Total amount released
    uint256 public totalReleased;
    
    /// @notice Authorized sources that can deposit
    mapping(address => bool) public authorizedSources;

    // ============ Events ============
    
    event PaymentReceived(address indexed from, uint256 amount);
    event PaymentReleased(address indexed to, uint256 amount);
    event PayeesUpdated(Payee[] payees);
    event SourceAuthorized(address indexed source, bool authorized);

    // ============ Errors ============
    
    error InvalidShares();
    error TooManyPayees();
    error NoPayeesToRelease();
    error TransferFailed();
    error ZeroAddress();
    error ZeroAmount();

    // ============ Initializer ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @notice Initializes the contract with initial payees
     * @param owner_ The owner address
     * @param initialPayees_ Initial payee configurations
     */
    function initialize(
        address owner_,
        Payee[] calldata initialPayees_
    ) external initializer {
        if (owner_ == address(0)) revert ZeroAddress();
        
        __Ownable_init(owner_);
        
        _setPayees(initialPayees_);
    }

    // ============ External Functions ============
    
    /**
     * @notice Releases pending payments to all payees
     */
    function releaseAll() external nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert ZeroAmount();
        if (payees.length == 0) revert NoPayeesToRelease();
        
        for (uint256 i = 0; i < payees.length; i++) {
            uint256 payment = (balance * payees[i].share) / PRECISION;
            if (payment > 0) {
                releasedToPayee[payees[i].addr] += payment;
                totalReleased += payment;
                
                (bool success, ) = payees[i].addr.call{value: payment}("");
                if (!success) revert TransferFailed();
                
                emit PaymentReleased(payees[i].addr, payment);
            }
        }
    }
    
    /**
     * @notice Releases payment to a specific payee
     * @param payeeIndex The index of the payee
     */
    function releaseToPayee(uint256 payeeIndex) external nonReentrant {
        if (payeeIndex >= payees.length) revert NoPayeesToRelease();
        
        uint256 balance = address(this).balance;
        if (balance == 0) revert ZeroAmount();
        
        uint256 payment = (balance * payees[payeeIndex].share) / PRECISION;
        if (payment == 0) revert ZeroAmount();
        
        releasedToPayee[payees[payeeIndex].addr] += payment;
        totalReleased += payment;
        
        (bool success, ) = payees[payeeIndex].addr.call{value: payment}("");
        if (!success) revert TransferFailed();
        
        emit PaymentReleased(payees[payeeIndex].addr, payment);
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Updates the payee configuration
     * @param newPayees New payee array
     */
    function setPayees(Payee[] calldata newPayees) external onlyOwner {
        _setPayees(newPayees);
    }
    
    /**
     * @notice Authorizes or deauthorizes a source
     * @param source The source address
     * @param authorized Whether the source is authorized
     */
    function setAuthorizedSource(address source, bool authorized) external onlyOwner {
        authorizedSources[source] = authorized;
        emit SourceAuthorized(source, authorized);
    }
    
    /**
     * @notice Emergency withdrawal of all funds to owner
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert ZeroAmount();
        
        (bool success, ) = owner().call{value: balance}("");
        if (!success) revert TransferFailed();
        
        emit PaymentReleased(owner(), balance);
    }

    // ============ View Functions ============
    
    /**
     * @notice Gets all payees
     * @return Array of Payee structs
     */
    function getPayees() external view returns (Payee[] memory) {
        return payees;
    }
    
    /**
     * @notice Gets the pending payment for a payee
     * @param payeeIndex The payee index
     * @return The pending payment amount
     */
    function getPendingPayment(uint256 payeeIndex) external view returns (uint256) {
        if (payeeIndex >= payees.length) return 0;
        return (address(this).balance * payees[payeeIndex].share) / PRECISION;
    }
    
    /**
     * @notice Gets the total pending payment
     * @return The total pending amount
     */
    function getTotalPending() external view returns (uint256) {
        return address(this).balance;
    }

    // ============ Internal Functions ============
    
    /**
     * @notice Internal function to set payees
     * @param newPayees New payee array
     */
    function _setPayees(Payee[] calldata newPayees) internal {
        if (newPayees.length > MAX_PAYEES) revert TooManyPayees();
        
        // Calculate total shares
        uint256 newTotalShares = 0;
        for (uint256 i = 0; i < newPayees.length; i++) {
            if (newPayees[i].addr == address(0)) revert ZeroAddress();
            newTotalShares += newPayees[i].share;
        }
        
        if (newTotalShares != PRECISION) revert InvalidShares();
        
        // Clear existing payees
        delete payees;
        
        // Add new payees
        for (uint256 i = 0; i < newPayees.length; i++) {
            payees.push(newPayees[i]);
        }
        
        totalShares = PRECISION;
        
        emit PayeesUpdated(payees);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ============ Receive ============
    
    /**
     * @notice Receives ETH and tracks the source
     */
    receive() external payable {
        if (msg.value == 0) revert ZeroAmount();
        
        receivedFromSource[msg.sender] += msg.value;
        totalReceived += msg.value;
        
        emit PaymentReceived(msg.sender, msg.value);
    }
}
