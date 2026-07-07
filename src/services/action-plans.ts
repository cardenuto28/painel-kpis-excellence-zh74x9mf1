import pb from '@/lib/pocketbase/client'
import { toDatePickerValue } from '@/lib/utils'

export interface ActionPlan {
  id: string
  monthId: string
  kpiId: string
  description: string
  responsible: string
  dueDate: string
  status: 'Pendente' | 'Em Andamento' | 'Concluído'
  resultFile?: string
}

export function getFileUrl(recordId: string, filename: string): string {
  const baseUrl = import.meta.env.VITE_POCKETBASE_PUBLIC_URL || import.meta.env.VITE_POCKETBASE_URL
  return `${baseUrl}/api/files/action_plans/${recordId}/${filename}`
}

function mapRecord(record: any): ActionPlan {
  return {
    id: record.id,
    monthId: record.monthId || '',
    kpiId: record.kpiId,
    description: record.description,
    responsible: record.responsible,
    dueDate: record.dueDate ? toDatePickerValue(record.dueDate) : '',
    status: record.status,
    resultFile: record.resultFile || '',
  }
}

export async function getActionPlans(): Promise<ActionPlan[]> {
  const records = await pb.collection('action_plans').getFullList({ sort: '-created' })
  return records.map(mapRecord)
}

export async function createActionPlan(data: any): Promise<ActionPlan> {
  const record = await pb.collection('action_plans').create(data)
  return mapRecord(record)
}

export async function updateActionPlan(id: string, data: any): Promise<ActionPlan> {
  const record = await pb.collection('action_plans').update(id, data)
  return mapRecord(record)
}

export async function deleteActionPlan(id: string): Promise<void> {
  await pb.collection('action_plans').delete(id)
}
