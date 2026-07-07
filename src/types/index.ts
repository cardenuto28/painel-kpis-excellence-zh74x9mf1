export type KPIKey =
  | 'vendasRetail'
  | 'bev'
  | 'gkl'
  | 'mMpa'
  | 'bps'
  | 'vocVendas'
  | 'pecas'
  | 'videos'
  | 'clientesConectados'
  | 'serviceInclusive'
  | 'teleservice'
  | 'ticketMedio'
  | 'vocPos'
  | 'treinamentos'
  | 'retailStandards'
  | 'ferramentasDigitais'
  | 'propostaComercial'
  | 'sfPenetration'

export type CategoryKey = 'vendas' | 'suporte' | 'rede' | 'crm' | 'financeiro'

export interface KPIConfig {
  key: KPIKey
  name: string
  category: CategoryKey
  maxPoints: number
  type: 'percent' | 'number' | 'boolean' | 'score'
}

export interface KPIValue {
  raw: number
  points: number
}

export interface MonthRecord {
  id: string
  mes: string
  ano: number
  ranking: number
  topDealerTotal: number
  items: Record<KPIKey, KPIValue>
  criadoPor: string
  atualizadoEm: string
}

export interface ActionPlan {
  id: string
  monthId: string
  kpiKey: KPIKey
  description: string
  responsible: string
  dueDate: string
  status: 'Pendente' | 'Em Andamento' | 'Concluído'
}
