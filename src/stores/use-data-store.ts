import { useSyncExternalStore } from 'react'
import { processMonthData } from '@/lib/kpi-calculator'

export interface MonthRecord {
  id: string
  mes: string
  ano: number
  ranking: number
  topDealerTotal: number
  rawValues: Record<string, any>
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
  role: 'Editor' | 'Visualizador' | null
  months: MonthRecord[]
  actionPlans: ActionPlan[]
}

const mockRawValuesMar = {
  vendasRetail: 105,
  bev: 100,
  gkl: 100,
  mMpa: 105,
  bps: 90,
  vocVendas: 98,
  pecas: 90,
  videos: 115,
  clientesConectados: 110,
  serviceInclusive: 120,
  teleservice: 105,
  ticketMedio: 90,
  vocPos: 90,
  treinamentos: { vendas: 2, pos: 2, tecnico: 1 },
  retailStandards: 98,
  ferramentasDigitais: true,
  propostaComercial: { alcancado: 40, meta: 30 },
  sfPenetration: 90,
}

const mockRawValuesApr = {
  ...mockRawValuesMar,
  vendasRetail: 95,
  pecas: 98,
  vocVendas: 90,
  serviceInclusive: 96,
  bps: 105,
}

const mockRawValuesMay = {
  ...mockRawValuesMar,
  vendasRetail: 98,
  bev: 105,
  pecas: 90,
  vocPos: 85,
  bps: 100,
  sfPenetration: 102,
}

const MOCK_MONTHS: MonthRecord[] = [
  {
    id: 'm-3',
    mes: 'Março',
    ano: 2026,
    ranking: 4,
    topDealerTotal: 88,
    rawValues: mockRawValuesMar,
    ...processMonthData(mockRawValuesMar),
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
    ...processMonthData(mockRawValuesApr),
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
    ...processMonthData(mockRawValuesMay),
    criadoPor: 'admin',
    atualizadoEm: new Date().toISOString(),
  },
]

const STORAGE_KEY = '@euro-motors/data-v2'

function getInitialState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    /* intentionally ignored */
  }

  return {
    role: null,
    months: MOCK_MONTHS,
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
  setRole: (role: 'Editor' | 'Visualizador' | null) => {
    state = { ...state, role }
    notify()
  },
  saveMonth: (
    data: Omit<
      MonthRecord,
      'id' | 'points' | 'totalScore' | 'categoryScores' | 'criadoPor' | 'atualizadoEm'
    > & { id?: string },
  ) => {
    const { points, categoryScores, totalScore } = processMonthData(data.rawValues)
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
        criadoPor: 'editor@euromotors.com',
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
}

export default function useDataStore() {
  const currentState = useSyncExternalStore(store.subscribe, store.getState)
  return { ...currentState, ...store }
}
