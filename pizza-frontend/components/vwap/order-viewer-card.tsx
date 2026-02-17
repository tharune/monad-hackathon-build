'use client'

import { useState } from 'react'
import Link from 'next/link'

export function OrderViewerCard() {
  const [orderId, setOrderId] = useState('')

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">View order</h2>
      <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">
        Enter an order ID to open its detail and execute slices.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="0x… or bytes32"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
        />
        <Link
          href={orderId.trim() ? `/order/${encodeURIComponent(orderId.trim())}` : '#'}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Open
        </Link>
      </div>
    </section>
  )
}
