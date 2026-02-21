// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console2} from "forge-std/Test.sol";
import {PaymentSplitter} from "../payments/PaymentSplitter.sol";
import {ValueskinProxy} from "../proxy/ValueskinProxy.sol";

contract PaymentSplitterTest is Test {
    PaymentSplitter public splitter;
    
    address public owner = makeAddr("owner");
    address public treasury = makeAddr("treasury");
    address public team = makeAddr("team");
    address public randomUser = makeAddr("randomUser");
    
    uint256 public constant PRECISION = 10000;

    event PaymentReceived(address indexed from, uint256 amount);
    event PaymentReleased(address indexed to, uint256 amount);

    function setUp() public {
        PaymentSplitter impl = new PaymentSplitter();
        
        PaymentSplitter.Payee[] memory payees = new PaymentSplitter.Payee[](2);
        payees[0] = PaymentSplitter.Payee({
            addr: payable(treasury),
            share: 8000, // 80%
            name: "Treasury"
        });
        payees[1] = PaymentSplitter.Payee({
            addr: payable(team),
            share: 2000, // 20%
            name: "Team"
        });
        
        bytes memory initData = abi.encodeCall(
            PaymentSplitter.initialize,
            (owner, payees)
        );
        
        ValueskinProxy proxy = new ValueskinProxy(address(impl), initData);
        splitter = PaymentSplitter(payable(address(proxy)));
        
        vm.deal(randomUser, 100 ether);
    }

    function test_Initialization() public {
        PaymentSplitter.Payee[] memory payees = splitter.getPayees();
        assertEq(payees.length, 2);
        assertEq(payees[0].addr, treasury);
        assertEq(payees[0].share, 8000);
        assertEq(payees[1].addr, team);
        assertEq(payees[1].share, 2000);
        
        assertEq(splitter.totalShares(), PRECISION);
    }

    function test_ReceivePayment() public {
        vm.prank(randomUser);
        (bool success, ) = address(splitter).call{value: 10 ether}("");
        assertTrue(success);
        
        assertEq(address(splitter).balance, 10 ether);
        assertEq(splitter.totalReceived(), 10 ether);
        assertEq(splitter.receivedFromSource(randomUser), 10 ether);
    }

    function test_ReleaseToPayee() public {
        // Send funds
        vm.prank(randomUser);
        (bool success, ) = address(splitter).call{value: 10 ether}("");
        assertTrue(success);
        
        uint256 treasuryBefore = treasury.balance;
        
        // Release to Treasury (Index 0)
        vm.prank(owner); // Anyone can call release methods usually in PaymentSplitter? 
        // Checking code: releaseToPayee is nonReentrant but public/external without restricted modifier?
        // Yes, usually permissionless maintenance function.
        splitter.releaseToPayee(0);
        
        uint256 expectedRelease = (10 ether * 8000) / PRECISION;
        assertEq(treasury.balance - treasuryBefore, expectedRelease);
        assertEq(splitter.releasedToPayee(treasury), expectedRelease);
        assertEq(splitter.totalReleased(), expectedRelease);
    }

    function test_ReleaseAll() public {
        // Send funds
        vm.prank(randomUser);
        (bool success, ) = address(splitter).call{value: 100 ether}("");
        assertTrue(success);
        
        uint256 treasuryBefore = treasury.balance;
        uint256 teamBefore = team.balance;
        
        splitter.releaseAll();
        
        assertEq(treasury.balance - treasuryBefore, 80 ether);
        assertEq(team.balance - teamBefore, 20 ether);
        assertEq(splitter.totalReleased(), 100 ether);
    }

    function test_EmergencyWithdraw() public {
        vm.deal(address(splitter), 5 ether);
        
        uint256 ownerBefore = owner.balance;
        
        vm.prank(owner);
        splitter.emergencyWithdraw();
        
        assertEq(owner.balance - ownerBefore, 5 ether);
        assertEq(address(splitter).balance, 0);
    }

    function test_SetPayees() public {
        PaymentSplitter.Payee[] memory newPayees = new PaymentSplitter.Payee[](1);
        newPayees[0] = PaymentSplitter.Payee({
            addr: payable(randomUser),
            share: 10000,
            name: "Sole Receiver"
        });
        
        vm.prank(owner);
        splitter.setPayees(newPayees);
        
        PaymentSplitter.Payee[] memory payees = splitter.getPayees();
        assertEq(payees.length, 1);
        assertEq(payees[0].addr, randomUser);
        assertEq(payees[0].share, 10000);
    }
}
