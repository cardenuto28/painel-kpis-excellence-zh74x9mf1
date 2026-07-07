import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useDataStore from '@/stores/use-data-store'
import { KPI_CATEGORIES, MONTH_NAMES, KpiDef } from '@/lib/kpi-definitions'
import { Button } from '@/components/ui/button'

const Sparkline = ({ data }: { data: number[] }) => {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end h-8 gap-[2px] w-24 mx-auto">
      {data.map((val, i) => {
        const height = `${(val / max) * 100}%`
        return (
          <div
            key={i}
            className="w-full bg-primary/60 hover:bg-primary transition-colors rounded-t-[2px]"
            style={{ height: height === '0%' ? '2px' : height }}
            title={`Pontos: ${val}`}
          />
        )
      })}
    </div>
  )
}

const formatRawValue = (kpi: KpiDef, val: any) => {
  if (val === undefined || val === null) return '-'
  if (kpi.type === 'percentage') return `${Number(val).toFixed(2)}%`
  if (kpi.type === 'number') return String(val)
  if (kpi.type === 'boolean') return val ? 'Sim' : 'Não'
  if (kpi.type === 'voc') return `NPS: ${val.nps || 0} (Falhas: ${val.failedSubIndicators || 0})`
  if (kpi.type === 'treinamentos')
    return `V:${val.vendas || 0} P:${val.pos || 0} T:${val.tecnico || 0}`
  if (kpi.type === 'propostaComercial') return `${val.alcancado || 0} / ${val.meta || 0}`
  return String(val)
}

export default function KpiDetails() {
  const { months, kpis, role } = useDataStore()

  const chronologicalMonths = useMemo(() => {
    return [...months].sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano
      return MONTH_NAMES.indexOf(a.mes) - MONTH_NAMES.indexOf(b.mes)
    })
  }, [months])

  const sortedMonthsDesc = useMemo(() => [...chronologicalMonths].reverse(), [chronologicalMonths])

  const [selectedMonthId, setSelectedMonthId] = useState<string | undefined>(
    sortedMonthsDesc[0]?.id,
  )

  const currentMonth = months.find((m) => m.id === selectedMonthId)

  const getSituation = (kpiId: string, maxPoints: number, currentPoints: number) => {
    if (!currentMonth) return null

    if (currentPoints >= maxPoints) return { label: 'Máximo', variant: 'maximo' as const }

    const anyPastScore = chronologicalMonths.some((m) => (m.points[kpiId] || 0) > 0)
    if (currentPoints === 0 && anyPastScore) return { label: 'Zerou', variant: 'zerou' as const }
    if (currentPoints === 0 && !anyPastScore)
      return { label: 'Crítico', variant: 'critico' as const }

    return { label: 'Atenção', variant: 'zerou' as const }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">Detalhes de KPIs</h2>
          <p className="text-muted-foreground mt-1">
            Acompanhamento detalhado por indicador e evolução mensal.
          </p>
        </div>

        {sortedMonthsDesc.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Mês de Referência:</span>
            <Select value={selectedMonthId} onValueChange={setSelectedMonthId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {sortedMonthsDesc.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.mes} {m.ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
            <tr>
              <th className="px-4 py-3 w-[250px]">KPI</th>
              <th className="px-4 py-3 text-center">Realizado</th>
              <th className="px-4 py-3 text-center">Pontos</th>
              <th className="px-4 py-3 text-center">Gap</th>
              <th className="px-4 py-3 text-center">Situação</th>
              <th className="px-4 py-3 text-center">Evolução Anual</th>
              {(role === 'Editor' || role === 'Admin') && (
                <th className="px-4 py-3 text-right">Ação</th>
              )}
            </tr>
          </thead>
          {KPI_CATEGORIES.map((category) => {
            const categoryKpis = kpis.filter((k) => k.category === category)
            if (categoryKpis.length === 0) return null

            const maxCategoryPoints = categoryKpis.reduce((acc, k) => acc + k.maxPoints, 0)

            return (
              <tbody key={category} className="divide-y divide-border/50">
                <tr className="bg-background/50">
                  <td
                    colSpan={100}
                    className="px-4 py-3 font-display font-bold text-primary uppercase text-xs tracking-wider"
                  >
                    {category}{' '}
                    <span className="text-muted-foreground font-normal lowercase tracking-normal">
                      · máx {maxCategoryPoints} pts
                    </span>
                  </td>
                </tr>
                {categoryKpis.map((kpi) => {
                  const pts = currentMonth?.points[kpi.id] || 0
                  const rawVal = currentMonth?.rawValues?.[kpi.id]
                  const situation = getSituation(kpi.id, kpi.maxPoints, pts)
                  const gap = kpi.maxPoints - pts
                  const sparklineData = chronologicalMonths.map((m) => m.points[kpi.id] || 0)

                  return (
                    <tr key={kpi.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{kpi.name}</td>
                      <td className="px-4 py-3 text-center font-mono text-muted-foreground">
                        {currentMonth ? formatRawValue(kpi, rawVal) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        <span
                          className={
                            pts >= kpi.maxPoints ? 'text-status-maximo' : 'text-foreground'
                          }
                        >
                          {pts}
                        </span>
                        <span className="text-muted-foreground text-xs ml-1">
                          / {kpi.maxPoints}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {gap > 0 ? (
                          <span className="text-status-critico">-{gap}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {situation && currentMonth && (
                          <Badge
                            variant="outline"
                            className={
                              situation.variant === 'maximo'
                                ? 'border-status-maximo text-status-maximo bg-status-maximo/10'
                                : situation.variant === 'zerou'
                                  ? 'border-status-zerou text-status-zerou bg-status-zerou/10'
                                  : 'border-status-critico text-status-critico bg-status-critico/10'
                            }
                          >
                            {situation.label}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Sparkline data={sparklineData} />
                      </td>
                      {(role === 'Editor' || role === 'Admin') && (
                        <td className="px-4 py-3 text-right">
                          {situation?.variant !== 'maximo' && currentMonth && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 text-xs text-secondary hover:text-secondary/80"
                            >
                              <Link to="/action-plans">Criar Plano</Link>
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            )
          })}
        </table>
      </div>
    </div>
  )
}
