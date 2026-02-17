# Configuration Guide

Complete guide for configuring all components of the VWAP Simulation system.

---

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Smart Contract Configuration](#smart-contract-configuration)
3. [Keeper Bot Configuration](#keeper-bot-configuration)
4. [Flow Bot Configuration](#flow-bot-configuration)
5. [Frontend Configuration](#frontend-configuration)
6. [Network Configuration](#network-configuration)
7. [Deployment Parameters](#deployment-parameters)

---

## Environment Variables

### Required Files

The system uses three separate `.env` files:

```
Hardhat/.env                        # Deployment + bot configuration  
monad-miniapp-template/.env.local   # Frontend configuration
```

---

## Hardhat Configuration

**File:** `Hardhat/.env`

### Network & Deployment Credentials

```bash
# ===========================================
# RPC Provider
# ===========================================

# Alchemy API Key
# Get from: https://alchemy.com (create Monad Testnet app)
ALCHEMY_API_KEY="your_alchemy_api_key_here"

# Alternative: Custom RPC URL (if not using Alchemy)
# RPC_URL="https://monad-testnet.drpc.org"
```

### Private Keys

```bash
# ===========================================
# Wallet Private Keys
# ===========================================

# Deployer wallet (deploys contracts, seeds liquidity)
# Needs: ~5 MON for deployment gas
DEPLOYER_PRIVATE_KEY="0x1234..."

# Keeper wallet (executes VWAP slices)
# Needs: ~3 MON for execution gas
KEEPER_PRIVATE_KEY="0x5678..."

# Flow bot wallet (creates market movement)
# Needs: ~3 MON for trading gas
FLOW_BOT_PRIVATE_KEY="0x9abc..."
```

**Security Notes:**
- NEVER commit private keys to git
- Use separate wallets for each role
- Store keys securely (consider hardware wallets for production)
- Rotate keys if compromised

### Contract Deployment Parameters

```bash
# ===========================================
# AMM Configuration
# ===========================================

# Trading fee in basis points (30 = 0.3%)
# Range: 0-9999 (0% - 99.99%)
# Recommended: 10-50 (0.1% - 0.5%)
AMM_FEE_BPS="30"

# Initial token supplies
# MockUSDC (6 decimals): 5,000,000 USDC
MOCK_USDC_INITIAL_SUPPLY="5000000"

# MockMON (18 decimals): 5,000,000 MON  
MOCK_MON_INITIAL_SUPPLY="5000000"

# Initial liquidity seeding (creates 1:1 price)
# USDC amount (6 decimals): 250,000 USDC
AMM_SEED_USDC="250000"

# MON amount (18 decimals): 250,000 MON
AMM_SEED_MON="250000"
```

**Price Calculation:**
```
Initial Price = AMM_SEED_USDC / AMM_SEED_MON
Example: 250,000 / 250,000 = 1.0 (1 USDC = 1 MON)

To set different initial price:
- For 1 USDC = 2 MON: AMM_SEED_MON="500000"
- For 2 USDC = 1 MON: AMM_SEED_USDC="500000"
```

### Bot Runtime Configuration

```bash
# ===========================================
# Keeper Bot Settings
# ===========================================

# RPC endpoint for keeper
# Can reuse ALCHEMY_API_KEY or use separate endpoint
KEEPER_RPC_URL="https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}"

# Alternative: Public RPC (rate limited)
# KEEPER_RPC_URL="https://monad-testnet.drpc.org"

# Polling interval in milliseconds
# Default: 7000 (7 seconds)
# Lower = more responsive, higher RPC costs
# Higher = less responsive, lower costs
KEEPER_POLL_INTERVAL_MS="7000"

# Gas limit for slice execution transactions
# Default: 700000 (safe upper bound)
# Too low = transactions fail
# Too high = wasted gas
KEEPER_TX_GAS_LIMIT="700000"

# Extra slippage buffer in basis points
# Default: 20 (0.2%)
# Keeper adds this to user's maxSlippageBps
# Accounts for price movement between quote and execution
MIN_OUT_EXTRA_BPS="20"

# ===========================================
# Flow Bot Settings  
# ===========================================

# RPC endpoint for flow bot
FLOW_BOT_RPC_URL="https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}"

# Trading interval in milliseconds
# Default: 15000 (15 seconds)
# Lower = more market activity, higher gas costs
# Higher = less activity, more realistic
FLOW_INTERVAL_MS="15000"

# Minimum trade size in USDC notional
# Default: 5 USDC
FLOW_MIN_SIZE_USDC="5"

# Maximum trade size in USDC notional  
# Default: 75 USDC
# Keep below 0.1% of pool size to avoid excessive impact
FLOW_MAX_SIZE_USDC="75"
```

### Contract Addresses (Filled After Deployment)

```bash
# ===========================================
# Deployed Contract Addresses
# ===========================================

# VWAPEngine contract address
# Filled by deployment script
VWAP_ENGINE_ADDRESS=""

# SimpleAMM contract address
SIMPLE_AMM_ADDRESS=""

# MockUSDC token address
MOCK_USDC_ADDRESS=""

# MockMON token address  
MOCK_MON_ADDRESS=""
```

**Post-Deployment Workflow:**
```bash
# 1. Deploy contracts
yarn deploy --network monad

# 2. Copy addresses from deployment output
# Example output:
# MockUSDC:   0xAbC123...
# MockMON:    0xDeF456...  
# SimpleAMM:  0x789GhI...
# VWAPEngine: 0xJkL012...

# 3. Update .env file
VWAP_ENGINE_ADDRESS="0xJkL012..."
SIMPLE_AMM_ADDRESS="0x789GhI..."
MOCK_USDC_ADDRESS="0xAbC123..."
MOCK_MON_ADDRESS="0xDeF456..."

# 4. Restart bots to pick up new addresses
```

---

## Frontend Configuration

**File:** `monad-miniapp-template/.env.local`

```bash
# ===========================================
# Contract Addresses
# ===========================================

# Copy from Hardhat/.env after deployment
NEXT_PUBLIC_VWAP_ENGINE_ADDRESS="0xJkL012..."
NEXT_PUBLIC_SIMPLE_AMM_ADDRESS="0x789GhI..."  
NEXT_PUBLIC_TOKEN_IN_ADDRESS="0xAbC123..."   # MockUSDC
NEXT_PUBLIC_TOKEN_OUT_ADDRESS="0xDeF456..."  # MockMON

# ===========================================
# Network Configuration
# ===========================================

# Monad testnet chain ID
NEXT_PUBLIC_CHAIN_ID="10143"

# RPC endpoint (optional, wagmi uses MetaMask's RPC by default)
NEXT_PUBLIC_RPC_URL="https://monad-testnet.g.alchemy.com/v2/YOUR_KEY"

# Block explorer base URL
NEXT_PUBLIC_EXPLORER_URL="https://testnet.monadexplorer.com"

# ===========================================
# UI Configuration
# ===========================================

# Order refresh interval (ms)
# Default: 5000 (5 seconds)
NEXT_PUBLIC_ORDER_REFRESH_INTERVAL="5000"

# Enable debug logging
# Default: false
NEXT_PUBLIC_DEBUG="false"

# Default slippage tolerance (bps)
# Default: 100 (1%)
NEXT_PUBLIC_DEFAULT_SLIPPAGE_BPS="100"

# Default impact tolerance (bps)
# Default: 300 (3%)
NEXT_PUBLIC_DEFAULT_IMPACT_BPS="300"
```

**Environment Variable Prefixes:**
- `NEXT_PUBLIC_*` - Exposed to browser (safe for contract addresses, chain IDs)
- No prefix - Server-side only (never use for secrets in Next.js)

---

## Smart Contract Configuration

### VWAPEngine Parameters

**Order Creation Constraints:**

```typescript
// Validation rules enforced in createOrder()
interface OrderConstraints {
  numSlices: {
    min: 1,
    max: 20,
    recommended: 5-10
  },
  
  maxSlippageBps: {
    min: 1,      // 0.01%
    max: 5000,   // 50%
    recommended: 50-200  // 0.5% - 2%
  },
  
  maxImpactBps: {
    min: 0,      // Disabled
    max: 5000,   // 50%
    recommended: 200-500  // 2% - 5%
  },
  
  intervalSec: {
    min: 0,      // No delay (not recommended)
    max: 2^64-1, // Effectively unlimited
    recommended: 60-300  // 1-5 minutes
  },
  
  deadline: {
    min: block.timestamp + 1,  // Must be future
    max: 2^64-1,  // ~584 years
    recommended: now + 3600 * (numSlices/2)  // Half slice duration
  },
  
  totalAmountIn: {
    min: 1,  // 1 wei
    max: 2^256-1,  // Effectively unlimited
    recommended: 100-10000 * 10^decimals  // Meaningful amounts
  }
}
```

**Gas Optimization:**

```solidity
// Order struct is packed to minimize storage slots
// Current layout uses ~5 slots
struct Order {
  // Slot 0-1: addresses (4 addresses × 20 bytes)
  // Slot 2-3: uint256 amounts (2 × 32 bytes)
  // Slot 4: packed small values (31 bytes used)
}

// Gas costs:
// - Create order: ~210,000 gas
// - Execute slice: ~175,000 gas  
// - Cancel order: ~70,000 gas
```

### SimpleAMM Parameters

**Initialization:**

```typescript
constructor(
  token0: address,      // First token in pair
  token1: address,      // Second token in pair  
  feeBps: uint16        // Trading fee in basis points
)

// Constraints:
// - token0 != token1
// - token0 != address(0) && token1 != address(0)
// - feeBps < 10000 (< 100%)
```

**Fee Recommendations:**

```typescript
const feeRecommendations = {
  stablecoin_pair: 10,   // 0.1% (USDC/USDT)
  major_pair: 30,        // 0.3% (ETH/USDC)
  volatile_pair: 100,    // 1.0% (long-tail tokens)
  
  // Monad hackathon demo:
  demo: 30  // 0.3% (standard Uniswap-style fee)
};
```

**Liquidity Guidelines:**

```typescript
// Minimum liquidity to avoid excessive slippage
const minLiquidity = {
  // For demo/testing:
  token0: 100_000 * 10**decimals0,  // 100k tokens
  token1: 100_000 * 10**decimals1,
  
  // For realistic testing:
  token0: 250_000 * 10**decimals0,  // 250k tokens (recommended)
  token1: 250_000 * 10**decimals1,
};

// Maximum order size relative to liquidity:
const maxOrderSize = liquidity * 0.05;  // Max 5% of pool per order
```

---

## Network Configuration

### Monad Testnet

**Chain Parameters:**

```javascript
const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://monad-testnet.g.alchemy.com/v2/YOUR_API_KEY'],
      webSocket: ['wss://monad-testnet.g.alchemy.com/v2/YOUR_API_KEY']
    },
    public: {
      http: ['https://monad-testnet.drpc.org']
    }
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monadexplorer.com'
    }
  },
  testnet: true,
  
  // Performance characteristics
  blockTime: 1,        // ~1 second blocks
  targetTPS: 10000,    // Target throughput
  finality: 'instant'  // Sub-second finality
};
```

### MetaMask Configuration

**Manual Network Add:**

```
Network Name: Monad Testnet
RPC URL: https://monad-testnet.g.alchemy.com/v2/YOUR_KEY
Chain ID: 10143
Currency Symbol: MON
Block Explorer: https://testnet.monadexplorer.com
```

**Programmatic Add (Frontend):**

```typescript
const addMonadNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x279F', // 10143 in hex
        chainName: 'Monad Testnet',
        nativeCurrency: {
          name: 'Monad',
          symbol: 'MON',
          decimals: 18
        },
        rpcUrls: ['https://monad-testnet.drpc.org'],
        blockExplorerUrls: ['https://testnet.monadexplorer.com']
      }]
    });
  } catch (error) {
    console.error('Failed to add network:', error);
  }
};
```

### Hardhat Network Config

**File:** `Hardhat/hardhat.config.ts`

```typescript
import { HardhatUserConfig } from 'hardhat/config';
import * as dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200  // Balance between deployment and runtime costs
      }
    }
  },
  
  networks: {
    monad: {
      url: process.env.ALCHEMY_API_KEY
        ? `https://monad-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : process.env.RPC_URL || 'https://monad-testnet.drpc.org',
      chainId: 10143,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
      
      // Gas configuration
      gasPrice: 'auto',      // Use network's suggested gas price
      gas: 'auto',           // Estimate gas per transaction
      
      // Timeout configuration
      timeout: 60000,        // 60 seconds
      httpHeaders: {},
      
      // For hardhat-deploy
      live: true,            // Network is live (not local)
      saveDeployments: true, // Save deployment artifacts
      tags: ['testnet']      // Tag for deployment scripts
    },
    
    // Local testing (optional)
    hardhat: {
      chainId: 31337,
      mining: {
        auto: true,
        interval: 1000  // 1 second blocks
      },
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
        count: 20
      }
    }
  },
  
  // Contract verification (optional)
  etherscan: {
    apiKey: {
      monad: process.env.ETHERSCAN_API_KEY || 'not-needed'
    },
    customChains: [{
      network: 'monad',
      chainId: 10143,
      urls: {
        apiURL: 'https://testnet.monadexplorer.com/api',
        browserURL: 'https://testnet.monadexplorer.com'
      }
    }]
  },
  
  // Named accounts for hardhat-deploy
  namedAccounts: {
    deployer: 0  // First account from DEPLOYER_PRIVATE_KEY
  },
  
  // Paths
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
    deploy: './deploy',
    deployments: './deployments'
  }
};

export default config;
```

---

## Deployment Parameters

### Production vs Demo Settings

**Demo/Hackathon (Current):**

```typescript
const demoConfig = {
  // Aggressive parameters for fast demo
  amm: {
    feeBps: 30,                    // 0.3%
    initialLiquidity: {
      usdc: 250_000,               // 250k USDC
      mon: 250_000                 // 250k MON (1:1 price)
    }
  },
  
  vwap: {
    maxSlices: 20,                 // Allow up to 20 slices
    minInterval: 0,                // No minimum delay
    defaultSlippage: 100,          // 1%
    defaultImpact: 300             // 3%
  },
  
  keeper: {
    pollInterval: 7_000,           // 7 seconds (fast)
    gasLimit: 700_000,             // High safety margin
    extraBuffer: 20                // 0.2% extra
  },
  
  flowBot: {
    interval: 15_000,              // 15 seconds
    minSize: 5,                    // 5 USDC
    maxSize: 75                    // 75 USDC (volatile)
  }
};
```

**Production (Recommended):**

```typescript
const productionConfig = {
  // Conservative parameters for production
  amm: {
    feeBps: 30,                    // 0.3%
    initialLiquidity: {
      usdc: 1_000_000,             // 1M USDC
      mon: 1_000_000               // 1M MON
    }
  },
  
  vwap: {
    maxSlices: 50,                 // Allow more granular execution
    minInterval: 60,               // 1 minute minimum between slices
    defaultSlippage: 50,           // 0.5% (tighter)
    defaultImpact: 200             // 2% (tighter)
  },
  
  keeper: {
    pollInterval: 15_000,          // 15 seconds (less aggressive)
    gasLimit: 500_000,             // Optimize for typical case
    extraBuffer: 10                // 0.1% extra (tighter)
  },
  
  flowBot: {
    interval: 60_000,              // 1 minute (less volatile)
    minSize: 100,                  // 100 USDC (realistic)
    maxSize: 1000                  // 1000 USDC (< 0.1% of pool)
  },
  
  security: {
    pausable: true,                // Add pause functionality
    timelocks: {
      admin: 2 * 24 * 3600,        // 2 days for admin changes
      emergency: 0                 // Immediate for emergency
    },
    rateLimit: {
      ordersPerUser: 10,           // Max orders per user
      windowSec: 3600              // Per hour
    }
  }
};
```

---

## Configuration Validation

### Pre-Deployment Checklist

```typescript
// Run before deployment
async function validateConfig() {
  const checks = [];
  
  // 1. Check private keys are set
  checks.push({
    name: 'Private keys',
    pass: !!process.env.DEPLOYER_PRIVATE_KEY &&
          !!process.env.KEEPER_PRIVATE_KEY &&
          !!process.env.FLOW_BOT_PRIVATE_KEY
  });
  
  // 2. Check RPC connectivity
  const provider = new JsonRpcProvider(process.env.KEEPER_RPC_URL);
  checks.push({
    name: 'RPC connectivity',
    pass: await provider.getBlockNumber() > 0
  });
  
  // 3. Check deployer has MON
  const balance = await provider.getBalance(deployerAddress);
  checks.push({
    name: 'Deployer balance',
    pass: balance > parseEther('5')  // Need at least 5 MON
  });
  
  // 4. Validate AMM parameters
  const feeBps = Number(process.env.AMM_FEE_BPS);
  checks.push({
    name: 'AMM fee',
    pass: feeBps > 0 && feeBps < 10000
  });
  
  // 5. Validate liquidity amounts
  const seedUsdc = Number(process.env.AMM_SEED_USDC);
  const seedMon = Number(process.env.AMM_SEED_MON);
  checks.push({
    name: 'Initial liquidity',
    pass: seedUsdc > 0 && seedMon > 0
  });
  
  // Print results
  console.log('\n=== Configuration Validation ===');
  checks.forEach(check => {
    console.log(`${check.pass ? '✓' : '✗'} ${check.name}`);
  });
  console.log('================================\n');
  
  return checks.every(c => c.pass);
}
```

### Runtime Validation

```typescript
// Run by bots on startup
async function validateRuntime() {
  // 1. Check contract addresses are deployed
  const vwapCode = await provider.getCode(VWAP_ENGINE_ADDRESS);
  if (vwapCode === '0x') {
    throw new Error('VWAPEngine not deployed');
  }
  
  // 2. Check bot wallets have MON
  const balance = await provider.getBalance(keeperAddress);
  if (balance < parseEther('1')) {
    console.warn('Keeper balance low, mint MON from faucet');
  }
  
  // 3. Verify contract ownership/permissions
  const owner = await simpleAmm.owner();
  console.log(`SimpleAMM owner: ${owner}`);
  
  // 4. Check AMM has liquidity
  const [reserve0, reserve1] = await simpleAmm.getReserves();
  if (reserve0 === 0n || reserve1 === 0n) {
    throw new Error('AMM has no liquidity');
  }
  
  console.log('✓ Runtime validation passed');
}
```

---

## Configuration Management Best Practices

### 1. Secret Management

```bash
# Use environment-specific files
.env.development
.env.staging  
.env.production

# Never commit to git
.gitignore:
.env
.env.*
!.env.example
```

### 2. Configuration Templates

```bash
# Provide example with dummy values
.env.example:
ALCHEMY_API_KEY="your_api_key_here"
DEPLOYER_PRIVATE_KEY="0x0000000000000000000000000000000000000000000000000000000000000000"
```

### 3. Validation Scripts

```bash
# Add to package.json
"scripts": {
  "validate:config": "ts-node scripts/validate-config.ts",
  "deploy": "yarn validate:config && hardhat deploy --network monad"
}
```

### 4. Documentation

```markdown
# Keep configuration changes documented
CHANGELOG.md:
## [1.0.1] - 2026-02-17
### Changed
- Increased KEEPER_POLL_INTERVAL_MS from 5s to 7s
- Reduced FLOW_MAX_SIZE_USDC from 100 to 75
- Reason: Reduce RPC costs, less market volatility
```

---

## Troubleshooting

### Common Configuration Issues

**Problem:** `Error: ALCHEMY_API_KEY not set`
```bash
# Solution: Ensure .env file exists and is loaded
cp .env.example .env
# Edit .env and add your Alchemy API key
```

**Problem:** `Error: insufficient funds for gas`
```bash
# Solution: Get MON from faucet
# Visit: https://faucet.monad.xyz/
# Paste your wallet address and claim tokens
```

**Problem:** `Error: nonce too low`
```bash
# Solution: Clear pending transactions or wait
# Reset MetaMask account:
# Settings → Advanced → Clear Activity Tab Data
```

**Problem:** Contract addresses not in .env
```bash
# Solution: Deploy contracts first
yarn deploy --network monad
# Then copy addresses from output to .env
```

**Problem:** Keeper not executing slices
```bash
# Check configuration:
1. Keeper wallet has MON?
2. VWAP_ENGINE_ADDRESS is correct?
3. KEEPER_RPC_URL is accessible?
4. Order timing constraints met?

# Enable debug logging:
KEEPER_DEBUG=true yarn keeper
```

This configuration guide provides all parameters needed to run the VWAP simulation system successfully.
