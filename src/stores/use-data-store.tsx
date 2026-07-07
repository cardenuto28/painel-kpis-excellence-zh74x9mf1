import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { processMonthData } from '@/lib/kpi-calculator'
import { KpiDef, DEFAULT_KPI_DEFINITIONS } from '@/lib/kpi-definitions'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import * as kpiService from '@/services/kpi-definitions'
import * as monthService from '@/services/month-records'
import * as actionPlanService from '@/services/action-plans'
import type { MonthRecord } from '@/services/month-records'
import type { ActionPlan } from '@/services/action-plans'

export type { MonthRecord, ActionPlan }

type Role = 'Admin' | 'Editor' | 'Visualizador' | null

interface AppState {
  role: Role
  months: MonthRecord[]
  actionPlans: ActionPlan[]
  kpis: KpiDef[]
  loading: boolean
}

interface DataContextType extends AppState {
  setRole: (role: Role) => void
  saveMonth: (data: any) => Promise<void>
  deleteMonth: (id: string) => Promise<void>
  saveActionPlan: (plan: any) => Promise<void>
  deleteActionPlan: (id: string) => Promise<void>
  saveKpi: (kpi: KpiDef) => Promise<void>
  deleteKpi: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<AppState>({
    role: null,
    months: [],
    actionPlans: [],
    kpis: [],
    loading: true,
  })

  useEffect(() => {
    setState((prev) => ({ ...prev, role: (user?.role as Role) || null }))
  }, [user])

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }))
    try {
      const kpiDefs = await kpiService.getKpiDefinitions()
      const finalKpis = kpiDefs.length > 0 ? kpiDefs : DEFAULT_KPI_DEFINITIONS
      const [months, plans] = await Promise.all([
        monthService.getMonthRecords(),
        actionPlanService.getActionPlans(),
      ])
      const recalculatedMonths = months.map((m) => {
        const { points, categoryScores, totalScore } = processMonthData(m.rawValues, finalKpis)
        return { ...m, points, categoryScores, totalScore }
      })
      setState((prev) => ({
        ...prev,
        kpis: finalKpis,
        months: recalculatedMonths,
        actionPlans: plans,
        loading: false,
      }))
    } catch {
      setState((prev) => ({ ...prev, loading: false, kpis: DEFAULT_KPI_DEFINITIONS }))
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('kpi_definitions', () => {
    loadData()
  })
  useRealtime('month_records', () => {
    loadData()
  })
  useRealtime('action_plans', () => {
    loadData()
  })

  const setRole = useCallback((role: Role) => {
    setState((prev) => ({ ...prev, role }))
  }, [])

  const recalculateMonths = useCallback((kpis: KpiDef[]) => {
    setState((prev) => ({
      ...prev,
      months: prev.months.map((m) => {
        const { points, categoryScores, totalScore } = processMonthData(m.rawValues, kpis)
        return { ...m, points, categoryScores, totalScore }
      }),
    }))
  }, [])

  const saveMonth = useCallback(
    async (data: any) => {
      const { points, categoryScores, totalScore } = processMonthData(data.rawValues, state.kpis)
      const payload = {
        mes: data.mes,
        ano: data.ano,
        ranking: data.ranking,
        topDealerTotal: data.topDealerTotal,
        rawValues: data.rawValues,
        topDealerRawValues: data.topDealerRawValues,
        points,
        totalScore,
        categoryScores,
        criadoPor: pb.authStore.record?.email || 'unknown',
      }
      if (data.id) {
        const updated = await monthService.updateMonthRecord(data.id, payload)
        setState((prev) => ({
          ...prev,
          months: prev.months.map((m) => (m.id === data.id ? updated : m)),
        }))
      } else {
        const created = await monthService.createMonthRecord(payload)
        setState((prev) => ({ ...prev, months: [...prev.months, created] }))
      }
    },
    [state.kpis],
  )

  const deleteMonth = useCallback(async (id: string) => {
    await monthService.deleteMonthRecord(id)
    setState((prev) => ({ ...prev, months: prev.months.filter((m) => m.id !== id) }))
  }, [])

  const saveActionPlan = useCallback(async (plan: any) => {
    const payload = {
      monthId: plan.monthId,
      kpiId: plan.kpiId,
      description: plan.description,
      responsible: plan.responsible,
      dueDate: plan.dueDate,
      status: plan.status,
    }
    if (plan.id) {
      const updated = await actionPlanService.updateActionPlan(plan.id, payload)
      setState((prev) => ({
        ...prev,
        actionPlans: prev.actionPlans.map((p) => (p.id === plan.id ? updated : p)),
      }))
    } else {
      const created = await actionPlanService.createActionPlan(payload)
      setState((prev) => ({ ...prev, actionPlans: [...prev.actionPlans, created] }))
    }
  }, [])

  const deleteActionPlan = useCallback(async (id: string) => {
    await actionPlanService.deleteActionPlan(id)
    setState((prev) => ({ ...prev, actionPlans: prev.actionPlans.filter((p) => p.id !== id) }))
  }, [])

  const saveKpi = useCallback(
    async (kpi: KpiDef) => {
      const exists = state.kpis.some((k) => k.id === kpi.id)
      if (exists) {
        await kpiService.updateKpiDefinition(kpi)
      } else {
        await kpiService.createKpiDefinition(kpi)
      }
      const updatedKpis = exists
        ? state.kpis.map((k) => (k.id === kpi.id ? kpi : k))
        : [...state.kpis, kpi]
      setState((prev) => ({ ...prev, kpis: updatedKpis }))
      recalculateMonths(updatedKpis)
    },
    [state.kpis, recalculateMonths],
  )

  const deleteKpi = useCallback(
    async (id: string) => {
      await kpiService.deleteKpiDefinition(id)
      const updatedKpis = state.kpis.filter((k) => k.id !== id)
      setState((prev) => ({ ...prev, kpis: updatedKpis }))
      recalculateMonths(updatedKpis)
    },
    [state.kpis, recalculateMonths],
  )

  return (
    <DataContext.Provider
      value={{
        ...state,
        setRole,
        saveMonth,
        deleteMonth,
        saveActionPlan,
        deleteActionPlan,
        saveKpi,
        deleteKpi,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export default function useDataStore() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useDataStore must be used within DataProvider')
  return ctx
}
