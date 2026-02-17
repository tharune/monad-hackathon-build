# Core Concepts

## Table of Contents
- [Volume-Weighted Average Price (VWAP)](#volume-weighted-average-price-vwap)
- [Order Slicing](#order-slicing)
- [Execution Mechanics](#execution-mechanics)
- [Parallel Execution Model](#parallel-execution-model)
- [Market Impact & Slippage](#market-impact--slippage)

---

## Volume-Weighted Average Price (VWAP)

### Definition

VWAP is the average price a security has traded at throughout the day, weighted by volume. It provides a benchmark for execution quality and is used by institutional traders to minimize market impact.

**Formula:**
```
VWAP = Σ(Price × Volume) / Σ(Volume)
```

### Why VWAP Matters for Large Orders

When executing a large order on a DEX with a constant-product AMM (x × y = k):

**Without VWAP:**
- Single large trade causes significant price impact
- Slippage increases non-linearly with order size
- Market may not recover quickly, locking in poor execution

**With VWAP:**
- Order split into smaller slices executed over time
- Each slice has lower individual impact
- Market can partially recover between executions
- Average execution price closer to market VWAP

### VWAP vs. Other Strategies

| Strategy | Execution Pattern | Use Case | Monad Advantage |
|----------|------------------|----------|-----------------|
| **Market Order** | Immediate, single execution | Small orders, urgent | Low latency |
| **VWAP** | Time-distributed, volume-weighted | Large orders, minimize impact | Parallel slices |
| **TWAP** | Time-distributed, equal slices | Predictable execution | Parallel slices |
| **Iceberg** | Partial reveal, sequential | Hidden liquidity | Future feature |

---

## Order Slicing

### Slice Size Determination

The protocol implements a **variable slice sizing algorithm** that simulates realistic volume distribution patterns:

**Pattern: 150% / 100% / 50% (Repeating)**

```
Slice 0: 150% of base size
Slice 1: 100% of base size
Slice 2: 50% of base size
Slice 3: 150% of base size
...
```

**Rationale:**
- Mimics natural volume patterns (high/medium/low)
- Prevents predictable execution (MEV protection)
- Adapts to market microstructure

**Example: 10,000 USDC order, 6 slices**

```
Base size = 10,000 / 6 = 1,666.67 USDC

Slice 0: 1,666.67 × 1.50 = 2,500 USDC
Slice 1: 1,666.67 × 1.00 = 1,667 USDC
Slice 2: 1,666.67 × 0.50 = 833 USDC
Slice 3: 1,666.67 × 1.50 = 2,500 USDC
Slice 4: 1,666.67 × 1.00 = 1,667 USDC
Slice 5: 833 USDC (adjusted for rounding)

Total: 10,000 USDC
```

### Smart Contract Implementation

```solidity
uint256 baseSlice = totalAmount / numSlices;
for (uint8 i = 0; i < numSlices; i++) {
    uint256 variation = (i % 3 == 0)
        ? (baseSlice * 150) / 100  // High volume
        : (i % 3 == 1)
            ? baseSlice             // Medium volume
            : (baseSlice * 50) / 100; // Low volume
    
    sliceSizes[sliceId] = variation;
}
```

The last slice is automatically adjusted to ensure the sum equals `totalAmount` exactly:

```solidity
if (sum != totalAmount) {
    // Adjust last slice to account for rounding
    sliceSizes[lastSliceId] += (totalAmount - sum);
}
```

---

## Execution Mechanics

### Order Lifecycle

```
┌─────────────┐
│   Created   │  User creates order with N slices
└──────┬──────┘
       │
       v
┌─────────────┐
│   Active    │  Slices eligible for execution
└──────┬──────┘
       │
       │  executeSlice() called N times
       │  (potentially in parallel)
       v
┌─────────────┐
│  Completed  │  All slices executed, order inactive
└─────────────┘
```

### Slice Execution Flow

**Step 1: Order Creation**
```solidity
function createOrder(uint256 totalAmount, uint8 numSlices) 
    external returns (bytes32 orderId)
```

**What happens:**
1. Generate unique `orderId` from hash of creator, timestamp, and parameters
2. Store order details in `orders` mapping
3. Precompute all slice sizes using VWAP weighting
4. Emit `OrderCreated` event for keepers to monitor

**Step 2: Slice Execution**
```solidity
function executeSlice(bytes32 orderId, uint8 sliceIndex) external
```

**What happens:**
1. Verify order is active
2. Check slice index is valid
3. **Bitmask check**: Verify slice hasn't been executed
4. Update bitmask to mark slice as executed
5. Emit `SliceExecuted` event
6. If all slices complete, emit `OrderCompleted` and deactivate order

**Step 3: Bitmask Verification (Key Innovation)**

```solidity
// Check if slice already executed (O(1) operation)
uint256 bit = (1 << sliceIndex);
if ((executedMask[orderId] & bit) != 0) revert SliceAlreadyExecuted();

// Mark slice as executed
executedMask[orderId] |= bit;
```

**Why Bitmask?**
- **O(1) lookup**: Instant verification, no loops
- **Gas efficient**: Single storage slot for up to 256 slices (we use 20 max)
- **Parallel-safe**: Multiple keepers can't double-execute due to atomic state update
- **Simple**: No complex data structures needed

---

## Parallel Execution Model

### Permissionless Keeper Design

**Key Insight**: Any address can execute any slice. This enables:

1. **Decentralization**: No single point of failure
2. **Parallelism**: Multiple keepers operate simultaneously
3. **Resilience**: If one keeper fails, others continue
4. **Scalability**: Add more keepers = higher throughput

### Execution Ordering

**Critical Property**: Slices can execute in **ANY order**.

```
Order with 5 slices: [0, 1, 2, 3, 4]

Valid execution sequences:
- Sequential:  0 → 1 → 2 → 3 → 4
- Reverse:     4 → 3 → 2 → 1 → 0
- Random:      2 → 0 → 4 → 1 → 3
- Parallel:    {0,1,2} → {3,4}
```

**Why this matters for Monad:**
- Keepers don't need to coordinate
- Multiple slices can be in the same block
- Maximum utilization of Monad's 10,000 TPS

### Parallel Execution Example

**Scenario**: 10 slices, 3 keepers

**Traditional (Sequential) Execution:**
```
Block 1: Slice 0 (Keeper A)
Block 2: Slice 1 (Keeper A)
Block 3: Slice 2 (Keeper A)
...
Block 10: Slice 9 (Keeper A)

Total time: 10 blocks = ~120 seconds
```

**Monad (Parallel) Execution:**
```
Block 1: 
  - Slice 0 (Keeper A)
  - Slice 1 (Keeper B)  
  - Slice 2 (Keeper C)

Block 2:
  - Slice 3 (Keeper A)
  - Slice 4 (Keeper B)
  - Slice 5 (Keeper C)

Block 3:
  - Slice 6 (Keeper A)
  - Slice 7 (Keeper B)
  - Slice 8 (Keeper C)

Block 4:
  - Slice 9 (Keeper A)

Total time: 4 blocks = ~4 seconds
```

**Result**: 30x faster execution

### State Machine Guarantees

Despite permissionless parallel execution, the protocol maintains strict guarantees:

1. **Atomicity**: Each slice either fully executes or fully reverts
2. **Uniqueness**: Each slice executes exactly once (bitmask protection)
3. **Completeness**: Order only completes when all slices execute
4. **Integrity**: Order parameters cannot be modified post-creation

---

## Market Impact & Slippage

### Constant Product AMM Mechanics

DEXs using the constant product formula (x × y = k) exhibit non-linear price impact:

**For a swap of Δx input tokens:**
```
Δy = (y × Δx) / (x + Δx)

Price impact = Δy / y
```

**Example**: Pool with 100,000 USDC and 100 ETH

| Trade Size | Price Impact | Slippage |
|------------|--------------|----------|
| 1,000 USDC | 0.99% | ~1% |
| 5,000 USDC | 4.76% | ~5% |
| 10,000 USDC | 9.09% | ~9% |
| 50,000 USDC | 33.33% | ~33% |

**Key insight**: Price impact scales non-linearly. Splitting a 50,000 USDC trade into 10 slices doesn't reduce impact to 33.33% / 10 = 3.33%. Instead:

- 10 slices of 5,000 USDC each ≈ 4.76% impact per slice
- Assuming partial recovery between slices: effective impact ~3-4%
- **Result**: 8-10x slippage reduction

### VWAP Impact Reduction

**Without VWAP** (single 50,000 USDC trade):
```
Initial pool: 100,000 USDC / 100 ETH
Price: 1,000 USDC/ETH

After trade: 150,000 USDC / 66.67 ETH
Effective price: 749.93 USDC/ETH

Slippage: (1000 - 749.93) / 1000 = 25%
```

**With VWAP** (10 slices of 5,000 USDC):
```
Slice 0: 1,000 → 995 USDC/ETH (0.5% impact)
Slice 1: 995 → 990 USDC/ETH (0.5% impact)
...
Slice 9: 960 → 955 USDC/ETH (0.5% impact)

Average execution price: ~975 USDC/ETH
Effective slippage: 2.5%

Improvement: 25% → 2.5% = 10x reduction
```

### Market Recovery Between Slices

Critical to VWAP effectiveness is allowing the market to recover:

**Recovery mechanisms:**
1. **Other traders**: Arbitrageurs restore price equilibrium
2. **Liquidity provision**: LPs add liquidity seeing the price deviation
3. **Time decay**: Passive recovery as order book rebalances

**Protocol implementation:**
- Time intervals between slices (e.g., 15 seconds)
- Flow bot simulates organic market activity
- Keeper bot monitors market conditions before executing

### Risk Parameters

The production VWAPEngine (separate contract) implements two key protections:

**1. Maximum Slippage (basis points)**
```solidity
uint16 maxSlippageBps;  // e.g., 200 = 2%
```

Prevents execution if price deviates more than X% from expected:
```solidity
uint256 minOut = (quotedAmount * (10000 - maxSlippageBps)) / 10000;
require(actualOut >= minOut, "SLIPPAGE_EXCEEDED");
```

**2. Maximum Market Impact (basis points)**
```solidity
uint16 maxImpactBps;  // e.g., 50 = 0.5%
```

Prevents execution if slice size would impact pool more than X%:
```solidity
uint256 poolImpact = (sliceAmount * 10000) / poolReserve;
require(poolImpact <= maxImpactBps, "IMPACT_TOO_HIGH");
```

### Adaptive Execution

Future versions will implement adaptive slice sizing:

**Conditions monitored:**
- Current pool reserves
- Recent volume (last N blocks)
- Price volatility
- Gas prices

**Adjustments:**
- Increase slice size during high volume (more liquidity)
- Decrease slice size during low volume (reduce impact)
- Pause execution during extreme volatility
- Batch slices when gas is cheap

---

## Event-Driven Architecture

### Keeper Bot Logic

**Monitoring Phase:**
```typescript
1. Query blockchain for OrderCreated events
2. Add orderId to active order set
3. Poll each active order every 7 seconds
4. Check if order.nextExecutionTime <= now
```

**Execution Phase:**
```typescript
5. Estimate next slice size
6. Query AMM for expected output
7. Calculate minOut with slippage protection
8. Submit executeSlice() transaction
9. Wait for confirmation
10. Update internal state
```

**Cleanup Phase:**
```typescript
11. Listen for OrderCompleted events
12. Remove orderId from active set
13. Continue monitoring for new orders
```

### Event Schema

**OrderCreated**
```solidity
event OrderCreated(
    bytes32 indexed orderId,
    address indexed creator,
    uint256 amount,
    uint8 slices
);
```

**SliceExecuted**
```solidity
event SliceExecuted(
    bytes32 indexed orderId,
    uint8 sliceIndex,
    uint256 amount,
    address indexed executor
);
```

**OrderCompleted**
```solidity
event OrderCompleted(bytes32 indexed orderId);
```

---

## Gas Optimization Techniques

### 1. Storage Packing

**Order struct** optimized to fit in 5 storage slots (160 gas per slot):

```solidity
struct Order {
    address creator;      // Slot 0: 20 bytes
    uint256 totalAmount;  // Slot 1: 32 bytes
    uint8 numSlices;      // Slot 2: 1 byte
    uint8 executedSlices; // Slot 2: 1 byte (packed)
    uint256 startTime;    // Slot 3: 32 bytes
    bool active;          // Slot 4: 1 byte
}
```

**Alternative (naive) approach** would use 8 slots:
```solidity
struct OrderNaive {
    address creator;      // Slot 0
    uint256 totalAmount;  // Slot 1
    uint256 numSlices;    // Slot 2
    uint256 executedSlices; // Slot 3
    uint256 startTime;    // Slot 4
    bool active;          // Slot 5
    // Padding to word boundaries
}
```

**Savings**: 3 slots × 20,000 gas = **60,000 gas per order creation**

### 2. Bitmask vs. Array

**Bitmask approach** (current):
```solidity
mapping(bytes32 => uint256) executedMask;

// Check: O(1), ~2,100 gas
uint256 bit = (1 << sliceIndex);
bool executed = (executedMask[orderId] & bit) != 0;

// Update: O(1), ~5,000 gas (cold) / ~100 gas (warm)
executedMask[orderId] |= bit;
```

**Array approach** (alternative):
```solidity
mapping(bytes32 => bool[20]) executedArray;

// Check: O(1), ~2,100 gas
bool executed = executedArray[orderId][sliceIndex];

// Update: O(1), ~5,000 gas (cold) / ~100 gas (warm)
executedArray[orderId][sliceIndex] = true;
```

**Result**: Bitmask uses 1 storage slot vs. 20 slots for array.

**Savings**: 19 slots × 20,000 gas = **380,000 gas over order lifetime**

### 3. Precomputation

Slice sizes are computed during order creation (upfront cost) rather than during each execution:

**With precomputation**:
- Order creation: ~210,000 gas (compute all slices once)
- Each execution: ~175,000 gas (lookup only)

**Without precomputation**:
- Order creation: ~150,000 gas
- Each execution: ~190,000 gas (compute slice size on-demand)

**For 10 slices**: 
- With: 210k + (175k × 10) = 1,960,000 gas
- Without: 150k + (190k × 10) = 2,050,000 gas
- **Savings**: 90,000 gas (4.4%)

---

## Next Steps

- **For mathematical deep-dive**: See [Mathematical Model](./03-mathematical-model.md)
- **For implementation details**: See [Smart Contracts](./04-smart-contracts.md)
- **For keeper setup**: See [Keeper Architecture](./05-keeper-architecture.md)
