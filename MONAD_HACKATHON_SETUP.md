# Monad Hackathon Setup Guide
## VWAP Simulation Deployment Checklist

---

## ✅ Pre-Deployment Checklist

### 1. Network Configuration

**Monad Testnet Details:**
- Chain ID: `10143`
- Native Token: `MON`
- RPC URL: See options below
- Block Explorer: https://testnet.monadexplorer.com
- Target Performance: ~1s blocks, ~10,000 TPS

### 2. Required Accounts

You need **3 separate private keys**:

| Wallet | Purpose | Initial MON Needed |
|--------|---------|-------------------|
| Deployer | Deploy contracts, seed liquidity | 5 MON |
| Keeper | Execute VWAP slices | 3 MON |
| Flow Bot | Create market movement | 3 MON |

**Generate wallets:**
```bash
cd Hardhat
npx hardhat run scripts/generateAccount.ts.ts
# Run 3 times and save each private key securely
```

### 3. Get Testnet MON Tokens

**Faucet URLs (claim for all 3 wallets):**

1. **Official Monad Faucet** (Requires 0.001 ETH on Ethereum mainnet)
   ```
   https://faucet.monad.xyz/
   Limit: 1 request every 6 hours
   ```

2. **QuickNode Faucet**
   ```
   https://faucet.quicknode.com/monad/testnet
   Limit: Every 12 hours
   ```

3. **Alchemy Faucet** (No auth required)
   ```
   https://www.alchemy.com/faucets/monad-testnet
   Limit: Every 24 hours
   ```

4. **ETHGlobal Faucet** (For hackathon participants)
   ```
   https://ethglobal.com/faucet/monad-testnet-10143
   Amount: 0.2 MON/day
   Login required
   ```

**Pro tip:** Use multiple faucets to get tokens faster!

### 4. RPC Provider Setup

**Option A: Alchemy (Recommended)**
1. Go to https://alchemy.com
2. Sign up / Login
3. Create New App → Select "Monad Testnet"
4. Copy your API key

**Option B: QuickNode**
1. Go to https://quicknode.com
2. Create Monad Testnet endpoint
3. Copy your endpoint URL

**Option C: Public RPC (Free but rate-limited)**
```
https://monad-testnet.drpc.org
```

---

## 📝 Environment Configuration

### Step 1: Configure Hardhat Environment

```bash
cd "/Users/tharunekambaram/coding-projects/Monad VWAP simulation/Hardhat"
cp .env.example .env
```

Edit `Hardhat/.env`:

```bash
# ===========================================
# Network + deploy credentials
# ===========================================

# Alchemy API Key (from alchemy.com)
ALCHEMY_API_KEY="your_alchemy_key_here"

# Deployer wallet private key (from step 2)
DEPLOYER_PRIVATE_KEY="0x..."

# Optional: Etherscan API key for verification (not critical for demo)
ETHERSCAN_API_KEY=""

# ===========================================
# VWAP simulation deployment params
# ===========================================

# AMM fee (30 bps = 0.3%)
AMM_FEE_BPS="30"

# Initial token supplies (5M each)
MOCK_USDC_INITIAL_SUPPLY="5000000"
MOCK_MON_INITIAL_SUPPLY="5000000"

# Initial liquidity (250k each = 1:1 price)
AMM_SEED_USDC="250000"
AMM_SEED_MON="250000"

# ===========================================
# Bot/runtime credentials
# ===========================================

# Keeper bot private key
KEEPER_PRIVATE_KEY="0x..."

# Keeper RPC (can be same as Alchemy or use public)
KEEPER_RPC_URL="https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}"

# Flow bot private key
FLOW_BOT_PRIVATE_KEY="0x..."

# Flow bot RPC (can be same as Alchemy or use public)
FLOW_BOT_RPC_URL="https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}"

# Contract addresses (filled AFTER deployment)
VWAP_ENGINE_ADDRESS=""
SIMPLE_AMM_ADDRESS=""
MOCK_USDC_ADDRESS=""
MOCK_MON_ADDRESS=""

# ===========================================
# Bot configuration (defaults are good)
# ===========================================

# Keeper polls every 7 seconds
KEEPER_POLL_INTERVAL_MS="7000"

# Gas limit for slice execution
KEEPER_TX_GAS_LIMIT="700000"

# Extra slippage buffer (20 bps = 0.2%)
MIN_OUT_EXTRA_BPS="20"

# Flow bot trades every 15 seconds
FLOW_INTERVAL_MS="15000"

# Random trade size between 5-75 USDC
FLOW_MIN_SIZE_USDC="5"
FLOW_MAX_SIZE_USDC="75"
```

### Step 2: Verify Hardhat Config

Check that `Hardhat/hardhat.config.ts` includes Monad testnet:

```typescript
networks: {
  monad: {
    url: process.env.ALCHEMY_API_KEY
      ? `https://monad-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      : "https://monad-testnet.drpc.org",
    chainId: 10143,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY],
  }
}
```

---

## 🚀 Deployment Steps

### Step 1: Install Dependencies

```bash
cd "/Users/tharunekambaram/coding-projects/Monad VWAP simulation/Hardhat"
yarn install
# or: npm install
```

### Step 2: Add MetaMask Network (For Frontend Testing)

Open MetaMask → Networks → Add Network → Add Manually:

```
Network Name: Monad Testnet
RPC URL: https://monad-testnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
Chain ID: 10143
Currency Symbol: MON
Block Explorer: https://testnet.monadexplorer.com
```

### Step 3: Deploy Contracts

```bash
cd "/Users/tharunekambaram/coding-projects/Monad VWAP simulation/Hardhat"
yarn deploy --network monad
# or: npx hardhat deploy --network monad
```

**Expected output:**
```
Deploying MockUSDC...
MockUSDC deployed at 0x...

Deploying MockMON...
MockMON deployed at 0x...

Deploying SimpleAMM...
SimpleAMM deployed at 0x...

Deploying VWAPEngine...
VWAPEngine deployed at 0x...

Seeding AMM liquidity...
AMM seeded with initial liquidity.

=== Deployment Summary ===
MockUSDC:   0xAbC123...
MockMON:    0xDeF456...
SimpleAMM:  0x789GhI...
VWAPEngine: 0xJkL012...
=========================
```

### Step 4: Update .env with Deployed Addresses

Copy addresses from deployment output and update `Hardhat/.env`:

```bash
VWAP_ENGINE_ADDRESS="0xJkL012..."
SIMPLE_AMM_ADDRESS="0x789GhI..."
MOCK_USDC_ADDRESS="0xAbC123..."
MOCK_MON_ADDRESS="0xDeF456..."
```

### Step 5: Verify Deployment (Optional)

Check contracts on explorer:
```
https://testnet.monadexplorer.com/address/YOUR_CONTRACT_ADDRESS
```

---

## 🤖 Start Bots

### Terminal 1: Keeper Bot

```bash
cd "/Users/tharunekambaram/coding-projects/Monad VWAP simulation/Hardhat"
yarn keeper
# or: npx ts-node scripts/keeper.ts
```

**Expected output:**
```
Keeper started for 0xJkL012...
Keeper wallet: 0x...
Polling every 7000ms
```

### Terminal 2: Flow Bot

```bash
cd "/Users/tharunekambaram/coding-projects/Monad VWAP simulation/Hardhat"
yarn flow-bot
# or: npx ts-node scripts/flow-bot.ts
```

**Expected output:**
```
Flow bot started with wallet 0x...
Interval 15000ms
[flow] swap 23.4567 mUSDC tx=0x...
[flow] swap 0.0312 mMON tx=0x...
```

---

## 🎨 Frontend Setup

### Step 1: Configure Frontend Environment

```bash
cd "/Users/tharunekambaram/coding-projects/Monad VWAP simulation/monad-miniapp-template"
cp .env.example .env.local
```

Edit `monad-miniapp-template/.env.local`:

```bash
# Copy from Hardhat/.env after deployment
NEXT_PUBLIC_VWAP_ENGINE_ADDRESS="0xJkL012..."
NEXT_PUBLIC_SIMPLE_AMM_ADDRESS="0x789GhI..."
NEXT_PUBLIC_TOKEN_IN_ADDRESS="0xAbC123..."  # MockUSDC
NEXT_PUBLIC_TOKEN_OUT_ADDRESS="0xDeF456..."  # MockMON

# Monad testnet RPC (optional, for frontend reads)
NEXT_PUBLIC_RPC_URL="https://monad-testnet.g.alchemy.com/v2/YOUR_KEY"
```

### Step 2: Install & Run Frontend

```bash
cd "/Users/tharunekambaram/coding-projects/Monad VWAP simulation/monad-miniapp-template"
pnpm install
pnpm dev
```

Open: http://localhost:3000

---

## 🎯 Demo Script

### 1. Connect Wallet
- Open frontend at localhost:3000
- Connect MetaMask (ensure Monad Testnet is selected)

### 2. Get Test Tokens (In UI)
- Click "Faucet" button
- Mint 10,000 MockUSDC
- Mint 10,000 MockMON

### 3. Create VWAP Order
```
Token In: MockUSDC
Token Out: MockMON
Amount: 1000 USDC
Slices: 5
Interval: 60 seconds
Max Slippage: 1% (100 bps)
Max Impact: 3% (300 bps)
Deadline: 1 hour from now
```

### 4. Watch Execution
- Keeper bot detects order
- Executes slice every 60 seconds
- Flow bot creates market movement
- See real-time updates in UI

### 5. Demo Highlights

**Show judges:**
1. **Order creation tx** on block explorer
2. **Keeper executing slices** in parallel (if multiple orders)
3. **Flow bot creating realistic price movement**
4. **Risk checks working** (try creating order during high volatility)
5. **Final execution quality** (VWAP vs instant execution comparison)

---

## 🔧 Troubleshooting

### "Insufficient funds for gas"
- Get more MON from faucets
- Wait 6-24 hours between faucet claims
- Use multiple faucet sources

### "Transaction reverted"
- Check gas limits in .env
- Ensure contracts are deployed
- Verify addresses in .env

### "RPC rate limit exceeded"
- Upgrade Alchemy/QuickNode plan
- Use multiple RPC endpoints
- Add delays between transactions

### "Keeper not executing slices"
- Check KEEPER_PRIVATE_KEY is set
- Ensure keeper wallet has MON
- Verify order timing (nextExecutionTime)
- Check keeper terminal for errors

### "Flow bot not trading"
- Check FLOW_BOT_PRIVATE_KEY is set
- Ensure flow bot wallet has MON
- Verify AMM has liquidity
- Check flow bot terminal logs

---

## 📊 Success Metrics for Demo

**Must have:**
- ✅ Contracts deployed to Monad testnet
- ✅ At least 1 complete VWAP order execution
- ✅ Tx hashes visible on block explorer
- ✅ Real-time UI updates from chain

**Nice to have:**
- ✅ Multiple orders executing in parallel
- ✅ Risk check rejection (show during volatility)
- ✅ VWAP vs instant execution comparison
- ✅ Price charts showing market movement

**Judge impact factors:**
- 🔥 Shows Monad's parallel execution advantage
- 🔥 Production-grade risk management
- 🔥 Realistic market simulation
- 🔥 Complete end-to-end demo (contracts → bots → UI)

---

## 🎓 Innovation Talking Points

**For judges:**

1. **Parallel Execution Showcase**
   - "Multiple VWAP orders can execute simultaneously without conflicts"
   - "Traditional EVMs would process these sequentially"
   - "Monad's parallel EVM enables 10-100x better throughput"

2. **Production-Grade Risk Management**
   - "Dual slippage protection: user-defined + keeper override"
   - "Market impact checks prevent execution in illiquid conditions"
   - "Time-based scheduling prevents MEV exploitation"

3. **Real Market Simulation**
   - "Flow bot creates realistic price movement, not fake numbers"
   - "All execution quality is measurable and explainable"
   - "Demonstrates how VWAP reduces slippage vs instant execution"

4. **Extensibility**
   - "Foundation for limit orders, stop-loss, algorithmic trading"
   - "Can integrate with real DEXs (Uniswap, etc.)"
   - "Multi-venue routing for best execution"

---

## 📞 Support Resources

**Monad Docs:** https://docs.monad.xyz/
**Monad Discord:** https://discord.gg/monad
**Faucet:** https://faucet.monad.xyz/
**Explorer:** https://testnet.monadexplorer.com

**Project Files:**
- Contracts: `Hardhat/contracts/`
- Bots: `Hardhat/scripts/keeper.ts` & `flow-bot.ts`
- Deploy: `Hardhat/deploy/00_deploy_your_contracts.ts`
- Frontend: `monad-miniapp-template/`

---

## 🏆 Final Checklist

Before demo:
- [ ] All 3 wallets have MON
- [ ] Contracts deployed successfully
- [ ] .env files configured with addresses
- [ ] Keeper bot running and executing
- [ ] Flow bot running and creating trades
- [ ] Frontend connected to testnet
- [ ] MetaMask on Monad Testnet network
- [ ] Test order created and completed
- [ ] Block explorer links ready to show

**Good luck! 🚀**
