# Hardhat — Smart Contracts

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.28-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-orange)](https://hardhat.org/)

EVM smart contracts (e.g. VWAPDemo, Grid contracts) with Hardhat. Supports Base Sepolia, Monad Testnet/Mainnet, and other networks.

## 🔒 Security (important for public repos)

- **Never commit `.env`** — it is listed in `.gitignore`. Use **`.env.example`** as a template only; copy it to `.env` and fill in your own values locally.
- **Never commit private keys or API keys.** Keep `DEPLOYER_PRIVATE_KEY`, `ALCHEMY_API_KEY`, `ETHERSCAN_API_KEY`, and any other secrets only in your local `.env`.

## 🚀 Quick Start

```bash
# 1. From repo root, go to Hardhat and install
cd Hardhat
yarn install   # or npm install

# 2. Configure environment (required)
cp .env.example .env
# Edit .env with your own API keys and deployer key. Do not commit .env.

# 3. Deploy (example: Monad Testnet)
npx hardhat deploy --network monadTestnet

# 4. Verify (optional)
npx hardhat run scripts/verify.ts --network monadTestnet
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npx hardhat deploy` | Deploy (default network in config) |
| `npx hardhat deploy --network monadTestnet` | Deploy to Monad Testnet |
| `npx hardhat deploy --network baseSepolia` | Deploy to Base Sepolia |
| `npx hardhat run scripts/verify.ts --network <network>` | Verify contracts |
| `npx hardhat compile` | Compile contracts |
| `npx hardhat test` | Run tests |
| `npx hardhat console --network <network>` | Open console |

## 🚀 Features

- **VWAPDemo**: Minimal VWAP-style order slicing demo (create order, execute slices in any order).
- **Multi-Network**: Base Sepolia, Monad Testnet/Mainnet, Arbitrum, Optimism, Polygon, etc.
- **Verification**: Etherscan V2 API and Sourcify (e.g. Monad).
- **TypeScript**: Full typechain and deploy scripts in TypeScript.

## 📋 Table of Contents

- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Usage](#usage)
- [Security](#security)
- [Testing](#testing)
- [Contributing](#contributing)

## 🏗️ Architecture

### Core Components

- **NFTRaffleVRF**: Main raffle contract with VRF integration
- **RwaAssetNFT**: ERC721 contract for RWA NFTs with controlled minting
- **Gelato VRF**: Decentralized randomness for fair winner selection

### Key Features

- **Efficient Winner Resolution**: O(log n) binary search for winner selection
- **Cumulative Entry System**: Optimized storage for large-scale raffles
- **Comprehensive State Management**: Full raffle lifecycle tracking
- **Secure Payout System**: Automated fee distribution and escrow handling

## 📜 Smart Contracts

### NFTRaffleVRF

The main raffle contract that handles:
- Raffle creation and management
- Ticket purchasing with USDC
- Random winner selection via Gelato VRF
- Automated payouts and fee distribution
- Refund handling for failed raffles

### RwaAssetNFT

Specialized ERC721 contract for RWA NFTs featuring:
- Controlled minting permissions
- Royalty support (ERC2981)
- Pausable functionality
- Role-based access control

## 🛠️ Installation

### Prerequisites

- Node.js (v20 or higher)
- Yarn or npm
- Git

### Setup

1. **Clone the repository** (or use your fork)
   ```bash
   cd Hardhat
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your own keys. Never commit .env.
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the Hardhat directory with the following variables:

```env
# Network Configuration
ALCHEMY_API_KEY=your_alchemy_api_key
DEPLOYER_PRIVATE_KEY=your_deployer_private_key

# Etherscan V2 API (Single Key for All Chains)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Contract Configuration
USDC=0x... # USDC contract address on target network
FEE_RECIPIENT=0x... # Platform fee recipient address
ESCROW_WALLET=0x... # Escrow wallet address
FEE_BPS=100 # Platform fee in basis points (100 = 1%)

# Gelato VRF Configuration
GELATO_OPERATOR=0x... # Gelato VRF operator address

# NFT Configuration (Optional)
ROYALTY_RECEIVER=0x... # NFT royalty receiver
ROYALTY_BPS=250 # Royalty in basis points (250 = 2.5%)

# Network-Specific Settings
MAINNET_FORKING_ENABLED=false
```

### V2 API Benefits

- **Single API Key**: Works across 50+ chains (Base, Arbitrum, Optimism, Polygon, etc.)
- **Unified Verification**: No need for multiple explorer API keys
- **Simplified Configuration**: One key to rule them all
- **Future-Proof**: Automatically supports new chains

### Network-Specific Configuration

| Network | Gelato VRF Operator | USDC Address |
|---------|-------------------|--------------|
| Ethereum Mainnet | `0x...` | `0xA0b86a33E6441b8c4C8C0e4A8e4A8e4A8e4A8e4A8` |
| Base Sepolia | `0x3aF07A6B0F4864D652002c176154711D53c2799f` | `0x94d07C7Aa3F8910ACeF21300098DA9171d06220C` |
| Polygon | `0x...` | `0x...` |
| Arbitrum | `0x...` | `0x...` |

**Important**: 
- Get the correct operator addresses from [Gelato VRF Documentation](https://docs.gelato.network/)
- Get USDC addresses from [Circle's documentation](https://developers.circle.com/stablecoins/docs/usdc-on-other-networks)
- For Base Sepolia, the values above are already configured for testing

## 🚀 Complete Step-by-Step Deployment Guide

### Prerequisites Setup

**1. Get Required API Keys**
- [Alchemy API Key](https://dashboard.alchemyapi.io/) - for network access
- [Etherscan API Key](https://etherscan.io/apis) - for contract verification
- Private key from a wallet with testnet ETH

**2. Get Testnet ETH**
- [Base Sepolia Faucet](https://bridge.base.org/deposit) - get testnet ETH
- [Base Sepolia Faucet (Alternative)](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

### Step-by-Step Deployment Process

**Step 1: Clone and Install**
```bash
# Clone the repository
git clone https://github.com/decentralbros/RaffleMint-New-Mini.git
cd raffle-mini/Hardhat

# Install dependencies
yarn install
```

**Step 2: Configure Environment**
```bash
cp .env.example .env
# Edit .env with your own values. Do not commit .env.
```

**Step 3: Add Environment Variables**
Add this to your `.env` file (replace with your actual values):
```env
# Network Configuration
ALCHEMY_API_KEY=your_alchemy_api_key_here
DEPLOYER_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Contract Configuration (Base Sepolia - ready to use)
USDC=0x94d07C7Aa3F8910ACeF21300098DA9171d06220C
FEE_RECIPIENT=0x3aF07A6B0F4864D652002c176154711D53c2799f
ESCROW_WALLET=0x3aF07A6B0F4864D652002c176154711D53c2799f
FEE_BPS=100

# Gelato VRF Configuration (Base Sepolia)
GELATO_OPERATOR=0x3aF07A6B0F4864D652002c176154711D53c2799f

# NFT Configuration (Optional)
ROYALTY_RECEIVER=0x3aF07A6B0F4864D652002c176154711D53c2799f
ROYALTY_BPS=250

# Network-Specific Settings
MAINNET_FORKING_ENABLED=false
```

**Step 4: Check Account Status**
```bash
# Check if your account has sufficient balance and correct nonce
yarn account
```

**Step 5: Compile Contracts**
```bash
# Compile all contracts
yarn compile
```

**Step 6: Deploy Contracts**
```bash
# Deploy to Base Sepolia with automatic retry
sleep 30 && yarn deploy:baseSepolia
```

**Step 7: Verify Deployment**
```bash
# Check deployment status
npx hardhat deploy --list

# Check deployment artifacts
ls deployments/84532-baseSepolia.json
```

**Step 8: Verify Contracts on Etherscan**
```bash
# Run verification script (uses V2 API automatically)
yarn verify
```

**Step 9: Test Your Deployment**
```bash
# Open console to interact with contracts
npx hardhat console --network baseSepolia

# In console, test your contracts:
# const contract = await ethers.getContractAt("NFTRaffleVRF", "0x...")
# await contract.getRaffle(1)
```

### Quick Deploy (If You Have Everything Set Up)

```bash
# One-command deployment and verification
yarn deploy:all
```

### First-Time User Troubleshooting

**Common Issues for New Users:**

**1. "Account has insufficient balance"**
```bash
# Get testnet ETH from faucet
# Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
# Or: https://bridge.base.org/deposit

# Check balance
yarn account
```

**2. "Invalid private key"**
```bash
# Ensure DEPLOYER_PRIVATE_KEY in .env is correct (with or without 0x prefix).
# Do not paste or share your private key.
```

**3. "Network connection failed"**
```bash
# Check your Alchemy API key
# Visit: https://dashboard.alchemyapi.io/

# Test connection
npx hardhat console --network baseSepolia
```

**4. "Contract verification failed"**
```bash
# This is normal if you don't have an Etherscan API key
# The script will provide manual verification instructions
# You can still use the contracts without verification
```

**5. "Nonce has already been used"**
```bash
# Wait 30 seconds and retry
sleep 30 && yarn deploy:baseSepolia
```

**Success Indicators:**
- ✅ `yarn account` shows sufficient balance
- ✅ `yarn compile` completes without errors
- ✅ `yarn deploy:baseSepolia` shows "Deploying NFTRaffleVRF" and "Deploying RwaAssetNFT"
- ✅ `npx hardhat deploy --list` shows your deployed contracts
- ✅ `ls deployments/84532-baseSepolia.json` shows deployment files

### Final Verification Checklist

**After completing all steps, you should have:**

1. **Deployed Contracts:**
   - NFTRaffleVRF contract address
   - RwaAssetNFT contract address
   - Both contracts verified on Base Sepolia Explorer

2. **Working Commands:**
   ```bash
   # All these should work without errors
   yarn account
   yarn compile
   yarn deploy
   yarn verify
   yarn deploy:all
   ```

3. **Deployment Files:**
   ```bash
   # Check these exist
   ls deployments/84532-baseSepolia.json
   ls deployments/baseSepolia/NFTRaffleVRF.json
   ls deployments/baseSepolia/RwaAssetNFT.json
   ```

4. **Contract Interaction:**
   ```bash
   # Test contract interaction
   npx hardhat console --network baseSepolia
   # In console: await ethers.getContractAt("NFTRaffleVRF", "your-contract-address")
   ```

**If everything works, you're ready to build on top of these contracts!** 🎉

### Quick Deploy

Deploy to Base Sepolia (default):
```bash
# Check account status first
yarn account

# Deploy and verify in one command
yarn deploy:all

# Or deploy only
yarn deploy

# Or verify only
yarn verify
```

### Deploy to Specific Network

```bash
# Ethereum Mainnet
yarn deploy:mainnet

# Base Mainnet
yarn deploy:base

# Base Sepolia
yarn deploy:baseSepolia

# Polygon
yarn deploy:polygon

# Arbitrum
yarn deploy:arbitrum

# Optimism
yarn deploy:optimism
```

### Custom Deployment

```bash
# Deploy with custom parameters
npx hardhat deploy --network <network> --tags <contract-tags>

# Deploy specific contracts only
npx hardhat deploy --network <network> --tags RwaAssetNFT
npx hardhat deploy --network <network> --tags NFTRaffleVRF
```

### Deployment Artifacts

After deployment, you'll find:
- **Contract addresses**: `deployments/<network>/<contract>.json`
- **ABIs**: `contracts/abis/` directory
- **TypeScript types**: `typechain-types/` directory

### Verification

After deployment, verify contracts using V2 API:
```bash
# Verify all contracts (recommended)
yarn verify

# Verify specific network
yarn verify --network baseSepolia
yarn verify --network base
yarn verify --network arbitrum
```

## 📖 Usage

### Creating a Raffle

```solidity
// Only addresses with RAFFLE_CREATOR_ROLE can create raffles
function createRaffle(
    address _nftContract,
    uint256 _nftTokenId,
    string calldata _nftName,
    string calldata _nftDescription,
    string calldata _nftImageUrl,
    uint256 _ticketPrice,
    uint256 _minTickets,
    uint256 _maxTickets,
    uint256 _maxPerWallet,
    uint256 _startTime,
    uint256 _endTime
) external onlyRole(RAFFLE_CREATOR_ROLE)
```

### Buying Tickets

```solidity
// Users can buy tickets with USDC (payments go directly to escrowWallet)
function buyTickets(uint256 raffleId, uint256 count) external
```

### Drawing Winner

```solidity
// Anyone can trigger winner selection when conditions are met
function drawWinner(uint256 raffleId) external
```

### Claiming Prizes

```solidity
// For winners who want the NFT (owner only)
function releaseNFT(uint256 rid) external onlyOwner

// For winners who want cash instead of NFT (owner only)
function cashOutWinner(uint256 rid, uint256 payout) external onlyOwner

// For refunds when raffle fails
function claimRefund(uint256 rid) external
```

### Failed Raffle Handling

```solidity
// Owner can finalize failed raffles (returns NFT to creator)
function finalizeFailedRaffle(uint256 rid) external onlyOwner
```

## 🔒 Security

### Never commit secrets

- **`.env`** must never be committed. It is in `.gitignore`. Use **`.env.example`** as a template; copy to `.env` locally and add your own keys.
- Do not commit **DEPLOYER_PRIVATE_KEY**, **ALCHEMY_API_KEY**, **ETHERSCAN_API_KEY**, or any other secrets.

### Security Features

- **Reentrancy Protection**: All external calls are protected
- **Access Control**: Role-based permissions for all operations
- **Pausable**: Emergency pause functionality
- **Safe Transfers**: OpenZeppelin SafeERC20 and ERC721 safety
- **VRF Security**: Gelato VRF for provably fair randomness

### Audit Considerations

- All external calls use the checks-effects-interactions pattern
- State changes occur before external transfers
- Comprehensive input validation
- Proper error handling and custom errors

### Best Practices

- Always verify contract addresses before interaction
- Use the latest OpenZeppelin contracts
- Implement proper access controls
- Regular security audits recommended

## 🧪 Testing

### Run Tests

```bash
# Run all tests
yarn test

# Run specific test file
yarn test test/raffle.spec.ts

# Run with gas reporting
yarn test:gas

# Run with coverage
yarn test:coverage
```

### Test Coverage

The test suite covers:
- Raffle creation and management
- Ticket purchasing and validation
- Winner selection and VRF integration
- Refund mechanisms
- Access control and permissions
- Edge cases and error conditions

## 📊 Gas Optimization

- **viaIR Compiler**: Enabled for optimal gas usage
- **Optimizer Runs**: Set to 200 for balanced size/speed
- **Efficient Storage**: Optimized data structures
- **Batch Operations**: Support for batch ticket purchases

## 🌐 Supported Networks

- **Monad** (Testnet `monadTestnet`, Mainnet `monadMainnet`)
- Base (Mainnet & Sepolia)
- Ethereum Mainnet & Sepolia
- Polygon (Mainnet & Mumbai)
- Arbitrum (Mainnet & Sepolia)
- Optimism (Mainnet & Sepolia)
- Scroll (Mainnet & Sepolia)
- PGN (Mainnet & Testnet)

## 🧪 Testing & Troubleshooting

### Pre-Deployment Testing

**1. Check Account Status**
```bash
# List all accounts and their nonce/balance across networks
yarn account
```

**2. Verify Network Connection**
```bash
# Test connection to specific network
npx hardhat console --network baseSepolia
# In console: await ethers.provider.getNetwork()
```

**3. Compile Contracts**
```bash
# Compile with detailed output
yarn compile
# or
npx hardhat compile --verbose
```

### Deployment Testing

**1. Test Deployment (Dry Run)**
```bash
# Deploy to test network first
yarn deploy:baseSepolia
```

**2. Check Deployment Status**
```bash
# List all deployments
npx hardhat deploy --list

# Check specific network deployments
ls deployments/84532-baseSepolia.json
```

**3. Verify Contracts**
```bash
# Verify all contracts using V2 API (recommended)
yarn verify

# Verify specific network
yarn verify --network baseSepolia
yarn verify --network base
yarn verify --network arbitrum

# The verification script automatically:
# - Reads contract addresses from deployment artifacts
# - Uses correct constructor arguments
# - Works with V2 API across all supported chains
```

**Note**: 
- Requires a valid Etherscan V2 API key in your `.env` file
- Single API key works across 50+ chains (Base, Arbitrum, Optimism, Polygon, etc.)
- If verification fails, you can manually verify on the respective block explorer
- The verification script automatically reads contract addresses and constructor arguments from deployment artifacts
- No need to manually update addresses - the script works with any network you've deployed to

### Common Issues & Solutions

**Compilation Errors**
```bash
# If you get "Stack too deep" errors, ensure viaIR is enabled
# This is already configured in hardhat.config.ts
yarn compile
```

**Nonce Errors (Most Common)**
```bash
# Error: "nonce has already been used"
# Solution 1: Wait and retry
sleep 30 && yarn deploy

# Solution 2: Check account nonce
yarn account

# Solution 3: Reset nonce (if needed)
npx hardhat console --network baseSepolia
# In console: await ethers.provider.getTransactionCount("your-address")
```

**Gas Price Errors**
```bash
# Error: "replacement fee too low" or "replacement transaction underpriced"
# Solution 1: Wait and retry (Recommended)
sleep 30 && yarn deploy

# Solution 2: Deploy with higher gas price
npx hardhat deploy --network baseSepolia --gas-price 2000000000

# Solution 3: Check current gas price
npx hardhat console --network baseSepolia
# In console: await ethers.provider.getGasPrice()
```

**Deployment Failures**
```bash
# Check your environment variables
npx hardhat run scripts/deploy.ts --network baseSepolia --verbose

# Verify network connection
npx hardhat console --network baseSepolia

# Check gas price
npx hardhat console --network baseSepolia
# In console: await ethers.provider.getGasPrice()
```

**VRF Issues**
- Ensure `GELATO_OPERATOR` is correct for your network
- Check that the operator has sufficient permissions
- Verify Gelato VRF is properly configured
- Test VRF connection: `yarn account` (check nonce on target network)

**Verification Issues**
```bash
# Error: "Invalid API Key (#err2)|BASE1-"
# Solution: Get Etherscan V2 API key from https://etherscan.io/apis

# Error: "bytecode doesn't match any of your local contracts"
# Solution 1: Recompile and redeploy
yarn compile --force
yarn deploy

# Solution 2: Check constructor arguments match current contract
# Compare deployment file with current contract constructor

# Solution 3: Manual verification on block explorer
# Copy contract source code and verify manually

# Check what networks support verification
npx hardhat verify --list-networks

# Get detailed verification help
npx hardhat verify --help
```

**Network Connection Issues**
```bash
# Test network connection
npx hardhat console --network baseSepolia

# Check if network is supported for verification
npx hardhat verify --list-networks | grep baseSepolia

# Verify network configuration in hardhat.config.ts
# Check if Base Sepolia is properly configured
```

**Gas Issues**
```bash
# Run tests with gas reporting
yarn test:gas

# Check gas usage during deployment
yarn deploy:baseSepolia --gas-report
```

### Testing Commands

**Run All Tests**
```bash
# Run complete test suite
yarn test

# Run with gas reporting
yarn test:gas

# Run with coverage
yarn test:coverage
```

**Run Specific Tests**
```bash
# Run specific test file
yarn test test/raffle.spec.ts

# Run specific test with pattern
yarn test --grep "should create raffle"
```

**Debug Test Issues**
```bash
# Run tests with detailed output
yarn test --verbose

# Run single test file with gas report
yarn test test/raffle.spec.ts --gas-report
```

### Network-Specific Testing

**Base Sepolia (Recommended for Testing)**
```bash
# Check account status
yarn account

# Deploy and verify in one command
yarn deploy:all

# Or deploy only
yarn deploy

# Or verify only
yarn verify

# Run tests on testnet
yarn test --network baseSepolia
```

**Local Testing**
```bash
# Start local hardhat node
yarn chain

# In another terminal, deploy locally
yarn deploy --network localhost

# Run tests locally
yarn test --network localhost
```

### Debug Commands

**General Debugging**
```bash
# Compile with detailed output
npx hardhat compile --verbose

# Force recompile (useful when contracts don't match)
yarn compile --force

# Check deployment status
npx hardhat deploy --list

# Generate TypeScript types
yarn compile

# Lint code
yarn lint

# Format code
yarn format
```

**Network & Chain Information**
```bash
# List all supported networks for verification
npx hardhat verify --list-networks

# Check account status across all networks
yarn account

# Get network information in console
npx hardhat console --network baseSepolia
# In console: await ethers.provider.getNetwork()
# In console: await ethers.provider.getGasPrice()
# In console: await ethers.provider.getBlockNumber()
# In console: await ethers.provider.getTransactionCount("your-address")
```

**Verification Commands**
```bash
# Get verification help
npx hardhat verify --help

# List verification options
npx hardhat verify --list-networks

# Verify with constructor arguments
npx hardhat verify --network baseSepolia <address> <arg1> <arg2> <arg3> <arg4> <arg5>

# Example for RwaAssetNFT:
npx hardhat verify --network baseSepolia <address> "Rafflemint RWA Asset NFT" "RMNFT" <deployer> <royaltyReceiver> 250

# Example for NFTRaffleVRF:
npx hardhat verify --network baseSepolia <address> <usdc> <feeWallet> <escrowWallet> <feeBps> <gelatoOperator>
```

**Network Debugging**
```bash
# Check network status
yarn account

# Test specific network
npx hardhat console --network baseSepolia

# List all supported networks for verification
npx hardhat verify --list-networks

# Check contract deployment
npx hardhat verify --list --network baseSepolia

# Get help for verification commands
npx hardhat verify --help

# Check network connection and get network info
npx hardhat console --network baseSepolia
# In console: await ethers.provider.getNetwork()
# In console: await ethers.provider.getGasPrice()
# In console: await ethers.provider.getBlockNumber()
```

**Contract Interaction**
```bash
# Open console for contract interaction
npx hardhat console --network baseSepolia

# In console, interact with deployed contracts:
# const contract = await ethers.getContractAt("NFTRaffleVRF", "0x...")
# await contract.getRaffle(1)
```

### Troubleshooting Checklist

**Before Deployment:**
- [ ] Environment variables set correctly
- [ ] Account has sufficient balance (`yarn account`)
- [ ] Network connection stable (`npx hardhat console --network baseSepolia`)
- [ ] Contracts compile without errors (`yarn compile`)
- [ ] Check nonce status (`yarn account`)

**During Deployment:**
- [ ] Monitor nonce status with `yarn account`
- [ ] Check gas price if transactions are slow
- [ ] Wait for previous transactions to confirm
- [ ] Use `sleep 30 && yarn deploy` if nonce or gas issues
- [ ] If "replacement fee too low" error: wait 30 seconds and retry
- [ ] If "nonce has already been used" error: wait 30 seconds and retry

**After Deployment:**
- [ ] Check deployment status (`npx hardhat deploy --list`)
- [ ] Verify contracts using V2 API (`yarn verify`)
- [ ] Test contract functions
- [ ] Check deployment artifacts (`ls deployments/`)
- [ ] Update frontend with new addresses

**Debugging Steps:**
- [ ] Run `yarn account` to check account status
- [ ] Run `npx hardhat verify --list-networks` to check supported networks
- [ ] Run `npx hardhat console --network baseSepolia` to test connection
- [ ] Check constructor arguments match deployed contracts
- [ ] Use `yarn compile --force` if bytecode doesn't match

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Solidity style guide
- Write comprehensive tests
- Update documentation
- Ensure all tests pass
- Follow conventional commits
- Test on multiple networks before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: [Coming Soon]

## ⚠️ Disclaimer

This software is provided "as is" without warranty. Use at your own risk. Always conduct thorough testing before deploying to mainnet.

---

## 👨‍💻 Credits

**Code built by [Justin Taylor](mailto:justin@noviclabs.com) with [Decentral Bros](https://www.decentralbros.io) & [Noviclabs](https://www.noviclabs.com)**

### Contact & Links

- **Email**: [justin@noviclabs.com](mailto:justin@noviclabs.com)
- **X (Twitter)**: [@DecentralBros_](https://www.x.com/DecentralBros_)
- **Website**: [www.decentralbros.io](https://www.decentralbros.io)

### Organizations

- **[Decentral Bros](https://www.decentralbros.io)** - Blockchain development and innovation
- **[Noviclabs](https://www.noviclabs.com)** - Technology solutions and consulting

---

**Built with ❤️ by the Decentral Bros team**

*01000100 01000010 01010010 01001111 01010011*


# Alchemy | Etherscan | Deployer Key
ALCHEMY_API_KEY=""
DEPLOYER_PRIVATE_KEY=""
ETHERSCAN_API_KEY=""

# Base Sepolia Network Configuration
USDC="0x94d07C7Aa3F8910ACeF21300098DA9171d06220C" # Our test USDC Address
FEE_RECIPIENT="0x6B2DF84D386Fef301E8391FDA755032E3c887095" # Fee Test Wallet Name ( Raffle Mini Test )
ESCROW_WALLET="0xD5913d9875903dA1Bd64aDf39Dbb790F301f4A33" # Test Escrow Wallet ( Noviclabs Test Wallet )
FEE_BPS="100"

# Justins Whitelisted Gelato VRF Dashboard Configuration Addreess
GELATO_OPERATOR="0x2117f933e30AA3B0258b1A73C44A89F286fE9991"

# Optional: For smoke testing only
NFT="your_nft_contract_address_here"
NFT_TOKEN_ID="1"

# Wallet Tom Hanks Test Getting The Ryolaties
ROYALTY_RECEIVER="0xAc30998272d5f656BbdBA86804c87d6803396b76"
ROYALTY_BPS="250"

# Network-Specific Settings
MAINNET_FORKING_ENABLED=false
