import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export function Gauge({
  value,
  max = 100,
  label,
  subLabel,
  className,
  colorClass = 'stroke-primary',
}: {
  value: number
  max?: number
  label: string
  subLabel?: string
  className?: string
  colorClass?: string
}) {
  const radius = 80
  const circumference = radius * Math.PI
  const safeValue = Math.min(Math.max(value, 0), max)
  const strokeDashoffset = circumference - (safeValue / max) * circumference

  return (
    <div className={cn('relative flex flex-col items-center justify-center', className)}>
      <svg width="240" height="130" viewBox="0 0 200 110" className="overflow-visible">
        {/* Background track */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="var(--border)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress path */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn('transition-all duration-1000 ease-out', colorClass)}
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end text-center">
        <span className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tighter">
          {label}
        </span>
        {subLabel && (
          <span className="text-sm font-medium text-muted-foreground mt-1">{subLabel}</span>
        )}
      </div>
    </div>
  )
}
