// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ERC721EnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {ISkinNFT} from "./ISkinNFT.sol";
import {IPersonaRegistry} from "../core/IPersonaRegistry.sol";
import {IProfessionRegistry} from "../core/IProfessionRegistry.sol";

/**
 * @title SkinNFT
 * @author Valueskins Team
 * @notice ERC-721 skins bound to personas with dynamic metadata
 * @dev Skins are soulbound to personas (non-transferable between personas)
 * 
 * Key Features:
 * - One skin per persona-profession pair
 * - 4 tier system (upgradeable by payment)
 * - Dynamic metadata reflecting current level
 * - On-chain SVG rendering for base skins
 * - Custom image upload support
 */
contract SkinNFT is 
    ISkinNFT,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuard,
    UUPSUpgradeable
{
    using Strings for uint256;
    using Strings for uint8;

    // ============ Constants ============
    
    uint8 public constant MAX_TIER = 4;

    // ============ State Variables ============
    
    /// @notice Reference to PersonaRegistry
    IPersonaRegistry public personaRegistry;
    
    /// @notice Reference to ProfessionRegistry
    IProfessionRegistry public professionRegistry;
    
    /// @notice Token ID counter
    uint256 private _tokenIdCounter;
    
    /// @notice Base URI for metadata
    string public baseUri;
    
    /// @notice Prices for each tier upgrade (index 0 = mint price, 1-3 = upgrade to tier 2-4)
    uint256[4] public tierPrices;
    
    /// @notice Mapping of token ID to Skin data
    mapping(uint256 => Skin) private _skins;
    
    /// @notice Mapping of personaId => professionId => tokenId
    mapping(uint256 => mapping(uint256 => uint256)) private _personaProfessionToToken;
    
    /// @notice Mapping of personaId => array of token IDs
    mapping(uint256 => uint256[]) private _personaTokens;

    // ============ Errors ============
    
    error InsufficientPayment(uint256 required, uint256 provided);
    error SkinAlreadyExists(uint256 personaId, uint256 professionId);
    error SkinDoesNotExist(uint256 tokenId);
    error NotPersonaOwner(uint256 personaId, address caller);
    error NotSkinOwner(uint256 tokenId, address caller);
    error MaxTierReached(uint256 tokenId);
    error PersonaDoesNotHaveProfession(uint256 personaId, uint256 professionId);
    error InvalidParameter(string param);
    error TransferFailed();
    error ZeroAddress();
    error SoulboundToken();

    // ============ Initializer ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @notice Initializes the contract
     * @param owner_ The owner address
     * @param personaRegistry_ The PersonaRegistry contract address
     * @param professionRegistry_ The ProfessionRegistry contract address
     */
    function initialize(
        address owner_,
        address personaRegistry_,
        address professionRegistry_
    ) external initializer {
        if (owner_ == address(0) || personaRegistry_ == address(0) || professionRegistry_ == address(0)) {
            revert ZeroAddress();
        }
        
        __ERC721_init("Valueskins", "VSKIN");
        __ERC721Enumerable_init();
        __Ownable_init(owner_);
        
        personaRegistry = IPersonaRegistry(personaRegistry_);
        professionRegistry = IProfessionRegistry(professionRegistry_);
        
        // Default tier prices
        tierPrices[0] = 0.005 ether; // Mint tier 1
        tierPrices[1] = 0.01 ether;  // Upgrade to tier 2
        tierPrices[2] = 0.02 ether;  // Upgrade to tier 3
        tierPrices[3] = 0.05 ether;  // Upgrade to tier 4
        
        _tokenIdCounter = 1;
    }

    // ============ External Functions ============
    
    /**
     * @notice Mints a skin for a persona-profession pair
     * @param personaId The persona ID
     * @param professionId The profession ID
     * @return tokenId The minted token ID
     */
    function mintSkin(
        uint256 personaId,
        uint256 professionId
    ) external payable nonReentrant returns (uint256 tokenId) {
        // Validate persona ownership
        IPersonaRegistry.Persona memory persona = personaRegistry.getPersona(personaId);
        if (persona.owner != msg.sender) {
            revert NotPersonaOwner(personaId, msg.sender);
        }
        
        // Validate persona has this profession
        try professionRegistry.getPersonaProfession(personaId, professionId) returns (
            IProfessionRegistry.PersonaProfession memory pp
        ) {
            if (!pp.exists) revert PersonaDoesNotHaveProfession(personaId, professionId);
        } catch {
            revert PersonaDoesNotHaveProfession(personaId, professionId);
        }
        
        // Check skin doesn't already exist
        if (_personaProfessionToToken[personaId][professionId] != 0) {
            revert SkinAlreadyExists(personaId, professionId);
        }
        
        // Check payment
        if (msg.value < tierPrices[0]) {
            revert InsufficientPayment(tierPrices[0], msg.value);
        }
        
        // Mint token
        tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        
        // Get current level from profession registry
        IProfessionRegistry.PersonaProfession memory currentPp = professionRegistry.getPersonaProfession(personaId, professionId);
        
        _skins[tokenId] = Skin({
            tokenId: tokenId,
            personaId: personaId,
            professionId: professionId,
            tier: 1,
            level: currentPp.level,
            customImageUri: "",
            mintedAt: block.timestamp
        });
        
        _personaProfessionToToken[personaId][professionId] = tokenId;
        _personaTokens[personaId].push(tokenId);
        
        emit SkinMinted(tokenId, personaId, professionId, 1);
        
        // Refund excess
        if (msg.value > tierPrices[0]) {
            (bool success, ) = msg.sender.call{value: msg.value - tierPrices[0]}("");
            if (!success) revert TransferFailed();
        }
    }
    
    /**
     * @notice Upgrades a skin to the next tier
     * @param tokenId The token ID to upgrade
     */
    function upgradeSkin(uint256 tokenId) external payable nonReentrant {
        _requireSkinOwner(tokenId);
        
        Skin storage skin = _skins[tokenId];
        if (skin.tier >= MAX_TIER) revert MaxTierReached(tokenId);
        
        uint256 upgradePrice = tierPrices[skin.tier];
        if (msg.value < upgradePrice) {
            revert InsufficientPayment(upgradePrice, msg.value);
        }
        
        skin.tier++;
        
        emit SkinUpgraded(tokenId, skin.tier);
        
        // Refund excess
        if (msg.value > upgradePrice) {
            (bool success, ) = msg.sender.call{value: msg.value - upgradePrice}("");
            if (!success) revert TransferFailed();
        }
    }
    
    /**
     * @notice Sets a custom image for a skin
     * @param tokenId The token ID
     * @param imageUri The custom image URI (IPFS recommended)
     */
    function setCustomImage(uint256 tokenId, string calldata imageUri) external {
        _requireSkinOwner(tokenId);
        
        _skins[tokenId].customImageUri = imageUri;
        
        emit SkinMetadataUpdated(tokenId);
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Syncs level from ProfessionRegistry (called by oracle/keeper)
     * @param tokenId The token ID
     * @param newLevel The new level
     */
    function syncLevel(uint256 tokenId, uint8 newLevel) external onlyOwner {
        if (!_skinExists(tokenId)) revert SkinDoesNotExist(tokenId);
        
        _skins[tokenId].level = newLevel;
        
        emit SkinMetadataUpdated(tokenId);
    }
    
    function setBaseUri(string calldata newBaseUri) external onlyOwner {
        baseUri = newBaseUri;
    }
    
    function setTierPrices(uint256[] calldata prices) external onlyOwner {
        if (prices.length != 4) revert InvalidParameter("prices length");
        for (uint256 i = 0; i < 4; i++) {
            tierPrices[i] = prices[i];
        }
    }
    
    function setPersonaRegistry(address newRegistry) external onlyOwner {
        if (newRegistry == address(0)) revert ZeroAddress();
        personaRegistry = IPersonaRegistry(newRegistry);
    }
    
    function setProfessionRegistry(address newRegistry) external onlyOwner {
        if (newRegistry == address(0)) revert ZeroAddress();
        professionRegistry = IProfessionRegistry(newRegistry);
    }
    
    function withdraw(address payable to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        (bool success, ) = to.call{value: address(this).balance}("");
        if (!success) revert TransferFailed();
    }

    // ============ View Functions ============
    
    function getSkin(uint256 tokenId) external view returns (Skin memory) {
        if (!_skinExists(tokenId)) revert SkinDoesNotExist(tokenId);
        return _skins[tokenId];
    }
    
    function getSkinsByPersona(uint256 personaId) external view returns (uint256[] memory) {
        return _personaTokens[personaId];
    }
    
    function getSkinByPersonaProfession(
        uint256 personaId,
        uint256 professionId
    ) external view returns (Skin memory) {
        uint256 tokenId = _personaProfessionToToken[personaId][professionId];
        if (tokenId == 0) revert SkinDoesNotExist(0);
        return _skins[tokenId];
    }
    
    /**
     * @notice Returns the token URI with on-chain or off-chain metadata
     * @param tokenId The token ID
     * @return The token URI
     */
    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable, ISkinNFT) returns (string memory) {
        if (!_skinExists(tokenId)) revert SkinDoesNotExist(tokenId);
        
        Skin storage skin = _skins[tokenId];
        
        // If base URI is set, use off-chain metadata
        if (bytes(baseUri).length > 0) {
            return string(abi.encodePacked(baseUri, tokenId.toString()));
        }
        
        // Otherwise, generate on-chain metadata
        string memory image = _generateSVG(skin);
        
        string memory json = string(abi.encodePacked(
            '{"name":"Valueskin #', tokenId.toString(), '",',
            '"description":"A Valueskins reputation NFT",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(image)), '",',
            '"attributes":[',
                '{"trait_type":"Persona ID","value":', skin.personaId.toString(), '},',
                '{"trait_type":"Profession ID","value":', skin.professionId.toString(), '},',
                '{"trait_type":"Tier","value":', uint256(skin.tier).toString(), '},',
                '{"trait_type":"Level","value":', uint256(skin.level).toString(), '}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    // ============ Internal Functions ============
    
    function _skinExists(uint256 tokenId) internal view returns (bool) {
        return _skins[tokenId].tokenId != 0;
    }
    
    function _requireSkinOwner(uint256 tokenId) internal view {
        if (!_skinExists(tokenId)) revert SkinDoesNotExist(tokenId);
        if (ownerOf(tokenId) != msg.sender) revert NotSkinOwner(tokenId, msg.sender);
    }
    
    /**
     * @notice Generates an SVG image for the skin
     * @param skin The skin data
     * @return The SVG string
     */
    function _generateSVG(Skin storage skin) internal view returns (string memory) {
        // Get profession name
        string memory professionName;
        try professionRegistry.getProfession(skin.professionId) returns (
            IProfessionRegistry.Profession memory prof
        ) {
            professionName = prof.name;
        } catch {
            professionName = "Unknown";
        }
        
        // Color based on tier
        string memory gradientStart;
        string memory gradientEnd;
        if (skin.tier == 1) {
            gradientStart = "#718096";
            gradientEnd = "#4A5568";
        } else if (skin.tier == 2) {
            gradientStart = "#4299E1";
            gradientEnd = "#3182CE";
        } else if (skin.tier == 3) {
            gradientStart = "#9F7AEA";
            gradientEnd = "#805AD5";
        } else {
            gradientStart = "#F6E05E";
            gradientEnd = "#D69E2E";
        }
        
        // Generate level stars
        string memory stars = "";
        for (uint8 i = 0; i < skin.level; i++) {
            stars = string(abi.encodePacked(
                stars,
                '<text x="', (120 + i * 30).toString(), '" y="280" font-size="24">&#9733;</text>'
            ));
        }
        
        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">',
            '<defs>',
                '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
                    '<stop offset="0%" style="stop-color:', gradientStart, '"/>',
                    '<stop offset="100%" style="stop-color:', gradientEnd, '"/>',
                '</linearGradient>',
            '</defs>',
            '<rect width="300" height="400" fill="url(#bg)" rx="20"/>',
            '<rect x="20" y="20" width="260" height="360" fill="rgba(255,255,255,0.1)" rx="15"/>',
            '<text x="150" y="80" font-family="Arial" font-size="24" fill="white" text-anchor="middle" font-weight="bold">VALUESKIN</text>',
            '<circle cx="150" cy="160" r="50" fill="rgba(255,255,255,0.2)"/>',
            '<text x="150" y="170" font-size="32" text-anchor="middle">&#128100;</text>',
            '<text x="150" y="240" font-family="Arial" font-size="16" fill="white" text-anchor="middle">', professionName, '</text>',
            '<g fill="#FFD700">', stars, '</g>',
            '<text x="150" y="340" font-family="Arial" font-size="14" fill="rgba(255,255,255,0.7)" text-anchor="middle">Tier ', uint256(skin.tier).toString(), '</text>',
            '</svg>'
        ));
    }
    
    /**
     * @dev Skins are soulbound - prevent all transfers except minting
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) but block transfers
        if (from != address(0) && to != address(0)) {
            revert SoulboundToken();
        }
        
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._increaseBalance(account, value);
    }
    
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Upgradeable, ERC721EnumerableUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ============ Receive ============
    
    receive() external payable {}
}
