# Constructor Arguments Verification

## ✅ All Constructor Arguments Match Correctly

### Contract Constructor Signature
```solidity
constructor(
    address _usdc,           // 1
    address _feeWallet,       // 2
    address _escrowWallet,   // 3
    uint16 _feeBps,          // 4
    address operator,         // 5
    address _vault            // 6
)
```

### Environment Variables → Contract Parameters

| Env Var | Contract Param | Type | Value (from README) |
|---------|---------------|------|---------------------|
| `USDC` | `_usdc` | address | `0x94d07C7Aa3F8910ACeF21300098DA9171d06220C` |
| `FEE_RECIPIENT` | `_feeWallet` | address | `0x6B2DF84D386Fef301E8391FDA755032E3c887095` |
| `ESCROW_WALLET` | `_escrowWallet` | address | `0xD5913d9875903dA1Bd64aDf39Dbb790F301f4A33` |
| `FEE_BPS` | `_feeBps` | uint16 | `100` |
| `GELATO_OPERATOR` | `operator` | address | `0x2117f933e30AA3B0258b1A73C44A89F286fE9991` |
| *(from deployment)* | `_vault` | address | RaffleVault address |

### Deploy Script (00_deploy_your_contracts.ts:252-259)
```typescript
args: [
  usdc,                    // → _usdc ✓
  feeRecipient,            // → _feeWallet ✓
  escrowWallet,            // → _escrowWallet ✓
  feeBps,                  // → _feeBps ✓
  gelatoOperator,          // → operator ✓
  raffleVault.address,     // → _vault ✓
]
```

### Verify Script (verify.ts:137-144)
```typescript
const nftRaffleVRFArgs = [
  usdc,                    // ✓
  feeRecipient,            // ✓
  escrowWallet,            // ✓
  feeBps,                  // ✓
  gelatoOperator,          // ✓
  raffleVaultAddress,      // ✓
];
```

### Verify Direct Script (verify-nftraffle-direct.ts:362-369)
```typescript
const constructorArgs = [
  checksumAddress(usdcRaw),           // ✓
  checksumAddress(feeRecipientRaw),   // ✓
  checksumAddress(escrowWalletRaw),   // ✓
  feeBps,                              // ✓
  checksumAddress(gelatoOperatorRaw), // ✓
  raffleVaultAddress,                 // ✓
];
```

## ✅ Address Checksumming

All scripts use `ethers.getAddress(address.toLowerCase())` which ensures:
- Addresses are properly checksummed (EIP-55)
- Case-insensitive input is handled correctly
- All addresses match between deployment and verification

## ✅ Type Matching

- `feeBps` is parsed as `parseInt()` → `uint16` ✓
- All addresses are `address` type ✓
- Order matches exactly ✓

## 🔍 Why Verification Might Still Fail

Even though constructor arguments are correct, verification can fail due to:

1. **Source Code Format**: For `viaIR` contracts, Etherscan requires `solidity-standard-json-input` format (not single-file)
2. **Compiler Settings**: Must match exactly:
   - Compiler version: `0.8.20+commit.a1b79de6`
   - Optimizer: Enabled, Runs: 200
   - ViaIR: true
   - EVM Version: paris
3. **Source Code Content**: All imported files must be included in JSON format

## ✅ Solution

The `verify-nftraffle-direct.ts` script now:
- Uses JSON format when `viaIR` is enabled
- Extracts all sources from deployment metadata
- Matches compiler settings exactly
- Properly formats constructor arguments

**Your constructor arguments are 100% correct!** The verification issue is due to the source code format, not the constructor arguments.

