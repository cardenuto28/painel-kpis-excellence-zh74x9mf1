import React, { createContext, useContext, useState, ReactNode } from 'react'
import { MonthRecord, ActionPlan, KPIKey, KPIValue } from '@/types'
import { calculatePoints } from '@/lib/kpi-rules'

interface DataContextType {
  months: MonthRecord[]
  actionPlans: ActionPlan[]
  role: 'viewer' | 'editor'
  setRole: (role: 'viewer' | 'editor') => void
  addMonth: (month: MonthRecord) => void
  updateMonth: (month: MonthRecord) => void
  deleteMonth: (id: string) => void
  addActionPlan: (plan: ActionPlan) => void
  updateActionPlan: (plan: ActionPlan) => void
  deleteActionPlan: (id: string) => void
}

const mockMonths: MonthRecord[] = [
  {
    id: 'm1',
    mes: 'Março',
    ano: 2026,
    ranking: 4,
    topDealerTotal: 88,
    criadoPor: 'admin',
    atualizadoEm: new Date().toISOString(),
    items: {
      vendasRetail: { raw: 105, points: 20 },
      bev: { raw: 100, points: 5 },
      gkl: { raw: 100, points: 5 },
      mMpa: { raw: 110, points: 6 },
      bps: { raw: 90, points: 0 },
      vocVendas: { raw: 96, points: 5 },
      pecas: { raw: 90, points: 0 },
      videos: { raw: 110, points: 3 },
      clientesConectados: { raw: 115, points: 3 },
      serviceInclusive: { raw: 120, points: 5 },
      teleservice: { raw: 100, points: 5 },
      ticketMedio: { raw: 80, points: 0 },
      vocPos: { raw: 88, points: 7 },
      treinamentos: { raw: 5, points: 5 },
      retailStandards: { raw: 100, points: 3 },
      ferramentasDigitais: { raw: 1, points: 1 },
      propostaComercial: { raw: 35, points: 4 },
      sfPenetration: { raw: 90, points: 0 },
    },
  },
  {
    id: 'm2',
    mes: 'Abril',
    ano: 2026,
    ranking: 6,
    topDealerTotal: 85,
    criadoPor: 'admin',
    atualizadoEm: new Date().toISOString(),
    items: {
      vendasRetail: { raw: 95, points: 8 },
      bev: { raw: 90, points: 0 },
      gkl: { raw: 100, points: 5 },
      mMpa: { raw: 110, points: 6 },
      bps: { raw: 90, points: 0 },
      vocVendas: { raw: 96, points: 5 },
      pecas: { raw: 90, points: 0 },
      videos: { raw: 96, points: 1 },
      clientesConectados: { raw: 115, points: 3 },
      serviceInclusive: { raw: 120, points: 5 },
      teleservice: { raw: 100, points: 5 },
      ticketMedio: { raw: 96, points: 2 },
      vocPos: { raw: 88, points: 7 },
      treinamentos: { raw: 5, points: 5 },
      retailStandards: { raw: 100, points: 3 },
      ferramentasDigitais: { raw: 1, points: 1 },
      propostaComercial: { raw: 35, points: 4 },
      sfPenetration: { raw: 90, points: 0 },
    },
  },
  {
    id: 'm3',
    mes: 'Maio',
    ano: 2026,
    ranking: 5,
    topDealerTotal: 84,
    criadoPor: 'admin',
    atualizadoEm: new Date().toISOString(),
    items: {
      vendasRetail: { raw: 96, points: 10 },
      bev: { raw: 100, points: 5 },
      gkl: { raw: 100, points: 5 },
      mMpa: { raw: 90, points: 0 },
      bps: { raw: 90, points: 0 },
      vocVendas: { raw: 96, points: 5 },
      pecas: { raw: 90, points: 0 },
      videos: { raw: 96, points: 1 },
      clientesConectados: { raw: 115, points: 3 },
      serviceInclusive: { raw: 120, points: 5 },
      teleservice: { raw: 100, points: 5 },
      ticketMedio: { raw: 80, points: 0 },
      vocPos: { raw: 88, points: 7 },
      treinamentos: { raw: 5, points: 5 },
      retailStandards: { raw: 100, points: 3 },
      ferramentasDigitais: { raw: 1, points: 1 },
      propostaComercial: { raw: 35, points: 4 },
      sfPenetration: { raw: 90, points: 0 },
    },
  },
]

const mockActionPlans: ActionPlan[] = [
  {
    id: 'p1',
    monthId: 'm3',
    kpiKey: 'pecas',
    description: 'Campanha de desconto em acessórios originais',
    responsible: 'João Silva',
    dueDate: '2026-06-15',
    status: 'Em Andamento',
  },
]

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [months, setMonths] = useState<MonthRecord[]>(mockMonths)
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>(mockActionPlans)
  const [role, setRole] = useState<'viewer' | 'editor'>('editor')

  const addMonth = (month: MonthRecord) => setMonths([...months, month])
  const updateMonth = (month: MonthRecord) =>
    setMonths(months.map((m) => (m.id === month.id ? month : m)))
  const deleteMonth = (id: string) => setMonths(months.filter((m) => m.id !== id))

  const addActionPlan = (plan: ActionPlan) => setActionPlans([...actionPlans, plan])
  const updateActionPlan = (plan: ActionPlan) =>
    setActionPlans(actionPlans.map((p) => (p.id === plan.id ? plan : p)))
  const deleteActionPlan = (id: string) => setActionPlans(actionPlans.filter((p) => p.id !== id))

  return React.createElement(
    DataContext.Provider,
    {
      value: {
        months,
        actionPlans,
        role,
        setRole,
        addMonth,
        updateMonth,
        deleteMonth,
        addActionPlan,
        updateActionPlan,
        deleteActionPlan,
      },
    },
    children,
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
