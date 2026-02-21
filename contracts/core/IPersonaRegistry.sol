// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title IPersonaRegistry
 * @notice Interface for the PersonaRegistry contract
 */
interface IPersonaRegistry {
    // Events
    event PersonaCreated(
        uint256 indexed personaId,
        address indexed owner,
        string displayName,
        uint256 price
    );
    event PersonaUpdated(uint256 indexed personaId, string displayName, string avatarUri);
    event PersonaActivityRecorded(uint256 indexed personaId, uint256 timestamp);
    event UpkeepPaid(uint256 indexed personaId, uint256 amount, uint256 paidUntil);
    event DecayApplied(uint256 indexed personaId, uint256 decayAmount);

    // Structs
    struct Persona {
        uint256 id;
        address owner;
        string displayName;
        string avatarUri;
        uint256 createdAt;
        uint256 lastActive;
        uint256 upkeepPaidUntil;
        bool exists;
    }

    // View functions
    function getPersona(uint256 personaId) external view returns (Persona memory);
    function getPersonasByOwner(address owner) external view returns (uint256[] memory);
    function getPersonaCount(address owner) external view returns (uint256);
    function getNextPersonaPrice(address owner) external view returns (uint256);
    function isPersonaActive(uint256 personaId) external view returns (bool);
    function getDecayAmount(uint256 personaId) external view returns (uint256);

    // Mutative functions
    function createPersona(string calldata displayName, string calldata avatarUri) external payable returns (uint256);
    function updatePersona(uint256 personaId, string calldata displayName, string calldata avatarUri) external;
    function recordActivity(uint256 personaId) external;
    function payUpkeep(uint256 personaId) external payable;

    // Admin functions
    function setBasePrice(uint256 newBasePrice) external;
    function setPriceMultiplier(uint256 newMultiplier) external;
    function setDecayRate(uint256 newDecayRate) external;
    function setUpkeepPeriod(uint256 newPeriod) external;
    function withdraw(address payable to) external;
}
