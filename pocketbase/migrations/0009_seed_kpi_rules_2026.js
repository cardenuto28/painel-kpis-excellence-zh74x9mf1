migrate(
  (app) => {
    const kpiCol = app.findCollectionByNameOrId('kpi_definitions')
    app.truncateCollection(kpiCol)
    try {
      app.truncateCollection(app.findCollectionByNameOrId('month_records'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('action_plans'))
    } catch (_) {}

    var kpis = [
      {
        kpiId: 'vendasRetail',
        name: 'Performance de Vendas BMW (Retail)',
        category: 'Vendas',
        maxPoints: 20,
        type: 'percentage',
        sort_order: 1,
        tiers: [
          { id: 't1', operator: '<', value: 95, points: 0 },
          { id: 't2', operator: '==', value: 95, points: 8 },
          { id: 't3', operator: '<', value: 100, points: 10 },
          { id: 't4', operator: '==', value: 100, points: 16 },
          { id: 't5', operator: '>', value: 100, points: 20 },
        ],
      },
      {
        kpiId: 'bev',
        name: 'BEV',
        category: 'Vendas',
        maxPoints: 6,
        type: 'percentage',
        sort_order: 2,
        tiers: [
          { id: 't1', operator: '<', value: 100, points: 0 },
          { id: 't2', operator: '==', value: 100, points: 5 },
          { id: 't3', operator: '>', value: 100, points: 6 },
        ],
      },
      {
        kpiId: 'gkl',
        name: 'GKL+',
        category: 'Vendas',
        maxPoints: 6,
        type: 'percentage',
        sort_order: 3,
        tiers: [
          { id: 't1', operator: '<', value: 100, points: 0 },
          { id: 't2', operator: '==', value: 100, points: 5 },
          { id: 't3', operator: '>', value: 100, points: 6 },
        ],
      },
      {
        kpiId: 'mMpa',
        name: 'M+MPA',
        category: 'Vendas',
        maxPoints: 6,
        type: 'percentage',
        sort_order: 4,
        tiers: [
          { id: 't1', operator: '<', value: 100, points: 0 },
          { id: 't2', operator: '==', value: 100, points: 5 },
          { id: 't3', operator: '>', value: 100, points: 6 },
        ],
      },
      {
        kpiId: 'bps',
        name: 'BMW Premium Selection (BPS)',
        category: 'Vendas',
        maxPoints: 4,
        type: 'percentage',
        sort_order: 5,
        tiers: [
          { id: 't1', operator: '<', value: 100, points: 0 },
          { id: 't2', operator: '==', value: 100, points: 3 },
          { id: 't3', operator: '>', value: 100, points: 4 },
        ],
      },
      {
        kpiId: 'vocVendas',
        name: 'VoC Vendas',
        category: 'Vendas',
        maxPoints: 5,
        type: 'voc',
        sort_order: 6,
        tiers: [
          { id: 't1', operator: '<', value: 93, points: 0 },
          { id: 't2', operator: '<', value: 96, points: 3 },
          { id: 't3', operator: '>=', value: 96, points: 5 },
        ],
      },
      {
        kpiId: 'pecas',
        name: 'Peças, Acessórios e Lifestyle',
        category: 'Suporte ao Cliente',
        maxPoints: 10,
        type: 'percentage',
        sort_order: 7,
        tiers: [
          { id: 't1', operator: '<', value: 95, points: 0 },
          { id: 't2', operator: '<', value: 100, points: 3 },
          { id: 't3', operator: '<', value: 110, points: 6 },
          { id: 't4', operator: '>=', value: 110, points: 10 },
        ],
      },
      {
        kpiId: 'videos',
        name: 'Vídeos Visualizados (Share)',
        category: 'Suporte ao Cliente',
        maxPoints: 3,
        type: 'percentage',
        sort_order: 8,
        tiers: [
          { id: 't1', operator: '<', value: 95, points: 0 },
          { id: 't2', operator: '<', value: 100, points: 1 },
          { id: 't3', operator: '<', value: 110, points: 2 },
          { id: 't4', operator: '>=', value: 110, points: 3 },
        ],
      },
      {
        kpiId: 'clientesConectados',
        name: 'Clientes Conectados',
        category: 'Suporte ao Cliente',
        maxPoints: 3,
        type: 'percentage',
        sort_order: 9,
        tiers: [
          { id: 't1', operator: '<', value: 95, points: 0 },
          { id: 't2', operator: '<', value: 100, points: 1 },
          { id: 't3', operator: '<', value: 110, points: 2 },
          { id: 't4', operator: '>=', value: 110, points: 3 },
        ],
      },
      {
        kpiId: 'serviceInclusive',
        name: 'Service Inclusive',
        category: 'Suporte ao Cliente',
        maxPoints: 5,
        type: 'percentage',
        sort_order: 10,
        tiers: [
          { id: 't1', operator: '<', value: 95, points: 0 },
          { id: 't2', operator: '<', value: 100, points: 2 },
          { id: 't3', operator: '<', value: 110, points: 3 },
          { id: 't4', operator: '>=', value: 110, points: 5 },
        ],
      },
      {
        kpiId: 'teleservice',
        name: 'Teleservice',
        category: 'Suporte ao Cliente',
        maxPoints: 5,
        type: 'percentage',
        sort_order: 11,
        tiers: [
          { id: 't1', operator: '<', value: 95, points: 0 },
          { id: 't2', operator: '<', value: 100, points: 2 },
          { id: 't3', operator: '>=', value: 100, points: 5 },
        ],
      },
      {
        kpiId: 'ticketMedio',
        name: 'Ticket Médio de Acessórios',
        category: 'Suporte ao Cliente',
        maxPoints: 5,
        type: 'percentage',
        sort_order: 12,
        tiers: [
          { id: 't1', operator: '<', value: 95, points: 0 },
          { id: 't2', operator: '<', value: 100, points: 2 },
          { id: 't3', operator: '<', value: 110, points: 3 },
          { id: 't4', operator: '>=', value: 110, points: 5 },
        ],
      },
      {
        kpiId: 'vocPos',
        name: 'VoC Pós-Vendas',
        category: 'Suporte ao Cliente',
        maxPoints: 7,
        type: 'voc',
        sort_order: 13,
        tiers: [
          { id: 't1', operator: '<', value: 80, points: 0 },
          { id: 't2', operator: '<', value: 87, points: 3 },
          { id: 't3', operator: '>=', value: 87, points: 7 },
        ],
      },
      {
        kpiId: 'treinamentos',
        name: 'Treinamentos',
        category: 'Suporte ao Cliente',
        maxPoints: 5,
        type: 'treinamentos',
        sort_order: 14,
        tiers: [],
      },
      {
        kpiId: 'retailStandards',
        name: 'Retail Standards',
        category: 'Desenvolvimento de Rede',
        maxPoints: 3,
        type: 'percentage',
        sort_order: 15,
        tiers: [
          { id: 't1', operator: '<', value: 75, points: 0 },
          { id: 't2', operator: '<', value: 85, points: 1 },
          { id: 't3', operator: '<', value: 95, points: 2 },
          { id: 't4', operator: '>=', value: 95, points: 3 },
        ],
      },
      {
        kpiId: 'ferramentasDigitais',
        name: 'Ferramentas Digitais',
        category: 'Desenvolvimento de Rede',
        maxPoints: 1,
        type: 'boolean',
        sort_order: 16,
        tiers: [],
      },
      {
        kpiId: 'propostaComercial',
        name: 'BMW Proposta Comercial',
        category: 'CRM',
        maxPoints: 4,
        type: 'percentage',
        sort_order: 17,
        tiers: [
          { id: 't1', operator: '<', value: 2.5, points: 0 },
          { id: 't2', operator: '>=', value: 2.5, points: 4 },
        ],
      },
      {
        kpiId: 'sfPenetration',
        name: 'BMW SF Penetration',
        category: 'Serviços Financeiros',
        maxPoints: 2,
        type: 'percentage',
        sort_order: 18,
        tiers: [
          { id: 't1', operator: '<', value: 100, points: 0 },
          { id: 't2', operator: '<', value: 110, points: 1 },
          { id: 't3', operator: '>=', value: 110, points: 2 },
        ],
      },
    ]

    for (var i = 0; i < kpis.length; i++) {
      var kpi = kpis[i]
      var record = new Record(kpiCol)
      record.set('kpiId', kpi.kpiId)
      record.set('name', kpi.name)
      record.set('category', kpi.category)
      record.set('maxPoints', kpi.maxPoints)
      record.set('type', kpi.type)
      record.set('sort_order', kpi.sort_order)
      record.set('tiers', JSON.stringify(kpi.tiers))
      app.save(record)
    }
  },
  (app) => {
    try {
      app.truncateCollection(app.findCollectionByNameOrId('kpi_definitions'))
    } catch (_) {}
  },
)
