export const KPI_CATEGORIES = [
  'Vendas',
  'Suporte ao Cliente',
  'Desenvolvimento de Rede',
  'CRM',
  'Serviços Financeiros',
] as const

export type KpiCategory = (typeof KPI_CATEGORIES)[number]

export type KpiId =
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

export interface KpiDef {
  id: KpiId
  name: string
  category: KpiCategory
  maxPoints: number
  type: 'percentage' | 'number' | 'boolean' | 'treinamentos' | 'propostaComercial'
}

export const KPI_DEFINITIONS: KpiDef[] = [
  {
    id: 'vendasRetail',
    name: 'Performance de Vendas BMW (Retail)',
    category: 'Vendas',
    maxPoints: 20,
    type: 'percentage',
  },
  { id: 'bev', name: 'BEV', category: 'Vendas', maxPoints: 6, type: 'percentage' },
  { id: 'gkl', name: 'GKL+', category: 'Vendas', maxPoints: 6, type: 'percentage' },
  { id: 'mMpa', name: 'M+MPA', category: 'Vendas', maxPoints: 6, type: 'percentage' },
  {
    id: 'bps',
    name: 'BMW Premium Selection (BPS)',
    category: 'Vendas',
    maxPoints: 4,
    type: 'percentage',
  },
  { id: 'vocVendas', name: 'VoC Vendas', category: 'Vendas', maxPoints: 5, type: 'number' },

  {
    id: 'pecas',
    name: 'Peças, Acessórios e Lifestyle',
    category: 'Suporte ao Cliente',
    maxPoints: 10,
    type: 'percentage',
  },
  {
    id: 'videos',
    name: 'Vídeos Visualizados (Share)',
    category: 'Suporte ao Cliente',
    maxPoints: 3,
    type: 'percentage',
  },
  {
    id: 'clientesConectados',
    name: 'Clientes Conectados',
    category: 'Suporte ao Cliente',
    maxPoints: 3,
    type: 'percentage',
  },
  {
    id: 'serviceInclusive',
    name: 'Service Inclusive',
    category: 'Suporte ao Cliente',
    maxPoints: 5,
    type: 'percentage',
  },
  {
    id: 'teleservice',
    name: 'Teleservice',
    category: 'Suporte ao Cliente',
    maxPoints: 5,
    type: 'percentage',
  },
  {
    id: 'ticketMedio',
    name: 'Ticket Médio de Acessórios',
    category: 'Suporte ao Cliente',
    maxPoints: 5,
    type: 'percentage',
  },
  {
    id: 'vocPos',
    name: 'VoC Pós-Vendas',
    category: 'Suporte ao Cliente',
    maxPoints: 7,
    type: 'number',
  },
  {
    id: 'treinamentos',
    name: 'Treinamentos',
    category: 'Suporte ao Cliente',
    maxPoints: 5,
    type: 'treinamentos',
  },

  {
    id: 'retailStandards',
    name: 'Retail Standards',
    category: 'Desenvolvimento de Rede',
    maxPoints: 3,
    type: 'percentage',
  },
  {
    id: 'ferramentasDigitais',
    name: 'Ferramentas Digitais',
    category: 'Desenvolvimento de Rede',
    maxPoints: 1,
    type: 'boolean',
  },

  {
    id: 'propostaComercial',
    name: 'BMW Proposta Comercial',
    category: 'CRM',
    maxPoints: 4,
    type: 'propostaComercial',
  },

  {
    id: 'sfPenetration',
    name: 'BMW SF Penetration',
    category: 'Serviços Financeiros',
    maxPoints: 2,
    type: 'percentage',
  },
]

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]
