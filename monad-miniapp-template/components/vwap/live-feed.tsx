'use client'

export interface FeedEvent {
  id: string
  type: 'OrderCreated' | 'SliceExecuted' | 'OrderCompleted'
  message: string
  time: string
}

interface LiveFeedProps {
  events: FeedEvent[]
  maxHeight?: string
  className?: string
}

export function LiveFeed({ events, maxHeight = '12rem', className = '' }: LiveFeedProps) {
  return (
    <section
      className={`rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
    >
      <h2 className="border-b border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 dark:border-neutral-800 dark:text-neutral-300">
        Live feed
      </h2>
      <div
        className="overflow-y-auto p-2 font-mono text-xs text-neutral-600 dark:text-neutral-400"
        style={{ maxHeight }}
      >
        {events.length === 0 ? (
          <p className="p-2 text-neutral-400">No events yet.</p>
        ) : (
          <ul className="space-y-1">
            {events
              .slice()
              .reverse()
              .map((ev) => (
                <li key={ev.id} className="rounded bg-neutral-50 px-2 py-1 dark:bg-neutral-800/50">
                  <span className="text-neutral-400">{ev.time}</span> {ev.message}
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  )
}
