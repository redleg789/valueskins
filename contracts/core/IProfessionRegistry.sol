// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title IProfessionRegistry
 * @notice Interface for the ProfessionRegistry contract
 */
interface IProfessionRegistry {
    // Events
    event ProfessionCreated(uint256 indexed professionId, string name, string category);
    event ProfessionUpdated(uint256 indexed professionId, string name, bool isActive);
    event ProfessionsMerged(uint256[] fromIds, uint256 indexed toId);
    event ProfessionAdded(uint256 indexed personaId, uint256 indexed professionId, uint256 price);
    event ProfessionRemoved(uint256 indexed personaId, uint256 indexed professionId);
    event LevelUpdated(uint256 indexed personaId, uint256 indexed professionId, uint8 newLevel);

    // Structs
    struct Profession {
        uint256 id;
        string name;
        string category;
        string description;
        bool isActive;
        uint256 createdAt;
    }

    struct PersonaProfession {
        uint256 professionId;
        uint8 level; // 1-5 visible level
        uint256 realScore; // Hidden score (basis points, 0-10000)
        uint256 addedAt;
        uint256 lastLevelChange;
        bool exists;
    }

    // View functions
    function getProfession(uint256 professionId) external view returns (Profession memory);
    function getActiveProfessions() external view returns (Profession[] memory);
    function getPersonaProfessions(uint256 personaId) external view returns (PersonaProfession[] memory);
    function getPersonaProfession(uint256 personaId, uint256 professionId) external view returns (PersonaProfession memory);
    function getProfessionAddPrice() external view returns (uint256);

    // User functions
    function addProfessionToPersona(uint256 personaId, uint256 professionId) external payable;

    // Oracle functions
    function updateLevel(uint256 personaId, uint256 professionId, uint8 newLevel, uint256 realScore) external;

    // Admin functions
    function createProfession(string calldata name, string calldata category, string calldata description) external returns (uint256);
    function updateProfession(uint256 professionId, string calldata name, bool isActive) external;
    function mergeProfessions(uint256[] calldata fromIds, uint256 toId) external;
    function setProfessionAddPrice(uint256 newPrice) external;
}
