import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bell, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import useDataStore from '@/stores/use-data-store'
import { parseDate, formatDateBR } from '@/lib/utils'
import { getNpsActionPlans, getNpsCases } from '@/services/nps'
import { useRealtime } from '@/hooks/use-realtime'
import type { NpsActionPlan, NpsCase } from '@/types/nps'

export function AlertsDropdown() {
  const { actionPlans, months, kpis } = useDataStore()
  const [npsPlans, setNpsPlans] = useState<NpsActionPlan[]>([])
  const [npsCases, setNpsCases] = useState<NpsCase[]>([])

  const loadNpsAlerts = async () => {
    try {
      const [plans, cases] = await Promise.all([
        getNpsActionPlans().catch(() => []),
        getNpsCases().catch(() => []),
      ])
      setNpsPlans(plans)
      setNpsCases(cases)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadNpsAlerts()
  }, [])

  useRealtime('nps_action_plans', () => {
    loadNpsAlerts()
  })
  useRealtime('nps_cases', () => {
    loadNpsAlerts()
  })

  const criticalAlerts = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sevenDaysLater = new Date(today)
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

    // Planos de Ação gerais
    const generalPlans = actionPlans
      .filter((p: any) => {
        if (p.status === 'Concluído') return false
        const due = parseDate(p.dueDate)
        if (isNaN(due.getTime())) return false
        return due <= sevenDaysLater
      })
      .map((p: any) => {
        const due = parseDate(p.dueDate)
        const t = new Date()
        t.setHours(0, 0, 0, 0)
        const isOverdue = due < t
        const daysUntil = Math.ceil((due.getTime() - t.getTime()) / (1000 * 60 * 60 * 24))
        const month = months.find((m: any) => m.id === p.monthId)
        const kpi = kpis.find((k: any) => k.id === p.kpiId)
        return {
          id: p.id,
          title: kpi?.name || p.kpiId,
          description: p.description,
          responsible: p.responsible,
          dueDate: p.dueDate,
          due,
          isOverdue,
          daysUntil,
          badge: month ? `${month.mes} ${month.ano}` : undefined,
          link: '/action-plans',
          isNps: false,
        }
      })

    // Planos de ação NPS com prazo próximo ou vencidos
    const npsAlerts = npsPlans
      .filter((p) => {
        if (p.status === 'Concluído') return false
        const due = parseDate(p.prazo)
        if (isNaN(due.getTime())) return false
        return due <= sevenDaysLater
      })
      .map((p) => {
        const due = parseDate(p.prazo)
        const t = new Date()
        t.setHours(0, 0, 0, 0)
        const isOverdue = due < t
        const daysUntil = Math.ceil((due.getTime() - t.getTime()) / (1000 * 60 * 60 * 24))
        const parentCase = npsCases.find((c) => c.id === p.nps_case_id)
        return {
          id: p.id,
          title: `[NPS] ${parentCase?.cliente || 'Caso NPS'}`,
          description: p.descricao,
          responsible: parentCase?.responsavel || 'Equipe NPS',
          dueDate: p.prazo,
          due,
          isOverdue,
          daysUntil,
          badge: parentCase ? `${parentCase.marca} • ${parentCase.departamento}` : 'NPS PG Prime',
          link: '/nps-casos',
          isNps: true,
        }
      })

    return [...generalPlans, ...npsAlerts].sort((a, b) => a.due.getTime() - b.due.getTime())
  }, [actionPlans, months, kpis, npsPlans, npsCases])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {criticalAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-destructive text-destructive-foreground">
              {criticalAlerts.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-destructive" />
            Alertas Críticos
            <Badge variant="destructive" className="ml-auto">
              {criticalAlerts.length}
            </Badge>
          </h3>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {criticalAlerts.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhum alerta crítico no momento.
            </div>
          ) : (
            criticalAlerts.map((alert: any) => (
              <Link
                key={alert.id}
                to={alert.link}
                className="block p-3 border-b border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate flex items-center gap-1.5">
                      {alert.isNps && (
                        <ShieldAlert className="w-3.5 h-3.5 text-destructive shrink-0" />
                      )}
                      {alert.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {alert.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Resp: {alert.responsible}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs font-medium whitespace-nowrap">
                      {formatDateBR(alert.dueDate)}
                    </span>
                    {alert.isOverdue ? (
                      <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                        Atrasado
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 px-1.5 border-orange-500 text-orange-500 bg-orange-500/10"
                      >
                        {alert.daysUntil === 0 ? 'Hoje' : `${alert.daysUntil}d`}
                      </Badge>
                    )}
                  </div>
                </div>
                {alert.badge && (
                  <p className="text-[10px] text-muted-foreground mt-1">{alert.badge}</p>
                )}
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
