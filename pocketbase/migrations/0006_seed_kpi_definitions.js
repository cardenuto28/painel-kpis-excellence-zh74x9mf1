migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('kpi_definitions')

    const kpis = [
      {
        kpiId: 'vendas_volume',
        name: 'Volume de Vendas de Veículos Novos',
        category: 'Vendas',
        maxPoints: 10,
        type: 'number',
        sort_order: 1,
      },
      {
        kpiId: 'vendas_mix',
        name: 'Mix de Produtos',
        category: 'Vendas',
        maxPoints: 8,
        type: 'percentage',
        sort_order: 2,
      },
      {
        kpiId: 'vendas_leads',
        name: 'Conversao de Leads',
        category: 'Vendas',
        maxPoints: 8,
        type: 'percentage',
        sort_order: 3,
      },
      {
        kpiId: 'vendas_usados',
        name: 'Vendas de Veiculos Usados',
        category: 'Vendas',
        maxPoints: 6,
        type: 'number',
        sort_order: 4,
      },
      {
        kpiId: 'suporte_csi',
        name: 'Satisfacao do Cliente (CSI)',
        category: 'Suporte ao Cliente',
        maxPoints: 10,
        type: 'percentage',
        sort_order: 5,
      },
      {
        kpiId: 'suporte_resposta',
        name: 'Tempo de Resposta',
        category: 'Suporte ao Cliente',
        maxPoints: 6,
        type: 'percentage',
        sort_order: 6,
      },
      {
        kpiId: 'suporte_retencao',
        name: 'Retencao de Clientes',
        category: 'Suporte ao Cliente',
        maxPoints: 8,
        type: 'percentage',
        sort_order: 7,
      },
      {
        kpiId: 'suporte_reclamacoes',
        name: 'Reclamacoes Resolvidas',
        category: 'Suporte ao Cliente',
        maxPoints: 6,
        type: 'percentage',
        sort_order: 8,
      },
      {
        kpiId: 'rede_treinamento',
        name: 'Treinamento de Equipe',
        category: 'Desenvolvimento de Rede',
        maxPoints: 8,
        type: 'treinamentos',
        sort_order: 9,
      },
      {
        kpiId: 'rede_certificacoes',
        name: 'Certificacoes Tecnicas',
        category: 'Desenvolvimento de Rede',
        maxPoints: 6,
        type: 'number',
        sort_order: 10,
      },
      {
        kpiId: 'rede_investimento',
        name: 'Investimento em Instalacoes',
        category: 'Desenvolvimento de Rede',
        maxPoints: 6,
        type: 'percentage',
        sort_order: 11,
      },
      {
        kpiId: 'rede_digital',
        name: 'Digitalizacao de Processos',
        category: 'Desenvolvimento de Rede',
        maxPoints: 6,
        type: 'percentage',
        sort_order: 12,
      },
      {
        kpiId: 'crm_cadastro',
        name: 'Cadastro de Clientes',
        category: 'CRM',
        maxPoints: 6,
        type: 'percentage',
        sort_order: 13,
      },
      {
        kpiId: 'crm_followup',
        name: 'Follow-up de Vendas',
        category: 'CRM',
        maxPoints: 8,
        type: 'percentage',
        sort_order: 14,
      },
      {
        kpiId: 'crm_campanhas',
        name: 'Campanhas de Marketing',
        category: 'CRM',
        maxPoints: 6,
        type: 'number',
        sort_order: 15,
      },
      {
        kpiId: 'crm_retencao',
        name: 'Taxa de Retencao',
        category: 'CRM',
        maxPoints: 8,
        type: 'percentage',
        sort_order: 16,
      },
      {
        kpiId: 'fin_financiamento',
        name: 'Penetracao de Financiamento',
        category: 'Serviços Financeiros',
        maxPoints: 8,
        type: 'percentage',
        sort_order: 17,
      },
      {
        kpiId: 'fin_seguros',
        name: 'Seguros',
        category: 'Serviços Financeiros',
        maxPoints: 6,
        type: 'percentage',
        sort_order: 18,
      },
      {
        kpiId: 'fin_produtos',
        name: 'Produtos Financeiros',
        category: 'Serviços Financeiros',
        maxPoints: 6,
        type: 'percentage',
        sort_order: 19,
      },
      {
        kpiId: 'fin_prazo',
        name: 'Prazo Medio de Recebimento',
        category: 'Serviços Financeiros',
        maxPoints: 4,
        type: 'number',
        sort_order: 20,
      },
    ]

    for (const kpi of kpis) {
      try {
        app.findFirstRecordByData('kpi_definitions', 'kpiId', kpi.kpiId)
      } catch (_) {
        const record = new Record(col)
        record.set('kpiId', kpi.kpiId)
        record.set('name', kpi.name)
        record.set('category', kpi.category)
        record.set('maxPoints', kpi.maxPoints)
        record.set('type', kpi.type)
        record.set('sort_order', kpi.sort_order)
        record.set('tiers', JSON.stringify([]))
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('kpi_definitions')
      app.truncateCollection(col)
    } catch (_) {}
  },
)
