'use client'

import { LiveFeed, OrderCreateCard, OrderViewerCard } from '@/components/vwap'
import type { FeedEvent } from '@/components/vwap'
import { useState } from 'react'

export function HomePage() {
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>([])

  const handleCreateOrder = (_totalAmount: number, _numSlices: number) => {
    setFeedEvents((prev) => [
      ...prev,
      {
        id: `create-${Date.now()}`,
        type: 'OrderCreated',
        message: `Order created: ${_numSlices} slices, total ${_totalAmount}`,
        time: new Date().toLocaleTimeString(),
      },
    ])
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">VWAP Demo</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        Create orders and execute slices. View an order by ID to run slices in any order (or in
        parallel).
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <OrderCreateCard onSubmit={handleCreateOrder} />
        <OrderViewerCard />
      </div>

      <LiveFeed events={feedEvents} />
    </div>
  )
}
