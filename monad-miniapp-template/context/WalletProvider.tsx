'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { CHAIN_ID } from '@/lib/chain'
import * as walletLib from '@/lib/wallet'

export interface InjectedWalletContextValue {
  address: `0x${string}` | undefined
  chainId: number
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  isInjectedAvailable: boolean
}

const InjectedWalletContext = createContext<InjectedWalletContextValue | undefined>(undefined)

export function useInjectedWallet(): InjectedWalletContextValue {
  const ctx = useContext(InjectedWalletContext)
  if (ctx === undefined)
    throw new Error('useInjectedWallet must be used within InjectedWalletProvider')
  return ctx
}

interface InjectedWalletProviderProps {
  children: ReactNode
}

export function InjectedWalletProvider({ children }: InjectedWalletProviderProps) {
  const [address, setAddress] = useState<`0x${string}` | undefined>(undefined)
  const [chainId, setChainId] = useState(CHAIN_ID)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isInjectedAvailable, setIsInjectedAvailable] = useState(false)

  const connect = useCallback(async () => {
    setIsConnecting(true)
    try {
      const acc = await walletLib.connect()
      setAddress(acc)
      const hexChainId =
        typeof window !== 'undefined' && window.ethereum
          ? ((await window.ethereum.request({ method: 'eth_chainId' })) as string)
          : undefined
      if (hexChainId) setChainId(Number.parseInt(hexChainId, 16))
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(undefined)
  }, [])

  useEffect(() => {
    const ethereum = typeof window !== 'undefined' ? window.ethereum : undefined
    setIsInjectedAvailable(Boolean(ethereum))

    if (!ethereum) return

    const onAccountsChanged = (accounts: unknown) => {
      const list = Array.isArray(accounts) ? accounts : []
      setAddress((list[0] as `0x${string}`) ?? undefined)
    }

    const onChainChanged = (id: unknown) => {
      const num = typeof id === 'string' ? Number.parseInt(id, 16) : Number(id)
      if (!Number.isNaN(num)) setChainId(num)
    }

    ethereum.on?.('accountsChanged', onAccountsChanged)
    ethereum.on?.('chainChanged', onChainChanged)

    ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts: unknown) => {
        const list = Array.isArray(accounts) ? accounts : []
        setAddress((list[0] as `0x${string}`) ?? undefined)
      })
      .catch(() => {})

    ethereum
      .request({ method: 'eth_chainId' })
      .then((id: unknown) => {
        const num = typeof id === 'string' ? Number.parseInt(id, 16) : Number(id)
        if (!Number.isNaN(num)) setChainId(num)
      })
      .catch(() => {})

    return () => {
      ethereum.removeListener?.('accountsChanged', onAccountsChanged)
      ethereum.removeListener?.('chainChanged', onChainChanged)
    }
  }, [])

  const value: InjectedWalletContextValue = {
    address,
    chainId,
    isConnecting,
    connect,
    disconnect,
    isInjectedAvailable,
  }

  return <InjectedWalletContext.Provider value={value}>{children}</InjectedWalletContext.Provider>
}
