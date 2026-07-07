import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

interface DataStoreContextType {
  kpiDefinitions: any[]
  monthRecords: any[]
  actionPlans: any[]
  loading: boolean
  refresh: () => Promise<void>
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined)

export const useDataStore = () => {
  const context = useContext(DataStoreContext)
  if (!context) throw new Error('useDataStore must be used within DataProvider')
  return context
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [kpiDefinitions, setKpiDefinitions] = useState<any[]>([])
  const [monthRecords, setMonthRecords] = useState<any[]>([])
  const [actionPlans, setActionPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const [kpis, months, plans] = await Promise.all([
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
      setKpiDefinitions(kpis)
      setMonthRecords(months)
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

  return (
    <DataStoreContext.Provider
      value={{ kpiDefinitions, monthRecords, actionPlans, loading, refresh }}
    >
      {children}
    </DataStoreContext.Provider>
  )
}
