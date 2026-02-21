// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title ValueskinProxy
 * @notice UUPS proxy for upgradeable Valueskins contracts
 * @dev Thin wrapper around OpenZeppelin's ERC1967Proxy
 */
contract ValueskinProxy is ERC1967Proxy {
    /**
     * @notice Deploys a new proxy pointing to the implementation
     * @param implementation The initial implementation address
     * @param data The initialization calldata
     */
    constructor(
        address implementation,
        bytes memory data
    ) ERC1967Proxy(implementation, data) {}
}
