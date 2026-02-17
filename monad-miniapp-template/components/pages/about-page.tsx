'use client'

export function AboutPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
        VWAP Demo — Pitch & How it works
      </h1>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">Pitch</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          This is a minimal VWAP (volume-weighted average price) slicing demo for Monad. Orders are split into
          multiple slices that can be executed in any order—or in parallel—showcasing high-throughput, parallelizable
          execution on Monad.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">How it works</h2>
        <ul className="list-inside list-disc space-y-2 text-neutral-600 dark:text-neutral-400">
          <li><strong>Create an order</strong> with a total amount and number of slices (1–20). Slice sizes follow a simple 150% / 100% / 50% pattern.</li>
          <li><strong>View an order</strong> by pasting its order ID. You’ll see all slices and their executed status.</li>
          <li><strong>Execute slices</strong> in any order. Each slice can be executed exactly once (enforced on-chain with a bitmask).</li>
          <li><strong>Live feed</strong> shows recent events (order created, slice executed, order completed) for a clear, projector-friendly view.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
        <h2 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">Tech</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Built with Next.js (App Router), TypeScript, Tailwind, and the Farcaster miniapp SDK. Contract: VWAPDemo on Monad testnet.
        </p>
      </section>
    </div>
  )
}
