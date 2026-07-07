import { KpiDef, KPI_CATEGORIES } from '@/lib/kpi-definitions'

export function calculateKpiPoints(kpi: KpiDef, val: any): number {
  if (kpi.type === 'treinamentos') {
    const v = val || { vendas: 0, pos: 0, tecnico: 0 }
    const total = Number(v.vendas) + Number(v.pos) + Number(v.tecnico)
    return Math.max(0, Math.min(total, 5))
  }

  if (kpi.type === 'boolean') {
    return val ? kpi.maxPoints : 0
  }

  if (kpi.type === 'voc') {
    const v = val || { nps: 0, failedSubIndicators: 0 }
    let basePoints = 0
    if (kpi.tiers && kpi.tiers.length > 0) {
      for (const tier of kpi.tiers) {
        if (tier.operator === '<' && v.nps < tier.value) {
          basePoints = tier.points
          break
        }
        if (tier.operator === '<=' && v.nps <= tier.value) {
          basePoints = tier.points
          break
        }
        if (tier.operator === '==' && v.nps === tier.value) {
          basePoints = tier.points
          break
        }
        if (tier.operator === '>=' && v.nps >= tier.value) {
          basePoints = tier.points
          break
        }
        if (tier.operator === '>' && v.nps > tier.value) {
          basePoints = tier.points
          break
        }
      }
    }
    const deducted = basePoints - (v.failedSubIndicators || 0) * 5
    return Math.max(0, deducted)
  }

  const v = Number(val) || 0

  if (kpi.tiers && kpi.tiers.length > 0) {
    for (const tier of kpi.tiers) {
      if (tier.operator === '<' && v < tier.value) return tier.points
      if (tier.operator === '<=' && v <= tier.value) return tier.points
      if (tier.operator === '==' && v === tier.value) return tier.points
      if (tier.operator === '>=' && v >= tier.value) return tier.points
      if (tier.operator === '>' && v > tier.value) return tier.points
    }
  }

  return 0
}

export function processMonthData(rawValues: Record<string, any>, kpis: KpiDef[]) {
  const points: Record<string, number> = {}
  const categoryScores: Record<string, number> = {}
  let totalScore = 0

  KPI_CATEGORIES.forEach((c) => {
    categoryScores[c] = 0
  })

  kpis.forEach((def) => {
    let val = rawValues[def.id]
    if (val === undefined) {
      if (def.type === 'boolean') val = false
      else if (def.type === 'treinamentos') val = { vendas: 0, pos: 0, tecnico: 0 }
      else if (def.type === 'voc') val = { nps: 0, failedSubIndicators: 0 }
      else val = 0
    }

    const pts = calculateKpiPoints(def, val)
    points[def.id] = pts
    if (categoryScores[def.category] !== undefined) {
      categoryScores[def.category] += pts
    }
    totalScore += pts
  })

  return { points, categoryScores, totalScore }
}
