import pb from '@/lib/pocketbase/client'

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

function mapRecord(record: any): MonthRecord {
  return {
    id: record.id,
    mes: record.mes,
    ano: record.ano,
    ranking: record.ranking,
    topDealerTotal: record.topDealerTotal,
    rawValues: parseJson(record.rawValues) || {},
    topDealerRawValues: parseJson(record.topDealerRawValues) || {},
    points: parseJson(record.points) || {},
    totalScore: record.totalScore,
    categoryScores: parseJson(record.categoryScores) || {},
    criadoPor: record.criadoPor || '',
    atualizadoEm: record.updated || record.created || new Date().toISOString(),
  }
}

export async function getMonthRecords(): Promise<MonthRecord[]> {
  const records = await pb.collection('month_records').getFullList({ sort: '-ano,-created' })
  return records.map(mapRecord)
}

export async function createMonthRecord(data: any): Promise<MonthRecord> {
  const record = await pb.collection('month_records').create(data)
  return mapRecord(record)
}

export async function updateMonthRecord(id: string, data: any): Promise<MonthRecord> {
  const record = await pb.collection('month_records').update(id, data)
  return mapRecord(record)
}

export async function deleteMonthRecord(id: string): Promise<void> {
  await pb.collection('month_records').delete(id)
}
