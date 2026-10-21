export type NpsBrand = 'BMW' | 'Motorrad'
export type NpsWeeklyBrand = 'BMW Auto' | 'BMW Motorrad'
export type NpsDepartment = 'Vendas' | 'Pós-Vendas'
export type NpsCaseStatus = 'Pendente' | 'Em Tratamento' | 'Resolvido'
export type NpsActionPlanStatus = 'Pendente' | 'Concluído'

export interface NpsCase {
  id: string
  cliente: string
  marca: NpsBrand
  veiculo?: string
  data: string
  departamento: NpsDepartment
  nota: number
  comentario?: string
  status: NpsCaseStatus
  responsavel?: string
  observacao_insatisfacao?: string
  created: string
  updated: string
  // expand
  actionPlans?: NpsActionPlan[]
}

export interface NpsActionPlan {
  id: string
  nps_case_id: string
  descricao: string
  prazo: string
  status: NpsActionPlanStatus
  created: string
  updated: string
}

export interface NpsWeeklyStat {
  id: string
  brand: NpsWeeklyBrand
  department: NpsDepartment
  nps_score: number
  response_rate: number
  update_date: string
  created: string
  updated: string
}

export interface NpsKpiSummary {
  totalCritical: number
  detractorsCount: number // nota <= 6
  pendingCount: number
  resolvedCount: number
  resolutionRate: number // %
  avgResolutionDays: number
  withoutPlansCount?: number // Casos críticos sem plano de ação
}
