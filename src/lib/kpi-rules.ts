import { KPIConfig, KPIKey, CategoryKey, MonthRecord } from '@/types'

export const KPI_CATALOG: KPIConfig[] = [
  {
    key: 'vendasRetail',
    name: 'Performance de Vendas BMW (Retail*)',
    category: 'vendas',
    maxPoints: 20,
    type: 'percent',
  },
  { key: 'bev', name: 'BEV', category: 'vendas', maxPoints: 6, type: 'percent' },
  { key: 'gkl', name: 'GKL+', category: 'vendas', maxPoints: 6, type: 'percent' },
  { key: 'mMpa', name: 'M+MPA', category: 'vendas', maxPoints: 6, type: 'percent' },
  {
    key: 'bps',
    name: 'BMW Premium Selection (BPS)',
    category: 'vendas',
    maxPoints: 4,
    type: 'percent',
  },
  { key: 'vocVendas', name: 'VoC Vendas', category: 'vendas', maxPoints: 5, type: 'score' },

  {
    key: 'pecas',
    name: 'Peças, Acessórios e Lifestyle',
    category: 'suporte',
    maxPoints: 10,
    type: 'percent',
  },
  {
    key: 'videos',
    name: 'Vídeos Visualizados (Share de Vídeo)',
    category: 'suporte',
    maxPoints: 3,
    type: 'percent',
  },
  {
    key: 'clientesConectados',
    name: 'Clientes Conectados',
    category: 'suporte',
    maxPoints: 3,
    type: 'percent',
  },
  {
    key: 'serviceInclusive',
    name: 'Service Inclusive',
    category: 'suporte',
    maxPoints: 5,
    type: 'percent',
  },
  { key: 'teleservice', name: 'Teleservice', category: 'suporte', maxPoints: 5, type: 'percent' },
  {
    key: 'ticketMedio',
    name: 'Ticket Médio de Acessórios Puros',
    category: 'suporte',
    maxPoints: 5,
    type: 'percent',
  },
  { key: 'vocPos', name: 'VoC Pós-Vendas', category: 'suporte', maxPoints: 7, type: 'score' },
  { key: 'treinamentos', name: 'Treinamentos', category: 'suporte', maxPoints: 5, type: 'number' },

  {
    key: 'retailStandards',
    name: 'Retail Standards',
    category: 'rede',
    maxPoints: 3,
    type: 'percent',
  },
  {
    key: 'ferramentasDigitais',
    name: 'Ferramentas Digitais',
    category: 'rede',
    maxPoints: 1,
    type: 'boolean',
  },

  {
    key: 'propostaComercial',
    name: 'BMW Proposta Comercial',
    category: 'crm',
    maxPoints: 4,
    type: 'percent',
  },

  {
    key: 'sfPenetration',
    name: 'BMW SF Penetration',
    category: 'financeiro',
    maxPoints: 2,
    type: 'percent',
  },
]

export const CATEGORIES: Record<CategoryKey, { name: string; max: number }> = {
  vendas: { name: 'Vendas', max: 47 },
  suporte: { name: 'Suporte ao Cliente', max: 43 },
  rede: { name: 'Desenvolvimento de Rede', max: 4 },
  crm: { name: 'CRM', max: 4 },
  financeiro: { name: 'Serviços Financeiros', max: 2 },
}

export function calculatePoints(key: KPIKey, raw: number): number {
  switch (key) {
    case 'vendasRetail':
      if (raw < 95) return 0
      if (raw === 95) return 8
      if (raw > 95 && raw < 100) return 10
      if (raw === 100) return 16
      return 20
    case 'bev':
    case 'gkl':
    case 'mMpa':
      if (raw < 100) return 0
      if (raw === 100) return 5
      return 6
    case 'bps':
      if (raw < 100) return 0
      if (raw === 100) return 3
      return 4
    case 'vocVendas':
      if (raw < 93) return 0
      if (raw >= 93 && raw < 96) return 3
      return 5

    case 'pecas':
      if (raw < 95) return 0
      if (raw >= 95 && raw < 100) return 3
      if (raw >= 100 && raw < 110) return 6
      return 10
    case 'videos':
    case 'clientesConectados':
      if (raw < 95) return 0
      if (raw >= 95 && raw < 100) return 1
      if (raw >= 100 && raw < 110) return 2
      return 3
    case 'serviceInclusive':
      if (raw < 95) return 0
      if (raw >= 95 && raw < 100) return 2
      if (raw >= 100 && raw < 110) return 3
      return 5
    case 'teleservice':
      if (raw < 95) return 0
      if (raw >= 95 && raw < 100) return 2
      return 5
    case 'ticketMedio':
      if (raw < 95) return 0
      if (raw >= 95 && raw < 100) return 2
      if (raw >= 100 && raw < 110) return 3
      return 5
    case 'vocPos':
      if (raw < 80) return 0
      if (raw >= 80 && raw < 87) return 3
      return 7
    case 'treinamentos':
      if (raw === 0) return 0
      if (raw === 1) return 1
      if (raw === 2) return 2
      if (raw === 3) return 3
      if (raw === 4) return 4
      return 5

    case 'retailStandards':
      if (raw < 75) return 0
      if (raw >= 75 && raw < 85) return 1
      if (raw >= 85 && raw < 95) return 2
      return 3
    case 'ferramentasDigitais':
      return raw ? 1 : 0

    case 'propostaComercial':
      if (raw < 30) return 0
      return 4

    case 'sfPenetration':
      if (raw < 100) return 0
      if (raw >= 100 && raw < 110) return 1
      return 2

    default:
      return 0
  }
}

export function getTotalPoints(month: MonthRecord): number {
  return Object.values(month.items).reduce((acc, curr) => acc + (curr?.points || 0), 0)
}

export function getCategoryPoints(month: MonthRecord, cat: CategoryKey): number {
  const kpis = KPI_CATALOG.filter((k) => k.category === cat).map((k) => k.key)
  return kpis.reduce((acc, key) => acc + (month.items[key]?.points || 0), 0)
}
