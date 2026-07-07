migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('month_records')
    var actionCol = app.findCollectionByNameOrId('action_plans')

    var allKpis = app.findRecordsByFilter('kpi_definitions', "id != ''", 'sort_order', 100, 0)

    var months = [
      {
        mes: 'Janeiro',
        ano: 2026,
        ranking: 4,
        topDealerTotal: 92,
        points: {
          vendasRetail: 16,
          bev: 5,
          gkl: 5,
          mMpa: 5,
          bps: 3,
          vocVendas: 3,
          pecas: 6,
          videos: 2,
          clientesConectados: 2,
          serviceInclusive: 3,
          teleservice: 5,
          ticketMedio: 3,
          vocPos: 3,
          treinamentos: 4,
          retailStandards: 2,
          ferramentasDigitais: 1,
          propostaComercial: 4,
          sfPenetration: 1,
        },
        topDealerRawValues: {
          vendasRetail: 20,
          bev: 5,
          gkl: 5,
          mMpa: 5,
          bps: 4,
          vocVendas: 5,
          pecas: 10,
          videos: 3,
          clientesConectados: 3,
          serviceInclusive: 5,
          teleservice: 5,
          ticketMedio: 3,
          vocPos: 7,
          treinamentos: 5,
          retailStandards: 2,
          ferramentasDigitais: 1,
          propostaComercial: 4,
          sfPenetration: 0,
        },
        criadoPor: 'ricardo@grupoeuromotors.com.br',
      },
      {
        mes: 'Fevereiro',
        ano: 2026,
        ranking: 3,
        topDealerTotal: 94,
        points: {
          vendasRetail: 16,
          bev: 6,
          gkl: 5,
          mMpa: 5,
          bps: 4,
          vocVendas: 4,
          pecas: 10,
          videos: 2,
          clientesConectados: 2,
          serviceInclusive: 3,
          teleservice: 5,
          ticketMedio: 3,
          vocPos: 3,
          treinamentos: 5,
          retailStandards: 2,
          ferramentasDigitais: 1,
          propostaComercial: 4,
          sfPenetration: 2,
        },
        topDealerRawValues: {
          vendasRetail: 20,
          bev: 6,
          gkl: 6,
          mMpa: 5,
          bps: 4,
          vocVendas: 5,
          pecas: 10,
          videos: 3,
          clientesConectados: 3,
          serviceInclusive: 5,
          teleservice: 5,
          ticketMedio: 3,
          vocPos: 7,
          treinamentos: 5,
          retailStandards: 2,
          ferramentasDigitais: 1,
          propostaComercial: 4,
          sfPenetration: 0,
        },
        criadoPor: 'ricardo@grupoeuromotors.com.br',
      },
      {
        mes: 'Marco',
        ano: 2026,
        ranking: 5,
        topDealerTotal: 95,
        points: {
          vendasRetail: 16,
          bev: 5,
          gkl: 5,
          mMpa: 0,
          bps: 3,
          vocVendas: 3,
          pecas: 6,
          videos: 2,
          clientesConectados: 2,
          serviceInclusive: 3,
          teleservice: 5,
          ticketMedio: 3,
          vocPos: 3,
          treinamentos: 4,
          retailStandards: 2,
          ferramentasDigitais: 1,
          propostaComercial: 4,
          sfPenetration: 1,
        },
        topDealerRawValues: {
          vendasRetail: 20,
          bev: 6,
          gkl: 6,
          mMpa: 6,
          bps: 4,
          vocVendas: 5,
          pecas: 10,
          videos: 3,
          clientesConectados: 3,
          serviceInclusive: 5,
          teleservice: 5,
          ticketMedio: 3,
          vocPos: 7,
          treinamentos: 5,
          retailStandards: 2,
          ferramentasDigitais: 1,
          propostaComercial: 2,
          sfPenetration: 2,
        },
        criadoPor: 'ricardo@grupoeuromotors.com.br',
      },
      {
        mes: 'Abril',
        ano: 2026,
        ranking: 2,
        topDealerTotal: 93,
        points: {
          vendasRetail: 20,
          bev: 6,
          gkl: 6,
          mMpa: 6,
          bps: 4,
          vocVendas: 5,
          pecas: 10,
          videos: 2,
          clientesConectados: 2,
          serviceInclusive: 3,
          teleservice: 5,
          ticketMedio: 3,
          vocPos: 3,
          treinamentos: 5,
          retailStandards: 2,
          ferramentasDigitais: 1,
          propostaComercial: 0,
          sfPenetration: 2,
        },
        topDealerRawValues: {
          vendasRetail: 20,
          bev: 6,
          gkl: 6,
          mMpa: 5,
          bps: 4,
          vocVendas: 5,
          pecas: 10,
          videos: 2,
          clientesConectados: 3,
          serviceInclusive: 5,
          teleservice: 5,
          ticketMedio: 3,
          vocPos: 7,
          treinamentos: 5,
          retailStandards: 2,
          ferramentasDigitais: 1,
          propostaComercial: 4,
          sfPenetration: 0,
        },
        criadoPor: 'ricardo@grupoeuromotors.com.br',
      },
      {
        mes: 'Maio',
        ano: 2026,
        ranking: 3,
        topDealerTotal: 91,
        points: {
          vendasRetail: 16,
          bev: 6,
          gkl: 5,
          mMpa: 5,
          bps: 4,
          vocVendas: 5,
          pecas: 10,
          videos: 2,
          clientesConectados: 2,
          serviceInclusive: 3,
          teleservice: 5,
          ticketMedio: 3,
          vocPos: 3,
          treinamentos: 5,
          retailStandards: 2,
          ferramentasDigitais: 1,
          propostaComercial: 0,
          sfPenetration: 2,
        },
        topDealerRawValues: {
          vendasRetail: 20,
          bev: 5,
          gkl: 5,
          mMpa: 5,
          bps: 4,
          vocVendas: 5,
          pecas: 10,
          videos: 3,
          clientesConectados: 3,
          serviceInclusive: 5,
          teleservice: 5,
          ticketMedio: 3,
          vocPos: 7,
          treinamentos: 5,
          retailStandards: 2,
          ferramentasDigitais: 1,
          propostaComercial: 2,
          sfPenetration: 1,
        },
        criadoPor: 'ricardo@grupoeuromotors.com.br',
      },
    ]

    var createdMonthIds = {}

    for (var i = 0; i < months.length; i++) {
      var m = months[i]

      try {
        var existing = app.findFirstRecordByData('month_records', 'mes', m.mes)
        createdMonthIds[m.mes] = existing.id
        continue
      } catch (_) {}

      var totalScore = 0
      var categoryScores = {}

      for (var j = 0; j < allKpis.length; j++) {
        var kpiId = allKpis[j].getString('kpiId')
        var category = allKpis[j].getString('category')
        var pts = m.points[kpiId] || 0
        totalScore += pts
        if (!categoryScores[category]) categoryScores[category] = 0
        categoryScores[category] += pts
      }

      var record = new Record(col)
      record.set('mes', m.mes)
      record.set('ano', m.ano)
      record.set('ranking', m.ranking)
      record.set('topDealerTotal', m.topDealerTotal)
      record.set('rawValues', JSON.stringify(m.points))
      record.set('topDealerRawValues', JSON.stringify(m.topDealerRawValues))
      record.set('points', JSON.stringify(m.points))
      record.set('totalScore', totalScore)
      record.set('categoryScores', JSON.stringify(categoryScores))
      record.set('criadoPor', m.criadoPor)
      app.save(record)
      createdMonthIds[m.mes] = record.id
    }

    var plans = [
      {
        mesKey: 'Janeiro',
        kpiId: 'vocVendas',
        description: 'Implementar programa de follow-up pos-venda para melhorar NPS de vendas.',
        responsible: 'Carlos Silva',
        dueDate: '2026-03-15',
        status: 'Concluído',
      },
      {
        mesKey: 'Janeiro',
        kpiId: 'bev',
        description: 'Capacitar equipe sobre veiculos eletricos BMW e estrategias de venda BEV.',
        responsible: 'Ana Costa',
        dueDate: '2026-04-30',
        status: 'Em Andamento',
      },
      {
        mesKey: 'Marco',
        kpiId: 'mMpa',
        description: 'Revisar estrategia de M+MPA e criar plano de recuperacao de vendas.',
        responsible: 'Roberto Alves',
        dueDate: '2026-05-15',
        status: 'Pendente',
      },
      {
        mesKey: 'Marco',
        kpiId: 'vocPos',
        description: 'Treinar equipe de pos-vendas em tecnicas de atendimento ao cliente.',
        responsible: 'Marina Santos',
        dueDate: '2026-06-01',
        status: 'Em Andamento',
      },
      {
        mesKey: 'Maio',
        kpiId: 'propostaComercial',
        description: 'Aumentar penetracao da BMW Proposta Comercial acima de 2.5%.',
        responsible: 'Felipe Rocha',
        dueDate: '2026-07-15',
        status: 'Pendente',
      },
    ]

    for (var k = 0; k < plans.length; k++) {
      var p = plans[k]
      var monthId = createdMonthIds[p.mesKey]
      if (!monthId) continue

      try {
        app.findFirstRecordByData('action_plans', 'kpiId', p.kpiId)
        continue
      } catch (_) {}

      var plan = new Record(actionCol)
      plan.set('monthId', monthId)
      plan.set('kpiId', p.kpiId)
      plan.set('description', p.description)
      plan.set('responsible', p.responsible)
      plan.set('dueDate', p.dueDate)
      plan.set('status', p.status)
      app.save(plan)
    }
  },
  (app) => {
    try {
      app.truncateCollection(app.findCollectionByNameOrId('month_records'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('action_plans'))
    } catch (_) {}
  },
)
