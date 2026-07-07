import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'

interface DataStoreContextType {
  kpis: any[]
  months: any[]
  actionPlans: any[]
  loading: boolean
  role: string
  refresh: () => Promise<void>
  saveMonth: (data: any) => Promise<void>
  deleteMonth: (id: string) => Promise<void>
  saveActionPlan: (data: any) => Promise<void>
  deleteActionPlan: (id: string) => Promise<void>
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined)

export const useDataStore = () => {
  const context = useContext(DataStoreContext)
  if (!context) throw new Error('useDataStore must be used within DataProvider')
  return context
}

function parseJsonField(value: any): any {
  if (!value) return {}
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return {}
    }
  }
  return value
}

function calculateKpiPoints(kpi: any, rawValue: any): number {
  if (rawValue === undefined || rawValue === null || rawValue === '') return 0
  const v = Number(rawValue)
  if (isNaN(v)) return 0

  if (kpi.type === 'boolean') return v > 0 ? kpi.maxPoints : 0
  if (kpi.type === 'percentage') {
    return Math.min(kpi.maxPoints, Math.max(0, Math.round((v / 100) * kpi.maxPoints)))
  }
  const target = kpi.maxPoints * 5
  return Math.min(kpi.maxPoints, Math.max(0, Math.round((v / target) * kpi.maxPoints)))
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [kpis, setKpis] = useState<any[]>([])
  const [months, setMonths] = useState<any[]>([])
  const [actionPlans, setActionPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const role = user?.role || 'Visualizador'

  const refresh = useCallback(async () => {
    try {
      const [kpiDefs, monthRecs, plans] = await Promise.all([
        pb
          .collection('kpi_definitions')
          .getFullList({ sort: 'sort_order' })
          .catch(() => []),
        pb
          .collection('month_records')
          .getFullList({ sort: '-ano,-mes' })
          .catch(() => []),
        pb
          .collection('action_plans')
          .getFullList({ sort: '-created' })
          .catch(() => []),
      ])

      setKpis(
        kpiDefs.map((k: any) => ({
          id: k.kpiId,
          name: k.name,
          category: k.category,
          maxPoints: k.maxPoints,
          type: k.type,
          tiers: parseJsonField(k.tiers),
          sort_order: k.sort_order,
          _pbId: k.id,
        })),
      )

      setMonths(
        monthRecs.map((m: any) => ({
          ...m,
          rawValues: parseJsonField(m.rawValues),
          topDealerRawValues: parseJsonField(m.topDealerRawValues),
          points: parseJsonField(m.points),
          categoryScores: parseJsonField(m.categoryScores),
        })),
      )

      setActionPlans(plans)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useRealtime('kpi_definitions', () => {
    refresh()
  })
  useRealtime('month_records', () => {
    refresh()
  })
  useRealtime('action_plans', () => {
    refresh()
  })

  const saveMonth = useCallback(
    async (data: any) => {
      const kpiDefs = await pb.collection('kpi_definitions').getFullList({ sort: 'sort_order' })
      const mappedKpis = kpiDefs.map((k: any) => ({
        id: k.kpiId,
        name: k.name,
        category: k.category,
        maxPoints: k.maxPoints,
        type: k.type,
      }))

      const rawValues = data.rawValues || {}
      const points: Record<string, number> = {}
      const categoryScores: Record<string, number> = {}

      for (const kpi of mappedKpis) {
        const pts = calculateKpiPoints(kpi, rawValues[kpi.id])
        points[kpi.id] = pts
        categoryScores[kpi.category] = (categoryScores[kpi.category] || 0) + pts
      }

      const totalScore = Object.values(points).reduce((a: number, b: number) => a + b, 0)

      const payload = {
        mes: data.mes,
        ano: data.ano,
        ranking: data.ranking,
        topDealerTotal: data.topDealerTotal,
        rawValues: JSON.stringify(rawValues),
        topDealerRawValues: JSON.stringify(data.topDealerRawValues || {}),
        points: JSON.stringify(points),
        totalScore,
        categoryScores: JSON.stringify(categoryScores),
        criadoPor: user?.email || '',
      }

      if (data.id) {
        await pb.collection('month_records').update(data.id, payload)
      } else {
        await pb.collection('month_records').create(payload)
      }
      await refresh()
    },
    [user, refresh],
  )

  const deleteMonth = useCallback(
    async (id: string) => {
      await pb.collection('month_records').delete(id)
      await refresh()
    },
    [refresh],
  )

  const saveActionPlan = useCallback(
    async (data: any) => {
      const payload = {
        monthId: data.monthId,
        kpiId: data.kpiId,
        description: data.description,
        responsible: data.responsible,
        dueDate: data.dueDate,
        status: data.status || 'Pendente',
      }

      if (data.id) {
        await pb.collection('action_plans').update(data.id, payload)
      } else {
        await pb.collection('action_plans').create(payload)
      }
      await refresh()
    },
    [refresh],
  )

  const deleteActionPlan = useCallback(
    async (id: string) => {
      await pb.collection('action_plans').delete(id)
      await refresh()
    },
    [refresh],
  )

  return (
    <DataStoreContext.Provider
      value={{
        kpis,
        months,
        actionPlans,
        loading,
        role,
        refresh,
        saveMonth,
        deleteMonth,
        saveActionPlan,
        deleteActionPlan,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  )
}

export default useDataStore
