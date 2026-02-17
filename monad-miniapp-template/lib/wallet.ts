import { createPublicClient, createWalletClient, custom, http, type WalletClient, type PublicClient } from 'viem'
import { chain } from './chain'

declare global {
  interface Window {
    ethereum?: import('viem').EIP1193Provider
  }
}

function getEthereum(): Window['ethereum'] {
  if (typeof window === 'undefined') return undefined
  return window.ethereum
}

/**
 * Wallet client using window.ethereum (injected provider).
 * Use after connect() has been called and user has approved.
 */
export function getWalletClient(): WalletClient | undefined {
  const ethereum = getEthereum()
  if (!ethereum) return undefined
  return createWalletClient({
    transport: custom(ethereum),
    chain,
  })
}

/**
 * Public client for reading from the chain (uses NEXT_PUBLIC_RPC_URL).
 */
export function getPublicClient(): PublicClient {
  return createPublicClient({
    chain,
    transport: http(chain.rpcUrls.default.http[0]),
  })
}

/**
 * Request accounts from the injected provider (triggers connect UI).
 * Returns the first account or undefined if rejected.
 */
export async function connect(): Promise<`0x${string}` | undefined> {
  const ethereum = getEthereum()
  if (!ethereum) {
    console.warn('No injected provider (window.ethereum)')
    return undefined
  }
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as `0x${string}`[]
  return accounts?.[0]
}

/**
 * Disconnect is handled in UI (clear address). Injected provider has no disconnect.
 */
export function disconnect(): void {
  // No-op at lib level; WalletProvider clears state
}
