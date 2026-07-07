import { useSyncExternalStore } from 'react'
import { processMonthData } from '@/lib/kpi-calculator'
import { KpiDef, DEFAULT_KPI_DEFINITIONS } from '@/lib/kpi-definitions'

export interface MonthRecord {
  id: string
  mes: string
  ano: number
  ranking: number
  topDealerTotal: number
  rawValues: Record<string, any>
  topDealerRawValues?: Record<string, any>
  points: Record<string, number>
  totalScore: number
  categoryScores: Record<string, number>
  criadoPor: string
  atualizadoEm: string
}

export interface ActionPlan {
  id: string
  monthId: string
  kpiId: string
  description: string
  responsible: string
  dueDate: string
  status: 'Pendente' | 'Em Andamento' | 'Concluído'
}

interface AppState {
  role: 'Admin' | 'Editor' | 'Visualizador' | null
  months: MonthRecord[]
  actionPlans: ActionPlan[]
  kpis: KpiDef[]
}

const mockRawValuesMar = {
  vendasRetail: 105,
  bev: 100,
  gkl: 100,
  mMpa: 105,
  bps: 90,
  vocVendas: { nps: 98, failedSubIndicators: 0 },
  pecas: 90,
  videos: 115,
  clientesConectados: 110,
  serviceInclusive: 120,
  teleservice: 105,
  ticketMedio: 90,
  vocPos: { nps: 90, failedSubIndicators: 0 },
  treinamentos: { vendas: 2, pos: 2, tecnico: 1 },
  retailStandards: 98,
  ferramentasDigitais: true,
  propostaComercial: 55.1,
  sfPenetration: 90,
}

const mockRawValuesApr = {
  ...mockRawValuesMar,
  vendasRetail: 95,
  pecas: 98,
  vocVendas: { nps: 90, failedSubIndicators: 1 },
  serviceInclusive: 96,
  bps: 105,
}

const mockRawValuesMay = {
  ...mockRawValuesMar,
  vendasRetail: 98,
  bev: 105,
  pecas: 90,
  vocPos: { nps: 85, failedSubIndicators: 0 },
  bps: 100,
  sfPenetration: 102,
}

const mockTopDealerRawValuesMar = {
  vendasRetail: 126,
  bev: 200,
  gkl: 200,
  mMpa: 167,
  bps: 185,
  vocVendas: { nps: 100, failedSubIndicators: 0 },
  pecas: 197,
  videos: 263,
  clientesConectados: 268,
  serviceInclusive: 303,
  teleservice: 175,
  ticketMedio: 258,
  vocPos: { nps: 100, failedSubIndicators: 0 },
  treinamentos: { vendas: 5, pos: 5, tecnico: 5 },
  retailStandards: 100,
  ferramentasDigitais: false,
  propostaComercial: 100,
  sfPenetration: 193,
}

const mockTopDealerRawValuesApr = {
  ...mockTopDealerRawValuesMar,
  vendasRetail: 124,
  bps: 225,
  pecas: 155,
  serviceInclusive: 337,
  mMpa: 200,
}

const mockTopDealerRawValuesMay = {
  ...mockTopDealerRawValuesMar,
  vendasRetail: 122,
  pecas: 153,
  serviceInclusive: 292,
  sfPenetration: 221,
  mMpa: 200,
}

const MOCK_MONTHS: MonthRecord[] = [
  {
    id: 'm-3',
    mes: 'Março',
    ano: 2026,
    ranking: 4,
    topDealerTotal: 88,
    rawValues: mockRawValuesMar,
    topDealerRawValues: mockTopDealerRawValuesMar,
    ...processMonthData(mockRawValuesMar, DEFAULT_KPI_DEFINITIONS),
    criadoPor: 'admin',
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: 'm-4',
    mes: 'Abril',
    ano: 2026,
    ranking: 6,
    topDealerTotal: 85,
    rawValues: mockRawValuesApr,
    topDealerRawValues: mockTopDealerRawValuesApr,
    ...processMonthData(mockRawValuesApr, DEFAULT_KPI_DEFINITIONS),
    criadoPor: 'admin',
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: 'm-5',
    mes: 'Maio',
    ano: 2026,
    ranking: 5,
    topDealerTotal: 84,
    rawValues: mockRawValuesMay,
    topDealerRawValues: mockTopDealerRawValuesMay,
    ...processMonthData(mockRawValuesMay, DEFAULT_KPI_DEFINITIONS),
    criadoPor: 'admin',
    atualizadoEm: new Date().toISOString(),
  },
]

const STORAGE_KEY = '@euro-motors/data-v4'

function getInitialState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Ensure we have kpis in state if migrating from old store
      if (!parsed.kpis) parsed.kpis = DEFAULT_KPI_DEFINITIONS
      return parsed
    }
  } catch {
    /* intentionally ignored */
  }

  return {
    role: null,
    months: MOCK_MONTHS,
    kpis: DEFAULT_KPI_DEFINITIONS,
    actionPlans: [
      {
        id: 'p-1',
        monthId: 'm-5',
        kpiId: 'pecas',
        description: 'Realizar campanha de vendas de lifestyle na recepção.',
        responsible: 'João Silva',
        dueDate: '2026-06-15',
        status: 'Em Andamento',
      },
    ],
  }
}

let state: AppState = getInitialState()

const listeners = new Set<() => void>()

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* intentionally ignored */
  }
  listeners.forEach((l) => l())
}

export const store = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  setRole: (role: AppState['role']) => {
    state = { ...state, role }
    notify()
  },
  saveMonth: (
    data: Omit<
      MonthRecord,
      'id' | 'points' | 'totalScore' | 'categoryScores' | 'criadoPor' | 'atualizadoEm'
    > & { id?: string },
  ) => {
    const { points, categoryScores, totalScore } = processMonthData(data.rawValues, state.kpis)
    const now = new Date().toISOString()

    if (data.id) {
      state = {
        ...state,
        months: state.months.map((m) =>
          m.id === data.id
            ? { ...m, ...data, points, categoryScores, totalScore, atualizadoEm: now }
            : m,
        ),
      }
    } else {
      const newMonth: MonthRecord = {
        ...data,
        id: crypto.randomUUID(),
        points,
        categoryScores,
        totalScore,
        criadoPor: state.role?.toLowerCase() || 'editor',
        atualizadoEm: now,
      }
      state = { ...state, months: [...state.months, newMonth] }
    }
    notify()
  },
  deleteMonth: (id: string) => {
    state = { ...state, months: state.months.filter((m) => m.id !== id) }
    notify()
  },
  saveActionPlan: (plan: Omit<ActionPlan, 'id'> & { id?: string }) => {
    if (plan.id) {
      state = {
        ...state,
        actionPlans: state.actionPlans.map((p) => (p.id === plan.id ? { ...p, ...plan } : p)),
      }
    } else {
      state = {
        ...state,
        actionPlans: [...state.actionPlans, { ...plan, id: crypto.randomUUID() }],
      }
    }
    notify()
  },
  deleteActionPlan: (id: string) => {
    state = { ...state, actionPlans: state.actionPlans.filter((p) => p.id !== id) }
    notify()
  },
  saveKpi: (kpi: KpiDef) => {
    const exists = state.kpis.find((k) => k.id === kpi.id)
    if (exists) {
      state = {
        ...state,
        kpis: state.kpis.map((k) => (k.id === kpi.id ? kpi : k)),
      }
    } else {
      state = { ...state, kpis: [...state.kpis, kpi] }
    }
    notify()
  },
  deleteKpi: (id: string) => {
    state = { ...state, kpis: state.kpis.filter((k) => k.id !== id) }
    notify()
  },
}

export default function useDataStore() {
  const currentState = useSyncExternalStore(store.subscribe, store.getState)
  return { ...currentState, ...store }
}
