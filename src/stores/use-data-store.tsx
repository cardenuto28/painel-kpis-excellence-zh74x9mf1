import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import type { KpiDef } from '@/lib/kpi-definitions'

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
  saveKpi: (data: KpiDef) => Promise<void>
  deleteKpi: (kpiId: string) => Promise<void>
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
      const mappedKpis: KpiDef[] = kpiDefs.map((k: any) => ({
        id: k.kpiId,
        name: k.name,
        category: k.category,
        maxPoints: k.maxPoints,
        type: k.type,
        tiers: parseJsonField(k.tiers),
      }))
      const points: Record<string, number> = data.points || {}
      const categoryScores: Record<string, number> = {}
      for (const kpi of mappedKpis) {
        categoryScores[kpi.category] = (categoryScores[kpi.category] || 0) + (points[kpi.id] || 0)
      }
      const totalScore = Object.values(points).reduce((a: number, b: number) => a + b, 0)
      const payload = {
        mes: data.mes,
        ano: data.ano,
        ranking: data.ranking,
        topDealerTotal: data.topDealerTotal,
        rawValues: JSON.stringify(points),
        topDealerRawValues: JSON.stringify(data.topDealerPoints || {}),
        points: JSON.stringify(points),
        totalScore,
        categoryScores: JSON.stringify(categoryScores),
        criadoPor: user?.email || '',
      }
      if (data.id) await pb.collection('month_records').update(data.id, payload)
      else await pb.collection('month_records').create(payload)
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
      const fields: Record<string, any> = {
        monthId: data.monthId,
        kpiId: data.kpiId,
        description: data.description,
        responsible: data.responsible,
        dueDate: data.dueDate,
        status: data.status || 'Pendente',
      }
      if (data.resultFile instanceof File) {
        const formData = new FormData()
        Object.keys(fields).forEach((key) => formData.append(key, String(fields[key])))
        formData.append('resultFile', data.resultFile)
        if (data.id) await pb.collection('action_plans').update(data.id, formData)
        else await pb.collection('action_plans').create(formData)
      } else {
        if (data.id) await pb.collection('action_plans').update(data.id, fields)
        else await pb.collection('action_plans').create(fields)
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

  const saveKpi = useCallback(
    async (data: KpiDef) => {
      const payload = {
        kpiId: data.id,
        name: data.name,
        category: data.category,
        maxPoints: data.maxPoints,
        type: data.type,
        tiers: JSON.stringify(data.tiers || []),
        sort_order: (data as any).sort_order || 0,
      }
      try {
        const existing = await pb
          .collection('kpi_definitions')
          .getFirstListItem(`kpiId="${data.id}"`)
        await pb.collection('kpi_definitions').update(existing.id, payload)
      } catch {
        await pb.collection('kpi_definitions').create(payload)
      }
      await refresh()
    },
    [refresh],
  )

  const deleteKpi = useCallback(
    async (kpiId: string) => {
      try {
        const existing = await pb.collection('kpi_definitions').getFirstListItem(`kpiId="${kpiId}"`)
        await pb.collection('kpi_definitions').delete(existing.id)
      } catch {
        /* intentionally ignored */
      }
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
        saveKpi,
        deleteKpi,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  )
}

export default useDataStore
