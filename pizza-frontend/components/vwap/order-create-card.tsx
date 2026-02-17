'use client'

import { useState } from 'react'

interface OrderCreateCardProps {
  onSubmit?: (totalAmount: number, numSlices: number) => void
  isPending?: boolean
}

export function OrderCreateCard({ onSubmit, isPending }: OrderCreateCardProps) {
  const [totalAmount, setTotalAmount] = useState('1000')
  const [numSlices, setNumSlices] = useState('10')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(totalAmount, 10)
    const slices = Math.min(20, Math.max(1, parseInt(numSlices, 10) || 1))
    if (amount > 0 && onSubmit) onSubmit(amount, slices)
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Create order</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="totalAmount"
            className="mb-1 block text-sm font-medium text-neutral-600 dark:text-neutral-400"
          >
            Total amount
          </label>
          <input
            id="totalAmount"
            type="number"
            min={1}
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>
        <div>
          <label
            htmlFor="numSlices"
            className="mb-1 block text-sm font-medium text-neutral-600 dark:text-neutral-400"
          >
            Slices (1–20)
          </label>
          <input
            id="numSlices"
            type="number"
            min={1}
            max={20}
            value={numSlices}
            onChange={(e) => setNumSlices(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {isPending ? 'Creating…' : 'Create order'}
        </button>
      </form>
    </section>
  )
}
