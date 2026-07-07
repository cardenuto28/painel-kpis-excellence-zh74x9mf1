import { z } from 'zod'
import { KpiDef } from '@/lib/kpi-definitions'

export function buildRawValuesSchema(kpis: KpiDef[]) {
  return z.object(
    kpis.reduce(
      (acc, kpi) => {
        if (kpi.type === 'boolean') {
          acc[kpi.id] = z.boolean().default(false)
        } else if (kpi.type === 'treinamentos') {
          acc[kpi.id] = z.object({
            vendas: z.coerce.number().min(0).default(0),
            pos: z.coerce.number().min(0).default(0),
            tecnico: z.coerce.number().min(0).default(0),
          })
        } else if (kpi.type === 'voc') {
          acc[kpi.id] = z.object({
            nps: z.coerce.number().min(0).max(200).default(0),
            failedSubIndicators: z.coerce.number().min(0).max(5).default(0),
          })
        } else {
          acc[kpi.id] = z.coerce.number().min(0).max(1000).default(0)
        }
        return acc
      },
      {} as Record<string, z.ZodTypeAny>,
    ),
  )
}

export function getDefaultRawValues(
  kpis: KpiDef[],
  existing?: Record<string, any>,
): Record<string, any> {
  return kpis.reduce(
    (acc, kpi) => {
      const val = existing?.[kpi.id]
      if (kpi.type === 'boolean') {
        acc[kpi.id] = val ?? false
      } else if (kpi.type === 'treinamentos') {
        acc[kpi.id] = val ?? { vendas: 0, pos: 0, tecnico: 0 }
      } else if (kpi.type === 'voc') {
        acc[kpi.id] = val ?? { nps: 0, failedSubIndicators: 0 }
      } else {
        acc[kpi.id] = val ?? 0
      }
      return acc
    },
    {} as Record<string, any>,
  )
}
