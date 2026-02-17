# Hardhat — VWAP Smart Contracts

[![Solidity](https://img.shields.io/badge/Solidity-^0.8.28-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-orange)](https://hardhat.org/)

Smart contracts for VWAP (Volume-Weighted Average Price) order execution on Monad, demonstrating parallel EVM slice execution.

## Contracts

| Contract | Description |
|----------|-------------|
| **VWAPEngine.sol** | Production VWAP engine — dual risk management, parallel execution, bitmask slice tracking |
| **VWAPDemo.sol** | Proof-of-concept — lightweight order slicing with variable VWAP weighting (150/100/50%) |
| **SimpleAMM.sol** | Constant-product AMM for on-chain price discovery and liquidity |
| **MockERC20.sol** | Test ERC20 token for testnet deployment |

## Quick Start

```bash
cd Hardhat
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your deployer key and RPC settings

# Deploy to Monad Testnet
npx hardhat deploy --network monadTestnet

# Verify contracts
npx hardhat run scripts/verify.ts --network monadTestnet
```

## Scripts

| Script | Description |
|--------|-------------|
| `scripts/keeper.ts` | Event-driven bot that polls every 7s and executes eligible VWAP slices |
| `scripts/flow-bot.ts` | Simulates market activity with random trades every 15s for demo |
| `scripts/verify.ts` | Verifies all deployed contracts on block explorer |

## How VWAP Slicing Works

1. User creates an order specifying total amount and number of slices (max 20)
2. Slices are sized using VWAP weighting pattern (150%/100%/50% repeating)
3. Keeper bot executes slices over time intervals, reducing market impact
4. Bitmask tracking provides O(1) double-execution prevention
5. Any address can execute slices — permissionless for keeper bots

## Networks

Configured for Monad Testnet (chain ID 10143) and Base Sepolia. See `hardhat.config.ts` for full list.
