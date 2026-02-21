// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console2} from "forge-std/Test.sol";
import {PersonaRegistry} from "../core/PersonaRegistry.sol";
import {IPersonaRegistry} from "../core/IPersonaRegistry.sol";
import {ValueskinProxy} from "../proxy/ValueskinProxy.sol";

/**
 * @title PersonaRegistryTest
 * @notice Comprehensive tests for PersonaRegistry
 */
contract PersonaRegistryTest is Test {
    PersonaRegistry public registry;
    
    address public owner = makeAddr("owner");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    
    uint256 public constant BASE_PRICE = 0.01 ether;
    uint256 public constant MULTIPLIER = 20000; // 2x
    uint256 public constant PRECISION = 10000;

    function setUp() public {
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        
        // Deploy implementation
        PersonaRegistry impl = new PersonaRegistry();
        
        // Deploy proxy
        bytes memory initData = abi.encodeCall(
            PersonaRegistry.initialize,
            (owner, BASE_PRICE, MULTIPLIER)
        );
        ValueskinProxy proxy = new ValueskinProxy(address(impl), initData);
        registry = PersonaRegistry(payable(address(proxy)));
    }

    // ============ Creation Tests ============

    function test_CreateFirstPersona() public {
        vm.prank(user1);
        uint256 personaId = registry.createPersona{value: BASE_PRICE}("Alice", "ipfs://avatar1");
        
        assertEq(personaId, 1);
        assertEq(registry.getPersonaCount(user1), 1);
        
        IPersonaRegistry.Persona memory persona = registry.getPersona(personaId);
        assertEq(persona.owner, user1);
        assertEq(persona.displayName, "Alice");
        assertEq(persona.avatarUri, "ipfs://avatar1");
    }

    function test_ExponentialPricing() public {
        // First persona: BASE_PRICE
        assertEq(registry.getNextPersonaPrice(user1), BASE_PRICE);
        
        vm.prank(user1);
        registry.createPersona{value: BASE_PRICE}("Persona1", "");
        
        // Second persona: BASE_PRICE * 2
        uint256 price2 = registry.getNextPersonaPrice(user1);
        assertEq(price2, (BASE_PRICE * MULTIPLIER) / PRECISION);
        assertEq(price2, 0.02 ether);
        
        vm.prank(user1);
        registry.createPersona{value: price2}("Persona2", "");
        
        // Third persona: BASE_PRICE * 4
        uint256 price3 = registry.getNextPersonaPrice(user1);
        assertEq(price3, 0.04 ether);
        
        vm.prank(user1);
        registry.createPersona{value: price3}("Persona3", "");
        
        // Fourth persona: BASE_PRICE * 8
        uint256 price4 = registry.getNextPersonaPrice(user1);
        assertEq(price4, 0.08 ether);
    }

    function test_CreatePersona_InsufficientPayment() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                PersonaRegistry.InsufficientPayment.selector,
                BASE_PRICE,
                BASE_PRICE - 1
            )
        );
        registry.createPersona{value: BASE_PRICE - 1}("Alice", "");
    }

    function test_CreatePersona_RefundsExcess() public {
        uint256 balanceBefore = user1.balance;
        
        vm.prank(user1);
        registry.createPersona{value: 1 ether}("Alice", "");
        
        uint256 balanceAfter = user1.balance;
        assertEq(balanceBefore - balanceAfter, BASE_PRICE);
    }

    // ============ Update Tests ============

    function test_UpdatePersona() public {
        vm.prank(user1);
        uint256 personaId = registry.createPersona{value: BASE_PRICE}("Alice", "");
        
        vm.prank(user1);
        registry.updatePersona(personaId, "Alice Updated", "ipfs://new-avatar");
        
        IPersonaRegistry.Persona memory persona = registry.getPersona(personaId);
        assertEq(persona.displayName, "Alice Updated");
        assertEq(persona.avatarUri, "ipfs://new-avatar");
    }

    function test_UpdatePersona_NotOwner() public {
        vm.prank(user1);
        uint256 personaId = registry.createPersona{value: BASE_PRICE}("Alice", "");
        
        vm.prank(user2);
        vm.expectRevert(
            abi.encodeWithSelector(
                PersonaRegistry.NotPersonaOwner.selector,
                personaId,
                user2
            )
        );
        registry.updatePersona(personaId, "Bob", "");
    }

    // ============ Activity Tests ============

    function test_RecordActivity() public {
        vm.prank(user1);
        uint256 personaId = registry.createPersona{value: BASE_PRICE}("Alice", "");
        
        vm.warp(block.timestamp + 1 days);
        
        registry.recordActivity(personaId);
        
        IPersonaRegistry.Persona memory persona = registry.getPersona(personaId);
        assertEq(persona.lastActive, block.timestamp);
    }

    function test_IsPersonaActive() public {
        vm.prank(user1);
        uint256 personaId = registry.createPersona{value: BASE_PRICE}("Alice", "");
        
        // Should be active initially
        assertTrue(registry.isPersonaActive(personaId));
        
        // After inactivity threshold, should be inactive
        vm.warp(block.timestamp + 3 weeks);
        assertFalse(registry.isPersonaActive(personaId));
    }

    // ============ Decay Tests ============

    function test_DecayCalculation() public {
        vm.prank(user1);
        uint256 personaId = registry.createPersona{value: BASE_PRICE}("Alice", "");
        
        // No decay initially
        assertEq(registry.getDecayAmount(personaId), 0);
        
        // After 3 weeks (past 2 week threshold), 1 week of decay = 10% = 1000
        vm.warp(block.timestamp + 3 weeks);
        uint256 decay = registry.getDecayAmount(personaId);
        assertEq(decay, 1000); // 10% in PRECISION
        
        // After 4 weeks, 2 weeks of decay compounds
        vm.warp(block.timestamp + 1 weeks);
        decay = registry.getDecayAmount(personaId);
        // First week: 10% of 10000 = 1000, remaining = 9000
        // Second week: 10% of 9000 = 900
        // Total decay: 1900
        assertEq(decay, 1900);
    }

    // ============ Upkeep Tests ============

    function test_PayUpkeep() public {
        vm.prank(user1);
        uint256 personaId = registry.createPersona{value: BASE_PRICE}("Alice", "");
        
        uint256 upkeepCost = registry.upkeepCost();
        uint256 upkeepPeriod = registry.upkeepPeriod();
        
        IPersonaRegistry.Persona memory personaBefore = registry.getPersona(personaId);
        uint256 upkeepEndBefore = personaBefore.upkeepPaidUntil;
        
        vm.prank(user1);
        registry.payUpkeep{value: upkeepCost}(personaId);
        
        IPersonaRegistry.Persona memory personaAfter = registry.getPersona(personaId);
        assertEq(personaAfter.upkeepPaidUntil, upkeepEndBefore + upkeepPeriod);
    }

    function test_PayUpkeep_ExtendsFromNow_WhenExpired() public {
        vm.prank(user1);
        uint256 personaId = registry.createPersona{value: BASE_PRICE}("Alice", "");
        
        // Fast forward past upkeep period
        vm.warp(block.timestamp + 2 weeks);
        
        uint256 upkeepCost = registry.upkeepCost();
        uint256 upkeepPeriod = registry.upkeepPeriod();
        
        vm.prank(user1);
        registry.payUpkeep{value: upkeepCost}(personaId);
        
        IPersonaRegistry.Persona memory persona = registry.getPersona(personaId);
        assertEq(persona.upkeepPaidUntil, block.timestamp + upkeepPeriod);
    }

    // ============ Admin Tests ============

    function test_SetBasePrice() public {
        vm.prank(owner);
        registry.setBasePrice(0.02 ether);
        
        assertEq(registry.basePrice(), 0.02 ether);
        assertEq(registry.getNextPersonaPrice(user1), 0.02 ether);
    }

    function test_SetBasePrice_BelowMinimum() public {
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                PersonaRegistry.InvalidParameter.selector,
                "basePrice"
            )
        );
        registry.setBasePrice(0.0001 ether);
    }

    function test_Withdraw() public {
        vm.prank(user1);
        registry.createPersona{value: BASE_PRICE}("Alice", "");
        
        uint256 balanceBefore = owner.balance;
        
        vm.prank(owner);
        registry.withdraw(payable(owner));
        
        assertEq(owner.balance - balanceBefore, BASE_PRICE);
    }

    // ============ Edge Cases ============

    function test_MultipleOwners() public {
        vm.prank(user1);
        registry.createPersona{value: BASE_PRICE}("User1 Persona", "");
        
        vm.prank(user2);
        registry.createPersona{value: BASE_PRICE}("User2 Persona", "");
        
        assertEq(registry.getPersonaCount(user1), 1);
        assertEq(registry.getPersonaCount(user2), 1);
        
        // Each user pays base price for first persona
        assertEq(registry.getNextPersonaPrice(user1), 0.02 ether);
        assertEq(registry.getNextPersonaPrice(user2), 0.02 ether);
    }

    function test_GetPersonasByOwner() public {
        vm.startPrank(user1);
        
        uint256 id1 = registry.createPersona{value: BASE_PRICE}("P1", "");
        uint256 id2 = registry.createPersona{value: 0.02 ether}("P2", "");
        uint256 id3 = registry.createPersona{value: 0.04 ether}("P3", "");
        
        vm.stopPrank();
        
        uint256[] memory personas = registry.getPersonasByOwner(user1);
        assertEq(personas.length, 3);
        assertEq(personas[0], id1);
        assertEq(personas[1], id2);
        assertEq(personas[2], id3);
    }
}
