import pb from '@/lib/pocketbase/client'

export interface ActionPlan {
  id: string
  monthId: string
  kpiId: string
  description: string
  responsible: string
  dueDate: string
  status: 'Pendente' | 'Em Andamento' | 'Concluído'
}

function mapRecord(record: any): ActionPlan {
  return {
    id: record.id,
    monthId: record.monthId || '',
    kpiId: record.kpiId,
    description: record.description,
    responsible: record.responsible,
    dueDate: record.dueDate,
    status: record.status,
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
