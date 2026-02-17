'use client'

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  className?: string
}

export function ProgressBar({ value, max, label, className = '' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={`w-full ${className}`}>
      {(label ?? value !== max) && (
        <div className="mb-1 flex justify-between text-sm">
          {label && <span className="font-medium text-neutral-700 dark:text-neutral-300">{label}</span>}
          <span className="text-neutral-500">{value} / {max}</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-full rounded-full bg-neutral-900 transition-[width] duration-300 dark:bg-white"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
