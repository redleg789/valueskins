// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console2} from "forge-std/Test.sol";
import {SkinNFT} from "../nft/SkinNFT.sol";
import {ISkinNFT} from "../nft/ISkinNFT.sol";
import {PersonaRegistry} from "../core/PersonaRegistry.sol";
import {ProfessionRegistry} from "../core/ProfessionRegistry.sol";
import {ValueskinProxy} from "../proxy/ValueskinProxy.sol";

/**
 * @title SkinNFTTest
 * @notice Tests for SkinNFT contract
 */
contract SkinNFTTest is Test {
    SkinNFT public skinNFT;
    PersonaRegistry public personaRegistry;
    ProfessionRegistry public professionRegistry;
    
    address public owner = makeAddr("owner");
    address public oracle = makeAddr("oracle");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    
    uint256 public personaId;
    uint256 public professionId;

    function setUp() public {
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        
        // Deploy PersonaRegistry
        PersonaRegistry personaImpl = new PersonaRegistry();
        bytes memory personaData = abi.encodeCall(
            PersonaRegistry.initialize,
            (owner, 0.01 ether, 20000)
        );
        ValueskinProxy personaProxy = new ValueskinProxy(address(personaImpl), personaData);
        personaRegistry = PersonaRegistry(payable(address(personaProxy)));
        
        // Deploy ProfessionRegistry
        ProfessionRegistry professionImpl = new ProfessionRegistry();
        bytes memory professionData = abi.encodeCall(
            ProfessionRegistry.initialize,
            (owner, address(personaRegistry), oracle, 0.005 ether)
        );
        ValueskinProxy professionProxy = new ValueskinProxy(address(professionImpl), professionData);
        professionRegistry = ProfessionRegistry(payable(address(professionProxy)));
        
        // Deploy SkinNFT
        SkinNFT skinImpl = new SkinNFT();
        bytes memory skinData = abi.encodeCall(
            SkinNFT.initialize,
            (owner, address(personaRegistry), address(professionRegistry))
        );
        ValueskinProxy skinProxy = new ValueskinProxy(address(skinImpl), skinData);
        skinNFT = SkinNFT(payable(address(skinProxy)));
        
        // Setup: Create persona and profession
        vm.prank(owner);
        professionId = professionRegistry.createProfession("Photographer", "Content", "Photo creator");
        
        vm.prank(user1);
        personaId = personaRegistry.createPersona{value: 0.01 ether}("Alice", "");
        
        vm.prank(user1);
        professionRegistry.addProfessionToPersona{value: 0.005 ether}(personaId, professionId);
    }

    // ============ Minting Tests ============

    function test_MintSkin() public {
        uint256 mintPrice = skinNFT.tierPrices(0);
        
        vm.prank(user1);
        uint256 tokenId = skinNFT.mintSkin{value: mintPrice}(personaId, professionId);
        
        assertEq(tokenId, 1);
        assertEq(skinNFT.ownerOf(tokenId), user1);
        
        ISkinNFT.Skin memory skin = skinNFT.getSkin(tokenId);
        assertEq(skin.personaId, personaId);
        assertEq(skin.professionId, professionId);
        assertEq(skin.tier, 1);
        assertEq(skin.level, 1);
    }

    function test_MintSkin_NotPersonaOwner() public {
        uint256 mintPrice = skinNFT.tierPrices(0);
        
        vm.prank(user2);
        vm.expectRevert(
            abi.encodeWithSelector(
                SkinNFT.NotPersonaOwner.selector,
                personaId,
                user2
            )
        );
        skinNFT.mintSkin{value: mintPrice}(personaId, professionId);
    }

    function test_MintSkin_NoProfession() public {
        // Create new persona without profession
        vm.prank(user1);
        uint256 newPersonaId = personaRegistry.createPersona{value: 0.02 ether}("Bob", "");
        
        uint256 mintPrice = skinNFT.tierPrices(0);
        
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                SkinNFT.PersonaDoesNotHaveProfession.selector,
                newPersonaId,
                professionId
            )
        );
        skinNFT.mintSkin{value: mintPrice}(newPersonaId, professionId);
    }

    function test_MintSkin_AlreadyExists() public {
        uint256 mintPrice = skinNFT.tierPrices(0);
        
        vm.prank(user1);
        skinNFT.mintSkin{value: mintPrice}(personaId, professionId);
        
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                SkinNFT.SkinAlreadyExists.selector,
                personaId,
                professionId
            )
        );
        skinNFT.mintSkin{value: mintPrice}(personaId, professionId);
    }

    // ============ Upgrade Tests ============

    function test_UpgradeSkin() public {
        uint256 mintPrice = skinNFT.tierPrices(0);
        
        vm.prank(user1);
        uint256 tokenId = skinNFT.mintSkin{value: mintPrice}(personaId, professionId);
        
        // Upgrade to tier 2
        uint256 upgradePrice1 = skinNFT.tierPrices(1);
        vm.prank(user1);
        skinNFT.upgradeSkin{value: upgradePrice1}(tokenId);
        
        ISkinNFT.Skin memory skin = skinNFT.getSkin(tokenId);
        assertEq(skin.tier, 2);
        
        // Upgrade to tier 3
        uint256 upgradePrice2 = skinNFT.tierPrices(2);
        vm.prank(user1);
        skinNFT.upgradeSkin{value: upgradePrice2}(tokenId);
        
        skin = skinNFT.getSkin(tokenId);
        assertEq(skin.tier, 3);
        
        // Upgrade to tier 4
        uint256 upgradePrice3 = skinNFT.tierPrices(3);
        vm.prank(user1);
        skinNFT.upgradeSkin{value: upgradePrice3}(tokenId);
        
        skin = skinNFT.getSkin(tokenId);
        assertEq(skin.tier, 4);
    }

    function test_UpgradeSkin_MaxTierReached() public {
        vm.startPrank(user1);
        
        uint256 tokenId = skinNFT.mintSkin{value: 0.005 ether}(personaId, professionId);
        skinNFT.upgradeSkin{value: 0.01 ether}(tokenId);
        skinNFT.upgradeSkin{value: 0.02 ether}(tokenId);
        skinNFT.upgradeSkin{value: 0.05 ether}(tokenId);
        
        vm.expectRevert(
            abi.encodeWithSelector(SkinNFT.MaxTierReached.selector, tokenId)
        );
        skinNFT.upgradeSkin{value: 1 ether}(tokenId);
        
        vm.stopPrank();
    }

    // ============ Soulbound Tests ============

    function test_CannotTransfer() public {
        uint256 mintPrice = skinNFT.tierPrices(0);
        
        vm.prank(user1);
        uint256 tokenId = skinNFT.mintSkin{value: mintPrice}(personaId, professionId);
        
        vm.prank(user1);
        vm.expectRevert(SkinNFT.SoulboundToken.selector);
        skinNFT.transferFrom(user1, user2, tokenId);
    }

    // ============ Metadata Tests ============

    function test_TokenURI_OnChain() public {
        uint256 mintPrice = skinNFT.tierPrices(0);
        
        vm.prank(user1);
        uint256 tokenId = skinNFT.mintSkin{value: mintPrice}(personaId, professionId);
        
        string memory uri = skinNFT.tokenURI(tokenId);
        
        // Should start with data:application/json;base64
        assertTrue(bytes(uri).length > 0);
        assertTrue(_startsWith(uri, "data:application/json;base64"));
    }

    function test_SetCustomImage() public {
        uint256 mintPrice = skinNFT.tierPrices(0);
        
        vm.prank(user1);
        uint256 tokenId = skinNFT.mintSkin{value: mintPrice}(personaId, professionId);
        
        vm.prank(user1);
        skinNFT.setCustomImage(tokenId, "ipfs://custom-image");
        
        ISkinNFT.Skin memory skin = skinNFT.getSkin(tokenId);
        assertEq(skin.customImageUri, "ipfs://custom-image");
    }

    // ============ Query Tests ============

    function test_GetSkinsByPersona() public {
        // Add another profession
        vm.prank(owner);
        uint256 professionId2 = professionRegistry.createProfession("Writer", "Content", "Writer");
        
        vm.prank(user1);
        professionRegistry.addProfessionToPersona{value: 0.005 ether}(personaId, professionId2);
        
        // Mint skins for both professions
        vm.startPrank(user1);
        uint256 tokenId1 = skinNFT.mintSkin{value: 0.005 ether}(personaId, professionId);
        uint256 tokenId2 = skinNFT.mintSkin{value: 0.005 ether}(personaId, professionId2);
        vm.stopPrank();
        
        uint256[] memory tokens = skinNFT.getSkinsByPersona(personaId);
        assertEq(tokens.length, 2);
        assertEq(tokens[0], tokenId1);
        assertEq(tokens[1], tokenId2);
    }

    function test_GetSkinByPersonaProfession() public {
        uint256 mintPrice = skinNFT.tierPrices(0);
        
        vm.prank(user1);
        uint256 tokenId = skinNFT.mintSkin{value: mintPrice}(personaId, professionId);
        
        ISkinNFT.Skin memory skin = skinNFT.getSkinByPersonaProfession(personaId, professionId);
        assertEq(skin.tokenId, tokenId);
    }

    // ============ Helper Functions ============

    function _startsWith(string memory str, string memory prefix) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory prefixBytes = bytes(prefix);
        
        if (strBytes.length < prefixBytes.length) return false;
        
        for (uint256 i = 0; i < prefixBytes.length; i++) {
            if (strBytes[i] != prefixBytes[i]) return false;
        }
        
        return true;
    }
}
