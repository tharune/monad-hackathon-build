'use client'

import Link from 'next/link'
import { useInjectedWallet } from '@/context/WalletProvider'

export function Header() {
  const { address, isConnecting, connect, disconnect, isInjectedAvailable } = useInjectedWallet()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-neutral-800 dark:bg-neutral-950/95 dark:supports-[backdrop-filter]:bg-neutral-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-white">
          VWAP Demo
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/about"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            About
          </Link>
          {address ? (
            <div className="flex items-center gap-2">
              <span
                className="max-w-[120px] truncate text-sm text-neutral-500 sm:max-w-[160px]"
                title={address}
              >
                {address.slice(0, 6)}…{address.slice(-4)}
              </span>
              <button
                type="button"
                onClick={() => disconnect()}
                className="rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => connect()}
              disabled={isConnecting || !isInjectedAvailable}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {isConnecting ? 'Connecting…' : !isInjectedAvailable ? 'No wallet' : 'Connect wallet'}
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
