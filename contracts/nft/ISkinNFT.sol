// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title ISkinNFT
 * @notice Interface for the SkinNFT contract
 */
interface ISkinNFT {
    // Events
    event SkinMinted(
        uint256 indexed tokenId,
        uint256 indexed personaId,
        uint256 indexed professionId,
        uint8 tier
    );
    event SkinUpgraded(uint256 indexed tokenId, uint8 newTier);
    event SkinMetadataUpdated(uint256 indexed tokenId);

    // Structs
    struct Skin {
        uint256 tokenId;
        uint256 personaId;
        uint256 professionId;
        uint8 tier; // 1-4 skin tier
        uint8 level; // Synced from ProfessionRegistry
        string customImageUri; // Optional custom image
        uint256 mintedAt;
    }

    // View functions
    function getSkin(uint256 tokenId) external view returns (Skin memory);
    function getSkinsByPersona(uint256 personaId) external view returns (uint256[] memory);
    function getSkinByPersonaProfession(uint256 personaId, uint256 professionId) external view returns (Skin memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);

    // Mutative functions
    function mintSkin(uint256 personaId, uint256 professionId) external payable returns (uint256);
    function upgradeSkin(uint256 tokenId) external payable;
    function setCustomImage(uint256 tokenId, string calldata imageUri) external;

    // Admin functions
    function setBaseUri(string calldata newBaseUri) external;
    function setTierPrices(uint256[] calldata prices) external;
    function syncLevel(uint256 tokenId, uint8 newLevel) external;
}
