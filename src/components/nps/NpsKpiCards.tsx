import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Clock, CheckCircle2, TrendingUp, ShieldAlert } from 'lucide-react'
import type { NpsKpiSummary } from '@/types/nps'

interface NpsKpiCardsProps {
  summary: NpsKpiSummary
  onKpiClick?: (filterType: 'all' | 'pending' | 'resolved' | 'without-plans') => void
  onOpenCriticalCase?: () => void
}

export function NpsKpiCards({ summary, onKpiClick }: NpsKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Casos Críticos & Detratores */}
      <Card
        onClick={() => onKpiClick?.('all')}
        className="cursor-pointer border-border/50 bg-card/40 backdrop-blur-sm hover:border-primary/50 transition-all group relative overflow-hidden"
      >
        {typeof summary.withoutPlansCount === 'number' && summary.withoutPlansCount > 0 && (
          <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl">
            {summary.withoutPlansCount} sem plano
          </div>
        )}
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Casos NPS Críticos
            </span>
            <div className="text-3xl font-display font-bold">{summary.totalCritical}</div>
            <div className="text-xs text-destructive font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {summary.detractorsCount} detratores (nota ≤ 6)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <AlertCircle className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Pendentes / Em Tratamento */}
      <Card
        onClick={() => onKpiClick?.('pending')}
        className="cursor-pointer border-border/50 bg-card/40 backdrop-blur-sm hover:border-amber-500/50 transition-all group"
      >
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Casos Ativos
            </span>
            <div className="text-3xl font-display font-bold text-amber-500">
              {summary.pendingCount}
            </div>
            <div className="text-xs text-muted-foreground">Em tratamento ou pendentes</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Resolvidos */}
      <Card
        onClick={() => onKpiClick?.('resolved')}
        className="cursor-pointer border-border/50 bg-card/40 backdrop-blur-sm hover:border-emerald-500/50 transition-all group"
      >
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Resolvidos
            </span>
            <div className="text-3xl font-display font-bold text-emerald-500">
              {summary.resolvedCount}
            </div>
            <div className="text-xs text-emerald-500/90 font-medium">
              Taxa de resolução: {summary.resolutionRate}%
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Tempo Médio de Resolução */}
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Tempo Médio Resolução
            </span>
            <div className="text-3xl font-display font-bold">
              {summary.avgResolutionDays > 0 ? `${summary.avgResolutionDays}d` : '—'}
            </div>
            <div className="text-xs text-muted-foreground">Dias entre abertura e solução</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
