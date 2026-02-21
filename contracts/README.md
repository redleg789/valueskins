# Valueskins Smart Contracts

Production-ready Solidity contracts for the Valueskins reputation monetization platform.

## Overview

- **PersonaRegistry**: Core persona management with exponential pricing
- **SkinNFT**: ERC-721 skins bound to personas with dynamic metadata
- **ProfessionRegistry**: AI-controlled profession management
- **PaymentSplitter**: Fee collection and distribution
- **LevelOracle**: Bridge between off-chain scoring and on-chain levels

## Requirements

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Solidity 0.8.24+

## Setup

```bash
# Install dependencies
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install OpenZeppelin/openzeppelin-contracts-upgradeable --no-commit

# Build contracts
forge build

# Run tests
forge test -vvv

# Gas report
forge test --gas-report
```

## Deployment

```bash
# Deploy to testnet
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify

# Deploy to mainnet
forge script script/Deploy.s.sol --rpc-url $MAINNET_RPC_URL --broadcast --verify
```

## Architecture

```
contracts/
├── core/
│   ├── PersonaRegistry.sol      # Persona creation with exponential pricing
│   └── ProfessionRegistry.sol   # Profession management
├── nft/
│   └── SkinNFT.sol             # Dynamic NFT skins
├── payments/
│   └── PaymentSplitter.sol     # Fee collection
├── oracle/
│   └── LevelOracle.sol         # Off-chain scoring bridge
├── proxy/
│   └── UpgradeableProxy.sol    # UUPS proxy
└── test/
    └── *.t.sol                 # Test files
```

## License

MIT
