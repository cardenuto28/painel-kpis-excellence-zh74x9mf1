import pb from '@/lib/pocketbase/client'
import type {
  NpsCase,
  NpsActionPlan,
  NpsWeeklyStat,
  NpsWeeklyBrand,
  NpsDepartment,
} from '@/types/nps'

const API_BASE = import.meta.env.VITE_POCKETBASE_URL

// Casos NPS
export async function getNpsCases(): Promise<NpsCase[]> {
  const records = await pb.collection('nps_cases').getFullList<NpsCase>({
    sort: '-data,-created',
  })
  return records
}

export async function createNpsCase(data: Partial<NpsCase>): Promise<NpsCase> {
  const record = await pb.collection('nps_cases').create<NpsCase>(data)
  return record
}

export async function updateNpsCase(id: string, data: Partial<NpsCase>): Promise<NpsCase> {
  const record = await pb.collection('nps_cases').update<NpsCase>(id, data)
  return record
}

export async function deleteNpsCase(id: string): Promise<boolean> {
  await pb.collection('nps_cases').delete(id)
  return true
}

// Planos de Ação NPS
export async function getNpsActionPlans(caseId?: string): Promise<NpsActionPlan[]> {
  const options: Record<string, any> = { sort: 'prazo,created' }
  if (caseId) {
    options.filter = `nps_case_id = "${caseId}"`
  }
  const records = await pb.collection('nps_action_plans').getFullList<NpsActionPlan>(options)
  return records
}

export async function createNpsActionPlan(data: Partial<NpsActionPlan>): Promise<NpsActionPlan> {
  const record = await pb.collection('nps_action_plans').create<NpsActionPlan>(data)
  return record
}

export async function updateNpsActionPlan(
  id: string,
  data: Partial<NpsActionPlan>,
): Promise<NpsActionPlan> {
  const record = await pb.collection('nps_action_plans').update<NpsActionPlan>(id, data)
  return record
}

export async function deleteNpsActionPlan(id: string): Promise<boolean> {
  await pb.collection('nps_action_plans').delete(id)
  return true
}

// Estatísticas Semanais
export async function getLatestWeeklyStats(): Promise<Record<string, NpsWeeklyStat>> {
  // Buscar todas e agrupar pela mais recente por segmento
  const records = await pb.collection('nps_weekly_stats').getFullList<NpsWeeklyStat>({
    sort: '-update_date,-created',
  })
  const map: Record<string, NpsWeeklyStat> = {}
  for (const item of records) {
    const key = `${item.brand}::${item.department}`
    if (!map[key]) {
      map[key] = item
    }
  }
  return map
}

export async function saveWeeklyStat(data: {
  brand: NpsWeeklyBrand
  department: NpsDepartment
  nps_score: number
  response_rate: number
  update_date?: string
}): Promise<NpsWeeklyStat> {
  // Sempre cria um NOVO registro (histórico preservado)
  const payload = {
    ...data,
    update_date: data.update_date || new Date().toISOString().slice(0, 10),
  }
  const record = await pb.collection('nps_weekly_stats').create<NpsWeeklyStat>(payload)
  return record
}

// IA - Sugestão de Plano de Ação
export async function suggestActionPlan(params: {
  cliente?: string
  marca?: string
  veiculo?: string
  departamento?: string
  nota?: number
  comentario?: string
  observacao?: string
}): Promise<string> {
  const token = pb.authStore.token
  const res = await fetch(`${API_BASE}/backend/v1/nps/suggest-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error('Falha ao gerar sugestão de plano')
  }

  const json = await res.json()
  return json.suggestion || ''
}

// IA - Padrões recorrentes (Casos similares)
export interface SimilarCaseResult {
  id: string
  cliente?: string
  marca?: string
  departamento?: string
  comentario?: string
  nota?: number
  status?: string
  _distance?: number
  score?: number
}

export async function getSimilarCases(params: {
  caseId?: string
  text: string
  departamento?: string
}): Promise<SimilarCaseResult[]> {
  const token = pb.authStore.token
  const res = await fetch(`${API_BASE}/backend/v1/nps/similar-cases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    return []
  }

  const json = await res.json()
  return json.items || []
}

// IA - Lista de conversas do agente
export async function getAgentConversations(): Promise<any[]> {
  const token = pb.authStore.token
  const res = await fetch(`${API_BASE}/backend/v1/nps/agent-conversations`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })
  if (!res.ok) return []
  const json = await res.json()
  return json.items || json || []
}

// IA - Histórico de mensagens
export async function getAgentMessages(conversationId: string): Promise<any[]> {
  const token = pb.authStore.token
  const res = await fetch(`${API_BASE}/backend/v1/nps/agent-messages/${conversationId}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })
  if (!res.ok) return []
  const json = await res.json()
  return json.messages || json || []
}
