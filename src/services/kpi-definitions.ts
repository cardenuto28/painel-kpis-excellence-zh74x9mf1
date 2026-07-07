import pb from '@/lib/pocketbase/client'
import type { KpiDef } from '@/lib/kpi-definitions'

function parseJson(val: any): any {
  if (val === null || val === undefined) return val
  if (typeof val === 'string') {
    try {
      return JSON.parse(val)
    } catch {
      return val
    }
  }
  return val
}

function mapRecord(record: any): KpiDef {
  return {
    id: record.kpiId,
    name: record.name,
    category: record.category,
    maxPoints: record.maxPoints,
    type: record.type,
    tiers: parseJson(record.tiers) || undefined,
  }
}

export async function getKpiDefinitions(): Promise<KpiDef[]> {
  const records = await pb.collection('kpi_definitions').getFullList({ sort: 'sort_order' })
  return records.map(mapRecord)
}

export async function createKpiDefinition(kpi: KpiDef): Promise<KpiDef> {
  const record = await pb.collection('kpi_definitions').create({
    kpiId: kpi.id,
    name: kpi.name,
    category: kpi.category,
    maxPoints: kpi.maxPoints,
    type: kpi.type,
    tiers: kpi.tiers || [],
    sort_order: 0,
  })
  return mapRecord(record)
}

export async function updateKpiDefinition(kpi: KpiDef): Promise<KpiDef> {
  const existing = await pb.collection('kpi_definitions').getFirstListItem(`kpiId="${kpi.id}"`)
  const record = await pb.collection('kpi_definitions').update(existing.id, {
    name: kpi.name,
    category: kpi.category,
    maxPoints: kpi.maxPoints,
    type: kpi.type,
    tiers: kpi.tiers || [],
  })
  return mapRecord(record)
}

export async function deleteKpiDefinition(kpiId: string): Promise<void> {
  const existing = await pb.collection('kpi_definitions').getFirstListItem(`kpiId="${kpiId}"`)
  await pb.collection('kpi_definitions').delete(existing.id)
}
