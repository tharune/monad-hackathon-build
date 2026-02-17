# VWAP Simulation System Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [Sequence Diagrams](#sequence-diagrams)
5. [State Management](#state-management)
6. [Security Model](#security-model)

---

## System Overview

The VWAP (Volume-Weighted Average Price) Simulation is a complete DeFi execution infrastructure that demonstrates algorithmic order execution on Monad's parallel EVM. The system splits large trades into smaller "slices" executed over time to reduce market impact and achieve better average execution prices.

### Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)          │  MetaMask Wallet                 │
│  - Order Creation UI         │  - Transaction Signing           │
│  - Order Monitoring          │  - Balance Management            │
│  - Risk Dashboard            │  - Network Switching             │
└──────────────────┬───────────┴──────────────────────────────────┘
                   │
                   │ Web3 RPC Calls
                   │
┌──────────────────▼───────────────────────────────────────────────┐
│                    Blockchain Layer (Monad Testnet)              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │  MockERC20      │    │   MockERC20      │                   │
│  │  (MockUSDC)     │    │   (MockMON)      │                   │
│  │  - 6 decimals   │    │   - 18 decimals  │                   │
│  │  - Faucet       │    │   - Faucet       │                   │
│  └────────┬────────┘    └────────┬─────────┘                   │
│           │                      │                               │
│           └──────────┬───────────┘                               │
│                      │                                           │
│           ┌──────────▼──────────────┐                           │
│           │     SimpleAMM           │                           │
│           │  - Constant Product     │                           │
│           │  - x*y=k formula        │                           │
│           │  - 0.3% fee             │                           │
│           │  - Liquidity pools      │                           │
│           └──────────┬──────────────┘                           │
│                      │                                           │
│                      │ Swap Execution                            │
│                      │                                           │
│           ┌──────────▼──────────────┐                           │
│           │    VWAPEngine           │                           │
│           │  - Order Management     │                           │
│           │  - Slice Scheduling     │                           │
│           │  - Risk Controls        │                           │
│           │  - Token Escrow         │                           │
│           └─────────────────────────┘                           │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                   ▲                      ▲
                   │                      │
                   │ Event Listening      │ Random Swaps
                   │ Slice Execution      │ Price Movement
                   │                      │
┌──────────────────┴──────────┐  ┌───────┴──────────────────────┐
│      Keeper Bot              │  │      Flow Bot                │
│  - Monitors orders           │  │  - Creates market activity   │
│  - Executes eligible slices  │  │  - Random trade direction    │
│  - Risk validation           │  │  - Variable trade sizes      │
│  - Gas management            │  │  - Continuous operation      │
└──────────────────────────────┘  └──────────────────────────────┘
```

---

## Component Architecture

### 1. Smart Contracts

#### MockERC20.sol
**Purpose:** Test tokens with public faucet  
**Location:** `Hardhat/contracts/MockERC20.sol`

**Key Features:**
- Standard ERC20 implementation
- Custom decimals support (6 for USDC, 18 for MON)
- Public `faucet()` function for unlimited minting
- No supply cap (testnet only)

**Storage:**
```solidity
mapping(address => uint256) private _balances
mapping(address => mapping(address => uint256)) private _allowances
uint8 private immutable _tokenDecimals
```

**Public Interface:**
```solidity
function faucet(address to, uint256 amount) external
function decimals() public view returns (uint8)
// + standard ERC20 functions
```

---

#### SimpleAMM.sol
**Purpose:** Constant product market maker for token swaps  
**Location:** `Hardhat/contracts/SimpleAMM.sol`

**Mathematical Model:**
```
Constant Product Formula: x * y = k
Where:
  x = reserve0 (token0 balance)
  y = reserve1 (token1 balance)
  k = constant product

Price Calculation:
  price_token0_in_token1 = reserve1 / reserve0
  price_token1_in_token0 = reserve0 / reserve1

Swap Output Formula:
  amountOut = (amountIn * (1 - fee) * reserveOut) / (reserveIn + amountIn * (1 - fee))
```

**State Variables:**
```solidity
IERC20 public immutable token0       // First token in pair
IERC20 public immutable token1       // Second token in pair
uint256 public reserve0              // token0 balance
uint256 public reserve1              // token1 balance
uint16 public immutable feeBps       // Fee in basis points (30 = 0.3%)
```

**Core Functions:**

1. **addLiquidity(uint256 amount0, uint256 amount1)**
   - Adds tokens to pool
   - Increases reserves
   - No LP tokens (simplified design)

2. **quoteOut(address tokenIn, uint256 amountIn) → uint256 amountOut**
   - Pure view function (no state changes)
   - Calculates expected output
   - Applies fee to input amount
   - Uses constant product formula

3. **swapExactIn(address tokenIn, uint256 amountIn, uint256 minAmountOut, address recipient) → uint256 amountOut**
   - Executes actual swap
   - Slippage protection via minAmountOut
   - Updates reserves atomically
   - Emits Swap event

**Slippage Calculation:**
```
Example: Swap 1000 USDC → MON
Initial: 250,000 USDC / 250,000 MON (price = 1:1)

Step 1: Apply fee
  amountInAfterFee = 1000 * (10000 - 30) / 10000 = 997 USDC

Step 2: Calculate output
  amountOut = (997 * 250,000) / (250,000 + 997)
           = 249,250,000 / 250,997
           = 993.03 MON

Step 3: Measure slippage
  Expected (no slippage): 1000 MON
  Actual output: 993.03 MON
  Slippage: (1000 - 993.03) / 1000 = 0.697%
```

---

#### VWAPEngine.sol
**Purpose:** Core VWAP order management and execution  
**Location:** `Hardhat/contracts/VWAPEngine.sol`

**Order Lifecycle:**
```
CREATE → ACTIVE → EXECUTING → COMPLETED/CANCELLED
   │        │          │              │
   │        │          ├─ Slice 1     │
   │        │          ├─ Slice 2     └─ All slices done
   │        │          ├─ Slice 3        or user cancelled
   │        │          └─ Slice N
   │        │
   └─ Tokens locked in contract
```

**Order Structure:**
```solidity
struct Order {
    address owner;              // Order creator
    address recipient;          // Token recipient (can differ from owner)
    address tokenIn;            // Token being sold
    address tokenOut;           // Token being bought
    uint256 totalAmountIn;      // Original total amount
    uint256 remainingAmountIn;  // Unexecuted amount (decreases)
    uint8 numSlices;            // Total slices (1-20)
    uint8 executedSlices;       // Completed slices (increases)
    uint16 maxSlippageBps;      // Max allowed slippage (1-5000 bps)
    uint16 maxImpactBps;        // Max allowed market impact (0-5000 bps)
    uint64 intervalSec;         // Time between slices
    uint64 nextExecutionTime;   // Unix timestamp for next slice
    uint64 deadline;            // Order expiry
    bool active;                // Is order still active?
}
```

**State Management:**
```solidity
uint256 public nextOrderId = 1              // Monotonic order ID counter
mapping(uint256 => Order) public orders     // orderId → Order data
```

**Critical Functions:**

1. **createOrder(...) → uint256 orderId**
   ```
   Flow:
   1. Validate inputs (slices, amounts, deadlines)
   2. Verify token pair exists in AMM
   3. Generate unique orderId
   4. Lock tokens via safeTransferFrom
   5. Store Order struct
   6. Emit OrderCreated event
   7. Return orderId
   ```

2. **executeSlice(uint256 orderId, uint256 keeperMinOut) → uint256 amountOut**
   ```
   Flow:
   1. Load order from storage
   2. Validation:
      - Order exists and active
      - block.timestamp >= nextExecutionTime
      - block.timestamp <= deadline
      - remainingAmountIn > 0
   3. Calculate slice amount:
      - amountIn = remainingAmountIn / (numSlices - executedSlices)
   4. Risk Check #1 - Market Impact:
      - Get marginal price (quote for 1 token)
      - Calculate linear output (marginal_price * amountIn)
      - Get actual output from AMM
      - impact = (linear - actual) / linear
      - Revert if impact > maxImpactBps
   5. Risk Check #2 - Slippage:
      - minOut = max(userMinOut, keeperMinOut)
      - Will revert in AMM if actualOut < minOut
   6. Execute swap:
      - Approve AMM
      - Call swapExactIn
      - Send output to recipient
   7. Update state:
      - remainingAmountIn -= amountIn
      - executedSlices++
      - nextExecutionTime += intervalSec
   8. Check completion:
      - If all slices done or no remaining: set active = false
   9. Emit SliceExecuted/OrderCompleted
   ```

3. **cancelOrder(uint256 orderId)**
   ```
   Flow:
   1. Validate caller is owner
   2. Validate order is active
   3. Calculate refund = remainingAmountIn
   4. Set active = false, remainingAmountIn = 0
   5. Transfer refund to owner
   6. Emit OrderCancelled
   ```

**Risk Management System:**

**Slippage Protection (Dual Layer):**
```typescript
// User-defined maximum
userMinOut = quotedOut * (10000 - maxSlippageBps) / 10000

// Keeper can be more conservative
keeperMinOut = quotedOut * (10000 - effectiveSlippageBps) / 10000

// Use stricter protection
actualMinOut = max(userMinOut, keeperMinOut)
```

**Market Impact Check:**
```solidity
// Get marginal price
uint256 tinyIn = 10 ** decimals;  // 1 token
uint256 tinyQuote = amm.quoteOut(tokenIn, tinyIn);

// Calculate expected output if price was constant
uint256 linearOut = (tinyQuote * amountIn) / tinyIn;

// Get actual output accounting for slippage
uint256 actualOut = amm.quoteOut(tokenIn, amountIn);

// Calculate impact
uint256 impact = ((linearOut - actualOut) * 10000) / linearOut;

// Enforce limit
require(impact <= maxImpactBps, "ImpactTooHigh");
```

---

### 2. Bot Infrastructure

#### Keeper Bot
**Purpose:** Automated slice execution  
**Location:** `Hardhat/scripts/keeper.ts`

**Architecture:**
```typescript
┌─────────────────────────────────────────────┐
│           Keeper Bot Main Loop              │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│      Event Scanner (every 7 seconds)        │
│  - Query new blocks for events             │
│  - OrderCreated → add to activeOrderIds    │
│  - OrderCancelled → remove from set        │
│  - OrderCompleted → remove from set        │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│     Order Eligibility Check (for each)      │
│  - order.active === true                    │
│  - block.timestamp >= nextExecutionTime     │
│  - remainingAmountIn > 0                    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼ (if eligible)
┌─────────────────────────────────────────────┐
│        Quote & Calculate minOut             │
│  - Get AMM quote for slice amount          │
│  - Add extra buffer (20 bps default)       │
│  - Calculate effective minOut              │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│       Execute Transaction                   │
│  - Call executeSlice(orderId, minOut)      │
│  - Wait for confirmation                    │
│  - Log tx hash and status                  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         Error Handling                      │
│  - Log error message                        │
│  - Continue to next order                   │
│  - Retry on next loop iteration            │
└─────────────────────────────────────────────┘
```

**State Management:**
```typescript
const activeOrderIds = new Set<string>();  // In-memory order tracking
let lastScannedBlock = startBlock;         // Checkpoint for events
```

**Event Processing:**
```typescript
// Scan blocks for events
const fromBlock = lastScannedBlock + 1;
const toBlock = await provider.getBlockNumber();

// Update active orders set
for (const event of createdEvents) {
  activeOrderIds.add(event.args.orderId.toString());
}

for (const event of cancelledEvents) {
  activeOrderIds.delete(event.args.orderId.toString());
}

for (const event of completedEvents) {
  activeOrderIds.delete(event.args.orderId.toString());
}
```

**Execution Logic:**
```typescript
// Check timing
const now = Math.floor(Date.now() / 1000);
if (order.nextExecutionTime > now) continue;

// Calculate minOut with buffer
const quotedOut = await amm.quoteOut(order.tokenIn, amountIn);
const effectiveSlippageBps = Math.min(
  Number(order.maxSlippageBps) + minOutExtraBps,
  9_000  // Cap at 90% max slippage
);
const minOut = (quotedOut * BigInt(10_000 - effectiveSlippageBps)) / BigInt(10_000);

// Execute with fixed gas limit
const tx = await engine.executeSlice(orderId, minOut, { gasLimit });
await tx.wait(1);
```

**Configuration:**
```typescript
KEEPER_RPC_URL              // Monad testnet RPC endpoint
KEEPER_PRIVATE_KEY          // Keeper wallet private key
VWAP_ENGINE_ADDRESS         // VWAPEngine contract address
SIMPLE_AMM_ADDRESS          // SimpleAMM contract address
KEEPER_POLL_INTERVAL_MS     // Default: 7000 (7 seconds)
KEEPER_TX_GAS_LIMIT         // Default: 700000
MIN_OUT_EXTRA_BPS           // Default: 20 (0.2% extra buffer)
```

---

#### Flow Bot
**Purpose:** Market activity simulation  
**Location:** `Hardhat/scripts/flow-bot.ts`

**Trading Strategy:**
```typescript
┌─────────────────────────────────────────────┐
│      Flow Bot Loop (every 15 seconds)       │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│       Generate Random Trade Parameters      │
│  - Direction: 50/50 buy/sell MON           │
│  - Size: 5-75 USDC notional               │
│  - Convert to token amounts                │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│        Check Balance & Mint if Needed       │
│  - Get wallet balance of tokenIn           │
│  - If balance < amountIn:                  │
│    * Mint 20x needed amount via faucet     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│          Get Quote & Calculate minOut       │
│  - Query AMM for expected output           │
│  - Set minOut = 96% of quoted (4% slippage)│
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│            Execute Swap                     │
│  - Call AMM.swapExactIn                    │
│  - Wait for confirmation                    │
│  - Log trade details                       │
└─────────────────────────────────────────────┘
```

**Trade Size Distribution:**
```typescript
// Random USDC notional between 5-75
const notionalUsdc = randomBetween(5, 75);

if (buyMon) {
  // Buying MON with USDC
  tokenIn = USDC;
  amountIn = parseUnits(notionalUsdc, 6);  // 6 decimals
} else {
  // Selling MON for USDC
  tokenIn = MON;
  // Assume ~1500 USDC/MON price ratio
  const monAmount = Math.max(0.001, notionalUsdc / 1500);
  amountIn = parseEther(monAmount);  // 18 decimals
}
```

**Market Impact Example:**
```
Initial Pool: 250,000 USDC / 250,000 MON
Price: 1 USDC = 1 MON

Flow Bot Trade 1: Buy 50 USDC worth of MON
  → Pool: 250,050 USDC / 249,950.1 MON
  → New Price: 1.00040 USDC/MON (+0.04%)

Flow Bot Trade 2: Sell 20 USDC worth of MON
  → Pool: 250,030 USDC / 249,970.1 MON
  → New Price: 1.00024 USDC/MON (+0.024%)

Result: Price oscillates realistically around 1:1
```

**Configuration:**
```typescript
FLOW_BOT_RPC_URL        // Monad testnet RPC endpoint
FLOW_BOT_PRIVATE_KEY    // Flow bot wallet private key
SIMPLE_AMM_ADDRESS      // SimpleAMM contract address
MOCK_USDC_ADDRESS       // MockUSDC contract address
MOCK_MON_ADDRESS        // MockMON contract address
FLOW_INTERVAL_MS        // Default: 15000 (15 seconds)
FLOW_MIN_SIZE_USDC      // Default: 5
FLOW_MAX_SIZE_USDC      // Default: 75
```

---

### 3. Frontend Architecture

**Technology Stack:**
- Framework: Next.js (React)
- Wallet Integration: wagmi + viem
- State Management: React hooks + context
- Styling: Tailwind CSS
- Web3 Provider: MetaMask

**Component Hierarchy:**
```
app/
├── layout.tsx (RootLayout)
│   └── Providers (wagmi config)
│       └── Navbar
│           └── WalletConnect
└── page.tsx (Home)
    ├── OrderCreationForm
    │   ├── TokenInput (amount, slices, interval)
    │   ├── RiskControls (slippage, impact, deadline)
    │   └── CreateOrderButton
    ├── OrderList
    │   └── OrderCard[]
    │       ├── OrderDetails (status, progress)
    │       ├── SliceTimeline
    │       └── CancelOrderButton
    └── BalancePanel
        ├── TokenBalance (USDC)
        └── TokenBalance (MON)
```

**Key Frontend Hooks:**
```typescript
// Contract interaction hooks
const { writeContract } = useWriteContract();
const { data: orderData } = useReadContract({
  address: VWAP_ENGINE_ADDRESS,
  abi: VWAPEngineABI,
  functionName: 'getOrder',
  args: [orderId]
});

// Event listening
const { data: events } = useWatchContractEvent({
  address: VWAP_ENGINE_ADDRESS,
  abi: VWAPEngineABI,
  eventName: 'OrderCreated'
});

// Transaction status
const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
  hash: txHash
});
```

---

## Data Flow

### Order Creation Flow
```
┌─────────────┐
│    User     │
│   (Wallet)  │
└──────┬──────┘
       │ 1. Fill form (amount, slices, risk params)
       │
       ▼
┌─────────────────────┐
│  Frontend (Next.js) │
│  OrderCreationForm  │
└──────┬──────────────┘
       │ 2. Validate inputs
       │ 3. Request wallet signature
       │
       ▼
┌─────────────────────┐
│    MetaMask         │
│  Transaction Sign   │
└──────┬──────────────┘
       │ 4. User approves
       │
       ▼
┌─────────────────────┐
│  Monad Blockchain   │
│  VWAPEngine.sol     │
└──────┬──────────────┘
       │ 5. createOrder() executes
       │    - Validate parameters
       │    - Lock tokens via transferFrom
       │    - Store order in mapping
       │    - Emit OrderCreated event
       │
       ▼
┌─────────────────────┐
│   Event Emitted     │
│   OrderCreated      │
└──────┬──────────────┘
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌─────────────────┐   ┌─────────────────┐
│  Keeper Bot     │   │  Frontend       │
│  Event Scanner  │   │  Event Listener │
└─────────────────┘   └─────────────────┘
       │                      │
       │ 6. Add to            │ 6. Update UI
       │    activeOrderIds    │    Show new order
       │                      │
       ▼                      ▼
┌─────────────────┐   ┌─────────────────┐
│  Wait for       │   │  Display order  │
│  nextExecTime   │   │  details        │
└─────────────────┘   └─────────────────┘
```

### Slice Execution Flow
```
┌─────────────────────┐
│    Keeper Bot       │
│  (Polling Loop)     │
└──────┬──────────────┘
       │ Every 7 seconds
       │
       ▼
┌─────────────────────┐
│  Check all active   │
│  orders for timing  │
└──────┬──────────────┘
       │ block.timestamp >= nextExecutionTime?
       │
       ▼ YES
┌─────────────────────┐
│  Query AMM quote    │
│  Calculate minOut   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Execute Slice TX   │
│  executeSlice()     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  VWAPEngine         │
│  Risk Checks        │
└──────┬──────────────┘
       │
       ├─ Impact Check ──────┐
       │                     ▼
       │                ┌─────────────┐
       │                │ Get marginal│
       │                │ price       │
       │                │ Calculate   │
       │                │ impact %    │
       │                └──────┬──────┘
       │                       │
       │                       ▼
       │                  Impact OK?
       │                       │
       │                       ▼ YES
       │
       ├─ Slippage Check ────┐
       │                     ▼
       │                ┌─────────────┐
       │                │ Compare     │
       │                │ minOut vs   │
       │                │ actualOut   │
       │                └──────┬──────┘
       │                       │
       │                       ▼
       │                  Slippage OK?
       │                       │
       │                       ▼ YES
       │
       └───────────────────────┤
                               │
                               ▼
┌─────────────────────────────────────┐
│  Execute Swap via SimpleAMM         │
│  1. Approve tokens                  │
│  2. swapExactIn()                   │
│  3. Send output to recipient        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Update Order State                 │
│  - remainingAmountIn -= amountIn    │
│  - executedSlices++                 │
│  - nextExecutionTime += interval    │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Emit SliceExecuted Event           │
│  args: orderId, sliceNum, amounts   │
└──────┬──────────────────────────────┘
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌─────────────────┐   ┌─────────────────┐
│  Keeper Bot     │   │  Frontend       │
│  Log execution  │   │  Update progress│
└─────────────────┘   └─────────────────┘
```

### Market Movement Flow (Flow Bot)
```
┌─────────────────────┐
│    Flow Bot         │
│  (Loop every 15s)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Generate Random    │
│  Trade Parameters   │
│  - Direction (50/50)│
│  - Size (5-75 USDC) │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Check Balance      │
│  Mint if needed     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Execute Swap       │
│  via SimpleAMM      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Update Pool        │
│  Reserves           │
│  → Price changes    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Next VWAP slice    │
│  sees new price     │
│  → Different quote  │
└─────────────────────┘
```

---

## Sequence Diagrams

### Complete Order Lifecycle

```
User    Frontend    MetaMask    VWAPEngine    Keeper    FlowBot    SimpleAMM
 │         │           │            │           │          │          │
 │──1──>  │           │            │           │          │          │
 │  Create order form │            │           │          │          │
 │         │           │            │           │          │          │
 │         │──2──>     │            │           │          │          │
 │         │   Prompt sign          │           │          │          │
 │         │           │            │           │          │          │
 │         │<──3───    │            │           │          │          │
 │<──────4─│           │            │           │          │          │
 │  Confirm          │              │           │          │          │
 │         │           │            │           │          │          │
 │         │──5───────────────────> │           │          │          │
 │         │   createOrder()        │           │          │          │
 │         │                        │           │          │          │
 │         │                     [Validate]     │          │          │
 │         │                     [Lock tokens]  │          │          │
 │         │                     [Store order]  │          │          │
 │         │                        │           │          │          │
 │         │<──6────────────────────│           │          │          │
 │         │   OrderCreated event   │           │          │          │
 │         │                        │           │          │          │
 │         │                        │───7──────>│          │          │
 │         │                        │  Event    │          │          │
 │         │                        │  detected │          │          │
 │         │                        │           │          │          │
 │         │                        │           │          │<───8──   │
 │         │                        │           │          │ Random   │
 │         │                        │           │          │ swap     │
 │         │                        │           │          │          │
 │         │                        │           │          │──9───────>│
 │         │                        │           │          │  Swap    │
 │         │                        │           │          │          │
 │         │                        │           │          │<───10────│
 │         │                        │           │          │  Reserves│
 │         │                        │           │          │  updated │
 │         │                        │           │          │          │
 │         │                        │<─11───────│          │          │
 │         │                        │  Check timing        │          │
 │         │                        │           │          │          │
 │         │                        │───12─────>│          │          │
 │         │                        │  getOrder()          │          │
 │         │                        │           │          │          │
 │         │                        │<───13────│           │          │
 │         │                        │  Order data          │          │
 │         │                        │           │          │          │
 │         │                        │           │          │          │
 │         │                        │<─14──────────────────────────>  │
 │         │                        │  quoteOut() for slice          │
 │         │                        │           │          │          │
 │         │                        │<──15──────│          │          │
 │         │                        │  executeSlice()      │          │
 │         │                        │           │          │          │
 │         │                      [Risk checks] │          │          │
 │         │                        │           │          │          │
 │         │                        │───16─────────────────────────> │
 │         │                        │  swapExactIn()                │
 │         │                        │           │          │          │
 │         │                        │<───17────────────────────────  │
 │         │                        │  amountOut                     │
 │         │                        │           │          │          │
 │         │                      [Update state]│          │          │
 │         │                        │           │          │          │
 │         │<──18───────────────────│           │          │          │
 │         │   SliceExecuted event  │           │          │          │
 │<──19──  │                        │           │          │          │
 │  UI update                       │           │          │          │
 │         │                        │           │          │          │
 │         │                        │           │          │          │
 │         │              [Repeat 11-19 for each slice]    │          │
 │         │                        │           │          │          │
 │         │<──20───────────────────│           │          │          │
 │<──21──  │   OrderCompleted       │           │          │          │
 │  Final UI update                 │           │          │          │
```

---

## State Management

### On-Chain State (VWAPEngine)

**Storage Layout:**
```solidity
// Global state
uint256 public nextOrderId;              // Slot 0: Monotonic counter

// Order storage
mapping(uint256 => Order) public orders; // Slots 1+: orderId → Order struct

// Order struct layout (packed into multiple slots for gas optimization)
struct Order {
    // Slot 0: addresses (20 + 20 bytes = 40 bytes)
    address owner;          // bytes 0-19
    address recipient;      // bytes 20-39
    
    // Slot 1: addresses (20 + 20 bytes)
    address tokenIn;        // bytes 0-19
    address tokenOut;       // bytes 20-39
    
    // Slot 2: uint256
    uint256 totalAmountIn;
    
    // Slot 3: uint256
    uint256 remainingAmountIn;
    
    // Slot 4: packed small values
    uint8 numSlices;        // byte 0
    uint8 executedSlices;   // byte 1
    uint16 maxSlippageBps;  // bytes 2-3
    uint16 maxImpactBps;    // bytes 4-5
    uint64 intervalSec;     // bytes 6-13
    uint64 nextExecutionTime; // bytes 14-21
    uint64 deadline;        // bytes 22-29
    bool active;            // byte 30
}
```

### Off-Chain State (Keeper Bot)

**In-Memory State:**
```typescript
// Active order tracking
const activeOrderIds = new Set<string>(); // O(1) lookup for eligibility

// Block scanning checkpoint
let lastScannedBlock: number;             // Avoid re-scanning old events

// RPC connection
const provider: JsonRpcProvider;          // Persistent connection
const wallet: Wallet;                     // Signer for transactions
```

**State Synchronization:**
```typescript
// On startup: scan historical events
const fromBlock = await provider.getBlockNumber() - 1000; // Last ~1000 blocks
const events = await engine.queryFilter(
  engine.filters.OrderCreated(),
  fromBlock,
  'latest'
);

// Populate initial state
for (const event of events) {
  activeOrderIds.add(event.args.orderId.toString());
}

// Continuous sync
setInterval(async () => {
  const toBlock = await provider.getBlockNumber();
  // Scan new blocks only
  const newEvents = await engine.queryFilter(
    engine.filters.OrderCreated(),
    lastScannedBlock + 1,
    toBlock
  );
  // Update state
  lastScannedBlock = toBlock;
}, POLL_INTERVAL);
```

### Frontend State

**React State Management:**
```typescript
// Component-level state
const [orders, setOrders] = useState<Order[]>([]);
const [selectedOrderId, setSelectedOrderId] = useState<bigint | null>(null);
const [isCreating, setIsCreating] = useState(false);

// Wagmi hooks (auto-synced with blockchain)
const { data: orderData } = useReadContract({
  address: VWAP_ENGINE_ADDRESS,
  abi: VWAPEngineABI,
  functionName: 'getOrder',
  args: [orderId],
  watch: true  // Poll for updates
});

// Event-driven updates
useWatchContractEvent({
  address: VWAP_ENGINE_ADDRESS,
  abi: VWAPEngineABI,
  eventName: 'SliceExecuted',
  onLogs: (logs) => {
    // Update UI immediately when slice executes
    logs.forEach(log => {
      updateOrderProgress(log.args.orderId, log.args.sliceIndex);
    });
  }
});
```

---

## Security Model

### Access Control

**VWAPEngine Permissions:**
```solidity
// Order creation: Anyone can create
function createOrder(...) external {
  // No access control - permissionless
}

// Slice execution: Anyone can execute (keeper/user)
function executeSlice(uint256 orderId, ...) external {
  // No msg.sender check - trustless execution
  // Risk checks protect user's interests
}

// Order cancellation: Owner only
function cancelOrder(uint256 orderId) external {
  require(msg.sender == orders[orderId].owner, "Unauthorized");
  // Only creator can cancel
}
```

**SimpleAMM Permissions:**
```solidity
// Liquidity addition: Anyone
function addLiquidity(...) external {
  // Permissionless
}

// Liquidity removal: Owner only
function removeLiquidity(...) external onlyOwner {
  // Only deployer can remove
}

// Swaps: Anyone
function swapExactIn(...) external {
  // Permissionless
}
```

### Token Security

**Escrow Pattern:**
```solidity
// On order creation
IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), totalAmountIn);
// Tokens locked in contract

// On slice execution
amm.swapExactIn(tokenIn, amountIn, minOut, recipient);
// Output sent directly to recipient (not back to contract)

// On cancellation
IERC20(tokenIn).safeTransfer(owner, remainingAmountIn);
// Refund remaining balance
```

**Approval Management:**
```solidity
// Reset approval before setting new
tokenIn.safeApprove(address(amm), 0);
tokenIn.safeApprove(address(amm), amountIn);
// Prevents front-running and approval exploits
```

### Reentrancy Protection

**All state-changing functions:**
```solidity
contract VWAPEngine is ReentrancyGuard {
  function createOrder(...) external nonReentrant { ... }
  function executeSlice(...) external nonReentrant { ... }
  function cancelOrder(...) external nonReentrant { ... }
}

contract SimpleAMM is ReentrancyGuard {
  function swapExactIn(...) external nonReentrant { ... }
  function addLiquidity(...) external nonReentrant { ... }
  function removeLiquidity(...) external nonReentrant { ... }
}
```

### Risk Controls

**User-Defined Limits:**
```solidity
// Slippage tolerance
uint16 maxSlippageBps;  // 1-5000 (0.01% - 50%)

// Market impact tolerance
uint16 maxImpactBps;    // 0-5000 (0% - 50%)

// Time limits
uint64 deadline;        // Order expiry timestamp

// Execution pacing
uint64 intervalSec;     // Minimum time between slices
```

**Automated Enforcement:**
```solidity
// Check 1: Timing
require(block.timestamp >= order.nextExecutionTime, "TooEarly");
require(block.timestamp <= order.deadline, "OrderExpired");

// Check 2: Market impact
uint256 impact = calculateImpact(amountIn);
require(impact <= order.maxImpactBps, "ImpactTooHigh");

// Check 3: Slippage (enforced in AMM)
require(actualOut >= minOut, "InsufficientOutput");
```

---

## Performance Characteristics

### Gas Costs

**Order Creation:**
```
Gas breakdown:
- Storage writes (Order struct): ~150,000 gas
- Token transfer (SLOAD + external call): ~50,000 gas
- Event emission: ~10,000 gas
Total: ~210,000 gas

On Monad testnet: Effectively free (faucet MON)
```

**Slice Execution:**
```
Gas breakdown:
- Storage reads (Order): ~5,000 gas
- Storage writes (update state): ~15,000 gas
- Token approval: ~45,000 gas
- AMM swap: ~100,000 gas
- Event emission: ~10,000 gas
Total: ~175,000 gas per slice
```

**Cancel Order:**
```
Gas breakdown:
- Storage reads: ~5,000 gas
- Storage writes (deactivate): ~5,000 gas
- Token refund: ~50,000 gas
- Event emission: ~10,000 gas
Total: ~70,000 gas
```

### Monad Parallel Execution

**Sequential (Traditional EVM):**
```
Order 1, Slice 1: Block N
Order 1, Slice 2: Block N+1
Order 2, Slice 1: Block N+2
Order 2, Slice 2: Block N+3
...
Throughput: 1 slice per block
```

**Parallel (Monad EVM):**
```
Order 1, Slice 1 ∥ Order 2, Slice 1 ∥ Order 3, Slice 1: Block N
Order 1, Slice 2 ∥ Order 2, Slice 2 ∥ Order 3, Slice 2: Block N+1
...
Throughput: N slices per block (N = number of independent orders)
```

**Why Parallelization Works:**
```
Order 1 storage: mapping[1] => {...}
Order 2 storage: mapping[2] => {...}
Order 3 storage: mapping[3] => {...}

→ No storage conflicts
→ Can execute simultaneously
→ Linear throughput scaling
```

---

## System Constraints

### Hard Limits

```solidity
// VWAPEngine constraints
uint8 numSlices;              // Max: 20 slices per order
uint16 maxSlippageBps;        // Range: 1-5000 (0.01% - 50%)
uint16 maxImpactBps;          // Range: 0-5000 (0% - 50%)
uint64 deadline;              // Max: ~584 years from now
uint256 totalAmountIn;        // Max: 2^256 - 1 (effectively unlimited)

// SimpleAMM constraints
uint16 feeBps;                // Range: 0-9999 (0% - 99.99%)
uint256 reserves;             // Max: 2^256 - 1 per token
```

### Soft Limits (Recommended)

```typescript
// Keeper bot
KEEPER_POLL_INTERVAL_MS: 7000    // Balance between responsiveness and RPC cost
KEEPER_TX_GAS_LIMIT: 700000      // Safe upper bound for slice execution
MIN_OUT_EXTRA_BPS: 20            // Extra slippage buffer

// Flow bot
FLOW_INTERVAL_MS: 15000          // Creates realistic but not excessive activity
FLOW_MIN_SIZE_USDC: 5            // Minimum meaningful trade size
FLOW_MAX_SIZE_USDC: 75           // Avoid excessive impact on small pools

// Frontend
Order refresh interval: 5s       // Poll for order updates
Event polling: Real-time         // Use WebSocket for immediate updates
```

---

## Monitoring & Observability

### Key Metrics

**Keeper Bot:**
```typescript
- Orders tracked: activeOrderIds.size
- Slices executed per minute: executionRate
- Success rate: successfulExecutions / totalAttempts
- Average gas used: sum(gasUsed) / executionCount
- Errors per hour: errorCount
```

**Flow Bot:**
```typescript
- Trades per minute: tradeRate
- Average trade size (USDC): sum(tradeSize) / tradeCount
- Buy/sell ratio: buyCount / sellCount
- Price drift: currentPrice / initialPrice - 1
```

**On-Chain:**
```solidity
- Total orders created: nextOrderId - 1
- Active orders: count where order.active == true
- Total volume traded: sum of all totalAmountIn
- Average slices per order: sum(numSlices) / orderCount
- Average execution time: sum(completionTime - creationTime) / orderCount
```

### Logging

**Keeper Bot Logs:**
```typescript
console.log(`Keeper started for ${vwapEngineAddress}`);
console.log(`Keeper wallet: ${wallet.address}`);
console.log(`Polling every ${pollIntervalMs}ms`);

// Per execution
console.log(
  `[keeper] execute order=${orderId} slice=${sliceNum}/${numSlices} ` +
  `amountIn=${formatUnits(amountIn, decimals)} ${symbol}`
);
console.log(`[keeper] tx=${tx.hash} status=${receipt.status}`);

// Errors
console.error(`[keeper] loop error: ${error.message}`);
```

**Flow Bot Logs:**
```typescript
console.log(`Flow bot started with wallet ${wallet.address}`);
console.log(`Interval ${flowIntervalMs}ms`);

// Per trade
console.log(
  `[flow] swap ${formatUnits(amountIn, decimals)} ${symbol} tx=${tx.hash}`
);

// Errors
console.error(`[flow] loop error: ${error.message}`);
```

This architecture document provides a complete technical overview of how all system components interact, their responsibilities, and the data flows between them.
