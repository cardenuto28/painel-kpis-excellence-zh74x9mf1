import { cn } from '@/lib/utils'

interface GaugeProps {
  value: number
  max?: number
  className?: string
  delta?: number
}

export function Gauge({ value, max = 100, className, delta }: GaugeProps) {
  const radius = 85
  const stroke = 14
  const normalized = Math.min(Math.max(value, 0), max)
  const circumference = radius * Math.PI
  const strokeDashoffset = circumference - (normalized / max) * circumference

  return (
    <div className={cn('relative flex flex-col items-center justify-center', className)}>
      <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-elevation overflow-visible">
        <path
          d="M 15 105 A 85 85 0 0 1 185 105"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
          strokeLinecap="round"
          opacity={0.4}
        />
        <path
          d="M 15 105 A 85 85 0 0 1 185 105"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute bottom-4 flex flex-col items-center">
        <span className="text-5xl font-display font-bold text-foreground tabular-nums">
          {value}
        </span>
        <span className="text-sm font-medium text-muted-foreground mt-1">Pontos Totais</span>
        {delta !== undefined && delta !== 0 && (
          <span
            className={cn(
              'text-xs font-bold px-2 py-0.5 rounded-full mt-2',
              delta > 0 ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive',
            )}
          >
            {delta > 0 ? '+' : ''}
            {delta} vs Mês Ant.
          </span>
        )}
      </div>
    </div>
  )
}
