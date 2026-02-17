'use client'

export interface SliceItem {
  index: number
  amount: string
  executed: boolean
}

interface SliceGridProps {
  slices: SliceItem[]
  onExecute?: (sliceIndex: number) => void
  isExecuting?: number | null
  disabled?: boolean
}

export function SliceGrid({ slices, onExecute, isExecuting, disabled }: SliceGridProps) {
  if (slices.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-400">
        No slices in this order.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {slices.map(({ index, amount, executed }) => (
        <div
          key={index}
          className={`rounded-lg border p-3 text-center ${
            executed
              ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30'
              : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
          }`}
        >
          <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Slice {index + 1}</div>
          <div className="mt-0.5 font-mono text-sm text-neutral-900 dark:text-white">{amount}</div>
          {executed ? (
            <span className="mt-2 inline-block text-xs font-medium text-green-700 dark:text-green-400">Done</span>
          ) : (
            <button
              type="button"
              onClick={() => onExecute?.(index)}
              disabled={disabled || isExecuting !== null}
              className="mt-2 w-full rounded bg-neutral-900 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {isExecuting === index ? 'Executing…' : 'Execute'}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
