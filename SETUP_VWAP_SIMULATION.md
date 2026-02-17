# VWAP simulation setup (end-to-end)

## What this repo now contains

- Hardhat contracts:
  - `MockERC20.sol`
  - `SimpleAMM.sol`
  - `VWAPEngine.sol`
- Deploy script:
  - `Hardhat/deploy/00_deploy_your_contracts.ts`
- Bots:
  - `Hardhat/scripts/keeper.ts`
  - `Hardhat/scripts/flow-bot.ts`
- Frontend chain integration:
  - `monad-miniapp-template/lib/vwap-engine.ts`
  - Updated pages/components for real tx flow

## 1) Configure credentials (required)

Copy env templates and fill secrets locally:

- `Hardhat/.env.example` -> `Hardhat/.env`
- `monad-miniapp-template/.env.example` -> `monad-miniapp-template/.env`

You must set at least:

- `ALCHEMY_API_KEY`
- `DEPLOYER_PRIVATE_KEY`
- `KEEPER_PRIVATE_KEY`
- `FLOW_BOT_PRIVATE_KEY`
- `KEEPER_RPC_URL`
- `FLOW_BOT_RPC_URL`

Then deploy and copy addresses into frontend env:

- `NEXT_PUBLIC_VWAP_ENGINE_ADDRESS`
- `NEXT_PUBLIC_SIMPLE_AMM_ADDRESS`
- `NEXT_PUBLIC_TOKEN_IN_ADDRESS`
- `NEXT_PUBLIC_TOKEN_OUT_ADDRESS`

## 2) Deploy contracts

From `Hardhat/`:

- `yarn deploy:monad`

This deploys:

- `MockUSDC`
- `MockMON`
- `SimpleAMM`
- `VWAPEngine`

and seeds initial AMM liquidity.

## 3) Wire frontend

Set frontend env contract addresses from deployment outputs and run:

- `pnpm dev`

In UI:

1. Connect wallet
2. Faucet tokens
3. Approve tokenIn
4. Create order
5. Open order detail and execute slices

## 4) Run keeper and flow bots

From `Hardhat/`:

- `yarn keeper`
- `yarn flow-bot`

These run continuously:

- Keeper executes due slices.
- Flow bot creates market movement.

## 5) Demo checklist

- Create order tx succeeds
- Execute slice tx succeeds (manual or keeper)
- Order state updates from chain
- Balances change for tokenIn/tokenOut
- Event feed shows tx-linked updates

## Security note

Credentials are intentionally **not hardcoded** in repo files. Keep all private keys and API keys in local `.env` only.

