// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console2} from "forge-std/Script.sol";
import {PersonaRegistry} from "../core/PersonaRegistry.sol";
import {ProfessionRegistry} from "../core/ProfessionRegistry.sol";
import {SkinNFT} from "../nft/SkinNFT.sol";
import {PaymentSplitter} from "../payments/PaymentSplitter.sol";
import {LevelOracle} from "../oracle/LevelOracle.sol";
import {ValueskinProxy} from "../proxy/ValueskinProxy.sol";

/**
 * @title Deploy
 * @notice Deployment script for all Valueskins contracts
 */
contract Deploy is Script {
    // Deployment addresses
    address public personaRegistryProxy;
    address public professionRegistryProxy;
    address public skinNFTProxy;
    address public paymentSplitterProxy;
    address public levelOracleProxy;

    // Configuration
    uint256 public constant BASE_PERSONA_PRICE = 0.01 ether;
    uint256 public constant PRICE_MULTIPLIER = 20000; // 2x in PRECISION
    uint256 public constant PROFESSION_ADD_PRICE = 0.005 ether;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address oracle = vm.envOr("ORACLE_ADDRESS", deployer);
        address treasury = vm.envOr("TREASURY_ADDRESS", deployer);
        
        console2.log("Deployer:", deployer);
        console2.log("Oracle:", oracle);
        console2.log("Treasury:", treasury);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy PersonaRegistry
        PersonaRegistry personaRegistryImpl = new PersonaRegistry();
        bytes memory personaRegistryData = abi.encodeCall(
            PersonaRegistry.initialize,
            (deployer, BASE_PERSONA_PRICE, PRICE_MULTIPLIER)
        );
        ValueskinProxy personaProxy = new ValueskinProxy(
            address(personaRegistryImpl),
            personaRegistryData
        );
        personaRegistryProxy = address(personaProxy);
        console2.log("PersonaRegistry deployed to:", personaRegistryProxy);

        // 2. Deploy PaymentSplitter
        PaymentSplitter paymentSplitterImpl = new PaymentSplitter();
        PaymentSplitter.Payee[] memory payees = new PaymentSplitter.Payee[](2);
        payees[0] = PaymentSplitter.Payee({
            addr: payable(treasury),
            share: 8000, // 80%
            name: "Treasury"
        });
        payees[1] = PaymentSplitter.Payee({
            addr: payable(deployer),
            share: 2000, // 20%
            name: "Team"
        });
        bytes memory paymentSplitterData = abi.encodeCall(
            PaymentSplitter.initialize,
            (deployer, payees)
        );
        ValueskinProxy paymentProxy = new ValueskinProxy(
            address(paymentSplitterImpl),
            paymentSplitterData
        );
        paymentSplitterProxy = address(paymentProxy);
        console2.log("PaymentSplitter deployed to:", paymentSplitterProxy);

        // 3. Deploy ProfessionRegistry
        ProfessionRegistry professionRegistryImpl = new ProfessionRegistry();
        bytes memory professionRegistryData = abi.encodeCall(
            ProfessionRegistry.initialize,
            (deployer, personaRegistryProxy, oracle, PROFESSION_ADD_PRICE)
        );
        ValueskinProxy professionProxy = new ValueskinProxy(
            address(professionRegistryImpl),
            professionRegistryData
        );
        professionRegistryProxy = address(professionProxy);
        console2.log("ProfessionRegistry deployed to:", professionRegistryProxy);

        // 4. Deploy SkinNFT
        SkinNFT skinNFTImpl = new SkinNFT();
        bytes memory skinNFTData = abi.encodeCall(
            SkinNFT.initialize,
            (deployer, personaRegistryProxy, professionRegistryProxy)
        );
        ValueskinProxy skinProxy = new ValueskinProxy(
            address(skinNFTImpl),
            skinNFTData
        );
        skinNFTProxy = address(skinProxy);
        console2.log("SkinNFT deployed to:", skinNFTProxy);

        // 5. Deploy LevelOracle
        LevelOracle levelOracleImpl = new LevelOracle();
        bytes memory levelOracleData = abi.encodeCall(
            LevelOracle.initialize,
            (deployer, professionRegistryProxy, oracle)
        );
        ValueskinProxy oracleProxy = new ValueskinProxy(
            address(levelOracleImpl),
            levelOracleData
        );
        levelOracleProxy = address(oracleProxy);
        console2.log("LevelOracle deployed to:", levelOracleProxy);

        // 6. Setup: Authorize LevelOracle to update levels in ProfessionRegistry
        ProfessionRegistry(payable(professionRegistryProxy)).setLevelOracle(levelOracleProxy);
        console2.log("LevelOracle authorized in ProfessionRegistry");

        // 7. Create initial professions
        _createInitialProfessions();

        vm.stopBroadcast();

        // Log summary
        console2.log("\n=== Deployment Summary ===");
        console2.log("PersonaRegistry:", personaRegistryProxy);
        console2.log("ProfessionRegistry:", professionRegistryProxy);
        console2.log("SkinNFT:", skinNFTProxy);
        console2.log("PaymentSplitter:", paymentSplitterProxy);
        console2.log("LevelOracle:", levelOracleProxy);
    }

    function _createInitialProfessions() internal {
        ProfessionRegistry profRegistry = ProfessionRegistry(payable(professionRegistryProxy));

        // 8 Content Creator professions (1 general + 7 niche)
        //
        // Each sticker is a TRIPLE-FUNCTION credential:
        //   1. IDENTITY — declares the creator's professional category
        //   2. ACCESS GATE — unlocks the MIM (Marketplace Inside Marketplace)
        //   3. AI WEIGHT — the sticker type feeds into the matching algorithm

        // General (no specific niche)
        profRegistry.createProfession("Content Creator", "Creator", "General lifestyle and vlog content creator");

        // Niche specializations
        profRegistry.createProfession("Art Creator", "Creator", "Art and design focused content creator");
        profRegistry.createProfession("Law Creator", "Creator", "Legal education content creator");
        profRegistry.createProfession("Medical Creator", "Creator", "Health and medical content creator");
        profRegistry.createProfession("Gaming Creator", "Creator", "Gaming and esports content creator");
        profRegistry.createProfession("Tech Creator", "Creator", "Technology and developer content creator");
        profRegistry.createProfession("Finance Creator", "Creator", "Business and finance content creator");
        profRegistry.createProfession("Fitness Creator", "Creator", "Fitness and wellness content creator");

        console2.log("Created 8 content creator professions");
    }
}
