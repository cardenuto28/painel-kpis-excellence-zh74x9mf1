import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import useDataStore from '@/stores/use-data-store'
import { KPI_CATEGORIES, MONTH_NAMES } from '@/lib/kpi-definitions'
import { Button } from '@/components/ui/button'

export default function KpiDetails() {
  const { months, kpis, role } = useDataStore()

  const chronologicalMonths = useMemo(() => {
    return [...months].sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano
      return MONTH_NAMES.indexOf(a.mes) - MONTH_NAMES.indexOf(b.mes)
    })
  }, [months])

  const getSituation = (kpiId: string, maxPoints: number) => {
    if (chronologicalMonths.length === 0) return null

    const latestMonth = chronologicalMonths[chronologicalMonths.length - 1]
    const latestPoints = latestMonth.points[kpiId] || 0

    if (latestPoints >= maxPoints) return { label: 'Máximo', variant: 'maximo' as const }

    const anyPastScore = chronologicalMonths.some((m) => (m.points[kpiId] || 0) > 0)
    if (latestPoints === 0 && anyPastScore) return { label: 'Zerou', variant: 'zerou' as const }
    if (latestPoints === 0 && !anyPastScore)
      return { label: 'Crítico', variant: 'critico' as const }

    return { label: 'Atenção', variant: 'zerou' as const }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold">Detalhes de KPIs</h2>
        <p className="text-muted-foreground mt-1">
          Acompanhamento detalhado por indicador e evolução mensal.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
            <tr>
              <th className="px-4 py-3 w-[300px]">KPI</th>
              <th className="px-4 py-3 text-center">Máx</th>
              {chronologicalMonths.map((m) => (
                <th key={m.id} className="px-4 py-3 text-center whitespace-nowrap">
                  {m.mes.substring(0, 3)}/{m.ano.toString().slice(-2)}
                </th>
              ))}
              <th className="px-4 py-3 text-center">Situação</th>
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
                  const situation = getSituation(kpi.id, kpi.maxPoints)
                  return (
                    <tr key={kpi.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{kpi.name}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {kpi.maxPoints}
                      </td>
                      {chronologicalMonths.map((m) => {
                        const pts = m.points[kpi.id] || 0
                        const isMax = pts >= kpi.maxPoints
                        const isZero = pts === 0
                        return (
                          <td
                            key={m.id}
                            className={`px-4 py-3 text-center font-mono ${
                              isMax
                                ? 'text-status-maximo'
                                : isZero
                                  ? 'text-status-critico'
                                  : 'text-status-zerou'
                            }`}
                          >
                            {pts}
                          </td>
                        )
                      })}
                      <td className="px-4 py-3 text-center">
                        {situation && (
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
                      {(role === 'Editor' || role === 'Admin') && (
                        <td className="px-4 py-3 text-right">
                          {situation?.variant !== 'maximo' && (
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
