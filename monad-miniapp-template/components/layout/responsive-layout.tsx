'use client'

import { useFrame } from '@/components/farcaster-provider'
import { SafeAreaContainer } from '@/components/safe-area-container'
import type { MiniAppPlatformType } from '@/types'
import { BottomNav } from './bottom-nav'
import { Header } from './header'

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const { context, isLoading, isSDKLoaded } = useFrame()

  const platformType: MiniAppPlatformType | undefined = context?.client?.platformType
  const isMiniApp = platformType === 'mobile'
  const insets = context?.client?.safeAreaInsets

  if (isLoading) {
    return (
      <SafeAreaContainer insets={insets}>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <p className="text-neutral-500">Loading…</p>
        </div>
      </SafeAreaContainer>
    )
  }

  if (!isSDKLoaded && !context) {
    return (
      <SafeAreaContainer insets={insets}>
        <Header />
        <main className="min-h-[calc(100vh-3.5rem)] w-full max-w-5xl mx-auto px-4 py-6">
          <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            Open in Farcaster for the mini app experience, or use the header to connect a wallet on web.
          </p>
          {children}
        </main>
      </SafeAreaContainer>
    )
  }

  return (
    <SafeAreaContainer insets={insets}>
      {isMiniApp ? (
        <>
          <main
            className="min-h-screen w-full max-w-5xl mx-auto px-4 pt-4 pb-24"
            style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
          >
            {children}
          </main>
          <BottomNav />
        </>
      ) : (
        <>
          <Header />
          <main className="min-h-[calc(100vh-3.5rem)] w-full max-w-5xl mx-auto px-4 py-6">
            {children}
          </main>
        </>
      )}
    </SafeAreaContainer>
  )
}
