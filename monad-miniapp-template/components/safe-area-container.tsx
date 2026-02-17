import type { SafeAreaInsets } from '@/types'

interface SafeAreaContainerProps {
  children: React.ReactNode
  insets?: SafeAreaInsets
}

export const SafeAreaContainer = ({
  children,
  insets,
}: SafeAreaContainerProps) => (
  <div
    className="flex min-h-screen flex-col"
    style={{
      paddingTop: insets?.top ?? 0,
      paddingBottom: insets?.bottom ?? 0,
      paddingLeft: insets?.left ?? 0,
      paddingRight: insets?.right ?? 0,
    }}
  >
    {children}
  </div>
)
