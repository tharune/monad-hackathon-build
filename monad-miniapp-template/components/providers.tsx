'use client'

import { InjectedWalletProvider } from '@/context/WalletProvider'
import { FrameProvider } from '@/components/farcaster-provider'
import { WalletProvider } from '@/components/wallet-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <InjectedWalletProvider>
      <WalletProvider>
        <FrameProvider>{children}</FrameProvider>
      </WalletProvider>
    </InjectedWalletProvider>
  )
}
