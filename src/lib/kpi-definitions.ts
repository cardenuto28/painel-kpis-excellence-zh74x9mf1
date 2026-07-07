export const KPI_CATEGORIES = [
  'Vendas',
  'Suporte ao Cliente',
  'Desenvolvimento de Rede',
  'CRM',
  'Serviços Financeiros',
] as const

export type KpiCategory = (typeof KPI_CATEGORIES)[number]

export interface KpiTier {
  id: string
  operator: '<' | '<=' | '==' | '>=' | '>'
  value: number
  points: number
}

export interface KpiDef {
  id: string
  name: string
  category: KpiCategory
  maxPoints: number
  type: 'percentage' | 'number' | 'boolean' | 'treinamentos' | 'propostaComercial'
  tiers?: KpiTier[]
}

export const DEFAULT_KPI_DEFINITIONS: KpiDef[] = [
  {
    id: 'vendasRetail',
    name: 'Performance de Vendas BMW (Retail)',
    category: 'Vendas',
    maxPoints: 20,
    type: 'percentage',
    tiers: [
      { id: 't1', operator: '<', value: 95, points: 0 },
      { id: 't2', operator: '==', value: 95, points: 8 },
      { id: 't3', operator: '<', value: 100, points: 10 },
      { id: 't4', operator: '==', value: 100, points: 16 },
      { id: 't5', operator: '>', value: 100, points: 20 },
    ],
  },
  {
    id: 'bev',
    name: 'BEV',
    category: 'Vendas',
    maxPoints: 6,
    type: 'percentage',
    tiers: [
      { id: 't1', operator: '<', value: 100, points: 0 },
      { id: 't2', operator: '==', value: 100, points: 5 },
      { id: 't3', operator: '>', value: 100, points: 6 },
    ],
  },
  {
    id: 'gkl',
    name: 'GKL+',
    category: 'Vendas',
    maxPoints: 6,
    type: 'percentage',
    tiers: [
      { id: 't1', operator: '<', value: 100, points: 0 },
      { id: 't2', operator: '==', value: 100, points: 5 },
      { id: 't3', operator: '>', value: 100, points: 6 },
    ],
  },
  {
    id: 'mMpa',
    name: 'M+MPA',
    category: 'Vendas',
    maxPoints: 6,
    type: 'percentage',
    tiers: [
      { id: 't1', operator: '<', value: 100, points: 0 },
      { id: 't2', operator: '==', value: 100, points: 5 },
      { id: 't3', operator: '>', value: 100, points: 6 },
    ],
  },
  {
    id: 'bps',
    name: 'BMW Premium Selection (BPS)',
    category: 'Vendas',
    maxPoints: 4,
    type: 'percentage',
    tiers: [
      { id: 't1', operator: '<', value: 100, points: 0 },
      { id: 't2', operator: '==', value: 100, points: 3 },
      { id: 't3', operator: '>', value: 100, points: 4 },
    ],
  },
  {
    id: 'vocVendas',
    name: 'VoC Vendas',
    category: 'Vendas',
    maxPoints: 5,
    type: 'number',
    tiers: [
      { id: 't1', operator: '<', value: 93, points: 0 },
      { id: 't2', operator: '<', value: 96, points: 3 },
      { id: 't3', operator: '>=', value: 96, points: 5 },
    ],
  },

  {
    id: 'pecas',
    name: 'Peças, Acessórios e Lifestyle',
    category: 'Suporte ao Cliente',
    maxPoints: 10,
    type: 'percentage',
    tiers: [
      { id: 't1', operator: '<', value: 95, points: 0 },
      { id: 't2', operator: '<', value: 100, points: 3 },
      { id: 't3', operator: '<', value: 110, points: 6 },
      { id: 't4', operator: '>=', value: 110, points: 10 },
    ],
  },
  {
    id: 'videos',
    name: 'Vídeos Visualizados (Share)',
    category: 'Suporte ao Cliente',
    maxPoints: 3,
    type: 'percentage',
    tiers: [
      { id: 't1', operator: '<', value: 95, points: 0 },
      { id: 't2', operator: '<', value: 100, points: 1 },
      { id: 't3', operator: '<', value: 110, points: 2 },
      { id: 't4', operator: '>=', value: 110, points: 3 },
    ],
  },
  {
    id: 'clientesConectados',
    name: 'Clientes Conectados',
    category: 'Suporte ao Cliente',
    maxPoints: 3,
    type: 'percentage',
    tiers: [
      { id: 't1', operator: '<', value: 95, points: 0 },
      { id: 't2', operator: '<', value: 100, points: 1 },
      { id: 't3', operator: '<', value: 110, points: 2 },
      { id: 't4', operator: '>=', value: 110, points: 3 },
    ],
  },
  {
    id: 'serviceInclusive',
    name: 'Service Inclusive',
    category: 'Suporte ao Cliente',
    maxPoints: 5,
    type: 'percentage',
    tiers: [
      { id: 't1', operator: '<', value: 95, points: 0 },
      { id: 't2', operator: '<', value: 100, points: 2 },
      { id: 't3', operator: '<', value: 110, points: 3 },
      { id: 't4', operator: '>=', value: 110, points: 5 },
    ],
  },
  {
    id: 'teleservice',
    name: 'Teleservice',
    category: 'Suporte ao Cliente',
    maxPoints: 5,
    type: 'percentage',
    tiers: [
      { id: 't1', operator: '<', value: 95, points: 0 },
      { id: 't2', operator: '<', value: 100, points: 2 },
      { id: 't3', operator: '>=', value: 100, points: 5 },
    ],
  },
  {
    id: 'ticketMedio',
    name: 'Ticket Médio de Acessórios',
    category: 'Suporte ao Cliente',
    maxPoints: 5,
    type: 'percentage',
    tiers: [
      { id: 't1', operator: '<', value: 95, points: 0 },
      { id: 't2', operator: '<', value: 100, points: 2 },
      { id: 't3', operator: '<', value: 110, points: 3 },
      { id: 't4', operator: '>=', value: 110, points: 5 },
    ],
  },
  {
    id: 'vocPos',
    name: 'VoC Pós-Vendas',
    category: 'Suporte ao Cliente',
    maxPoints: 7,
    type: 'number',
    tiers: [
      { id: 't1', operator: '<', value: 80, points: 0 },
      { id: 't2', operator: '<', value: 87, points: 3 },
      { id: 't3', operator: '>=', value: 87, points: 7 },
    ],
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
    tiers: [
      { id: 't1', operator: '<', value: 75, points: 0 },
      { id: 't2', operator: '<', value: 85, points: 1 },
      { id: 't3', operator: '<', value: 95, points: 2 },
      { id: 't4', operator: '>=', value: 95, points: 3 },
    ],
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
    tiers: [
      { id: 't1', operator: '<', value: 100, points: 0 },
      { id: 't2', operator: '<', value: 110, points: 1 },
      { id: 't3', operator: '>=', value: 110, points: 2 },
    ],
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
