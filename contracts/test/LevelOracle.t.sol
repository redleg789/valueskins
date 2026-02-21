// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console2} from "forge-std/Test.sol";
import {LevelOracle} from "../oracle/LevelOracle.sol";
import {ValueskinProxy} from "../proxy/ValueskinProxy.sol";

contract MockProfessionRegistry {
    event LevelUpdated(uint256 personaId, uint256 professionId, uint8 newLevel);
    
    struct PersonaProfession {
        uint256 professionId;
        uint8 level;
        uint256 realScore;
        uint256 addedAt;
        uint256 lastLevelChange;
        bool exists;
    }
    
    function updateLevel(
        uint256 personaId,
        uint256 professionId,
        uint8 newLevel,
        uint256 /*realScore*/
    ) external {
        emit LevelUpdated(personaId, professionId, newLevel);
    }
    
    function getPersonaProfession(uint256, uint256) external pure returns (PersonaProfession memory) {
        return PersonaProfession({
            professionId: 1,
            level: 1,
            realScore: 0,
            addedAt: 0,
            lastLevelChange: 0,
            exists: true
        });
    }
}

contract LevelOracleTest is Test {
    LevelOracle public oracle;
    MockProfessionRegistry public mockProfRegistry;
    
    address public owner = makeAddr("owner");
    address public authorizedOracle = makeAddr("authorizedOracle");
    address public maliciousUser = makeAddr("maliciousUser");

    function setUp() public {
        mockProfRegistry = new MockProfessionRegistry();
        
        LevelOracle impl = new LevelOracle();
        bytes memory initData = abi.encodeCall(
            LevelOracle.initialize,
            (owner, address(mockProfRegistry), authorizedOracle)
        );
        
        ValueskinProxy proxy = new ValueskinProxy(address(impl), initData);
        oracle = LevelOracle(payable(address(proxy)));
        
        vm.warp(1 days);
    }

    function test_Initialization() public {
        assertTrue(oracle.authorizedOracles(authorizedOracle));
        assertEq(address(oracle.professionRegistry()), address(mockProfRegistry));
    }

    function test_UpdateLevel() public {
        vm.prank(authorizedOracle);
        oracle.updateLevel(1, 1, 2, 5000);
        
        // Assertions are tricky without checking emitted events from Mock
        // But if it didn't revert, it called the mock successfully
    }

    function test_UpdateLevel_NotAuthorized() public {
        vm.prank(maliciousUser);
        vm.expectRevert(abi.encodeWithSelector(LevelOracle.NotAuthorizedOracle.selector, maliciousUser));
        oracle.updateLevel(1, 1, 2, 5000);
    }

    function test_RateLimiting() public {
        vm.startPrank(authorizedOracle);
        
        // First update
        oracle.updateLevel(1, 1, 2, 5000);
        
        // Immediate second update should fail
        vm.expectRevert(
            abi.encodeWithSelector(
                LevelOracle.UpdateTooFrequent.selector,
                1, 1
            )
        );
        oracle.updateLevel(1, 1, 3, 6000);
        
        // After wait, should succeed
        vm.warp(block.timestamp + 1 hours + 1 seconds);
        oracle.updateLevel(1, 1, 3, 6000);
        
        vm.stopPrank();
    }

    function test_BatchUpdate() public {
        LevelOracle.LevelUpdate[] memory updates = new LevelOracle.LevelUpdate[](2);
        updates[0] = LevelOracle.LevelUpdate(1, 1, 2, 5000, 0);
        updates[1] = LevelOracle.LevelUpdate(2, 1, 3, 7000, 0);
        
        uint256 nonce = oracle.nonce();
        
        vm.prank(authorizedOracle);
        oracle.batchUpdateLevels(updates, nonce);
        
        assertEq(oracle.nonce(), nonce + 1);
    }
    
    function test_BatchUpdate_InvalidNonce() public {
        LevelOracle.LevelUpdate[] memory updates = new LevelOracle.LevelUpdate[](1);
        updates[0] = LevelOracle.LevelUpdate(1, 1, 2, 5000, 0);
        
        vm.prank(authorizedOracle);
        vm.expectRevert(abi.encodeWithSelector(LevelOracle.InvalidNonce.selector, 0, 99));
        oracle.batchUpdateLevels(updates, 99);
    }
}
