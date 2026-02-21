# Valueskins

A decentralized social reputation platform that lets you monetize your expertise through on-chain personas and profession skins.

## Quick Start

### Prerequisites
- Node.js 22+
- Rust 1.82+
- Docker & Docker Compose
- Foundry (for smart contracts)

### Local Development

1. **Clone and setup environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

2. **Start with Docker Compose**
```bash
docker-compose up -d
```

3. **Or run services individually**

**Contracts:**
```bash
cd contracts
forge build
forge test
```

**Backend:**
```bash
cd backend
cargo run --bin api_gateway
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Architecture

```
valueskins/
├── contracts/           # Solidity smart contracts (Foundry)
│   ├── core/           # PersonaRegistry, ProfessionRegistry
│   ├── nft/            # SkinNFT (ERC-721)
│   ├── oracle/         # LevelOracle
│   └── payments/       # PaymentSplitter
├── backend/            # Rust microservices
│   ├── api_gateway/    # Main API entry point
│   ├── auth_service/   # Wallet authentication + JWT
│   ├── social_service/ # Posts, likes, follows
│   ├── indexer/        # Blockchain event indexer
│   └── shared/         # Common utilities
└── frontend/           # Next.js 16 application
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/auth/login` | POST | Wallet authentication |
| `/personas` | GET | List personas |
| `/personas/:id` | GET | Get persona details |
| `/personas/:id/skins` | GET | Get persona's skins |
| `/social/posts` | POST | Create post |

## Smart Contracts

Deployed with UUPS proxy pattern for upgradeability.

```bash
# Deploy to testnet
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
```

## License

MIT
