import { KpiId, KPI_DEFINITIONS, KPI_CATEGORIES } from '@/lib/kpi-definitions'

export function calculateKpiPoints(id: KpiId, val: number | boolean): number {
  if (typeof val === 'boolean') {
    if (id === 'ferramentasDigitais') return val ? 1 : 0
    return 0
  }

  const v = Number(val) || 0

  switch (id) {
    case 'vendasRetail':
      if (v < 95) return 0
      if (v >= 95 && v < 100) return v === 95 ? 8 : 10
      return v === 100 ? 16 : 20
    case 'bev':
    case 'gkl':
    case 'mMpa':
      if (v < 100) return 0
      return v === 100 ? 5 : 6
    case 'bps':
      if (v < 100) return 0
      return v === 100 ? 3 : 4
    case 'vocVendas':
      if (v < 93) return 0
      if (v >= 93 && v < 96) return 3
      return 5
    case 'pecas':
      if (v < 95) return 0
      if (v >= 95 && v < 100) return 3
      if (v >= 100 && v < 110) return 6
      return 10
    case 'videos':
    case 'clientesConectados':
      if (v < 95) return 0
      if (v >= 95 && v < 100) return 1
      if (v >= 100 && v < 110) return 2
      return 3
    case 'serviceInclusive':
    case 'ticketMedio':
      if (v < 95) return 0
      if (v >= 95 && v < 100) return 2
      if (v >= 100 && v < 110) return 3
      return 5
    case 'teleservice':
      if (v < 95) return 0
      if (v >= 95 && v < 100) return 2
      return 5
    case 'vocPos':
      if (v < 80) return 0
      if (v >= 80 && v < 87) return 3
      return 7
    case 'treinamentos':
      return Math.max(0, Math.min(Math.floor(v), 5))
    case 'retailStandards':
      if (v < 75) return 0
      if (v >= 75 && v < 85) return 1
      if (v >= 85 && v < 95) return 2
      return 3
    case 'propostaComercial':
      return v < 30 ? 0 : 4
    case 'sfPenetration':
      if (v < 100) return 0
      if (v >= 100 && v < 110) return 1
      return 2
    default:
      return 0
  }
}

export function processMonthData(rawValues: Record<string, number | boolean>) {
  const points: Record<string, number> = {}
  const categoryScores: Record<string, number> = {}
  let totalScore = 0

  KPI_CATEGORIES.forEach((c) => {
    categoryScores[c] = 0
  })

  KPI_DEFINITIONS.forEach((def) => {
    const val = rawValues[def.id] ?? (def.type === 'boolean' ? false : 0)
    const pts = calculateKpiPoints(def.id, val)
    points[def.id] = pts
    categoryScores[def.category] += pts
    totalScore += pts
  })

  return { points, categoryScores, totalScore }
}
