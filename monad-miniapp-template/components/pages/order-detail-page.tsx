'use client'

import Link from 'next/link'
import { ProgressBar, SliceGrid, LiveFeed } from '@/components/vwap'
import type { SliceItem, FeedEvent } from '@/components/vwap'
import { useState } from 'react'

interface OrderDetailPageProps {
  orderId: string
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [isExecuting, setIsExecuting] = useState<number | null>(null)

  const executedCount = 0
  const numSlices = 10
  const slices: SliceItem[] = Array.from({ length: numSlices }, (_, i) => ({
    index: i,
    amount: String(100 + i * 10),
    executed: i < executedCount,
  }))

  const handleExecute = (sliceIndex: number) => {
    setIsExecuting(sliceIndex)
    setEvents((prev) => [
      ...prev,
      {
        id: `slice-${Date.now()}-${sliceIndex}`,
        type: 'SliceExecuted',
        message: `Slice ${sliceIndex + 1} executed`,
        time: new Date().toLocaleTimeString(),
      },
    ])
    setTimeout(() => setIsExecuting(null), 800)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          ← Back
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Order detail</h1>
      <p className="break-all font-mono text-sm text-neutral-500 dark:text-neutral-400">{orderId}</p>

      <ProgressBar value={executedCount} max={numSlices} label="Slices executed" />

      <div>
        <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">Slices</h2>
        <SliceGrid
          slices={slices}
          onExecute={handleExecute}
          isExecuting={isExecuting}
        />
      </div>

      <LiveFeed events={events} maxHeight="10rem" />
    </div>
  )
}
