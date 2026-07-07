migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('month_records')
    const apCol = app.findCollectionByNameOrId('action_plans')

    function addMonth(data) {
      try {
        app.findFirstRecordByData('month_records', 'mes', data.mes)
        return app.findFirstRecordByData('month_records', 'mes', data.mes)
      } catch (_) {}
      var record = new Record(col)
      record.set('mes', data.mes)
      record.set('ano', data.ano)
      record.set('ranking', data.ranking)
      record.set('topDealerTotal', data.topDealerTotal)
      record.set('rawValues', JSON.stringify(data.rawValues))
      record.set('topDealerRawValues', JSON.stringify(data.topDealerRawValues))
      record.set('totalScore', 0)
      record.set('criadoPor', 'ricardo@grupoeuromotors.com.br')
      app.save(record)
      return record
    }

    var rawMar = {
      vendasRetail: 105,
      bev: 100,
      gkl: 100,
      mMpa: 105,
      bps: 90,
      vocVendas: { nps: 98, failedSubIndicators: 0 },
      pecas: 90,
      videos: 115,
      clientesConectados: 110,
      serviceInclusive: 120,
      teleservice: 105,
      ticketMedio: 90,
      vocPos: { nps: 90, failedSubIndicators: 0 },
      treinamentos: { vendas: 2, pos: 2, tecnico: 1 },
      retailStandards: 98,
      ferramentasDigitais: true,
      propostaComercial: 55.1,
      sfPenetration: 90,
    }
    var tdMar = {
      vendasRetail: 126,
      bev: 200,
      gkl: 200,
      mMpa: 167,
      bps: 185,
      vocVendas: { nps: 100, failedSubIndicators: 0 },
      pecas: 197,
      videos: 263,
      clientesConectados: 268,
      serviceInclusive: 303,
      teleservice: 175,
      ticketMedio: 258,
      vocPos: { nps: 100, failedSubIndicators: 0 },
      treinamentos: { vendas: 5, pos: 5, tecnico: 5 },
      retailStandards: 100,
      ferramentasDigitais: false,
      propostaComercial: 100,
      sfPenetration: 193,
    }
    var rawApr = {
      vendasRetail: 95,
      bev: 100,
      gkl: 100,
      mMpa: 105,
      bps: 105,
      vocVendas: { nps: 90, failedSubIndicators: 1 },
      pecas: 98,
      videos: 115,
      clientesConectados: 110,
      serviceInclusive: 96,
      teleservice: 105,
      ticketMedio: 90,
      vocPos: { nps: 90, failedSubIndicators: 0 },
      treinamentos: { vendas: 2, pos: 2, tecnico: 1 },
      retailStandards: 98,
      ferramentasDigitais: true,
      propostaComercial: 55.1,
      sfPenetration: 90,
    }
    var tdApr = {
      vendasRetail: 124,
      bev: 200,
      gkl: 200,
      mMpa: 200,
      bps: 225,
      vocVendas: { nps: 100, failedSubIndicators: 0 },
      pecas: 155,
      videos: 263,
      clientesConectados: 268,
      serviceInclusive: 337,
      teleservice: 175,
      ticketMedio: 258,
      vocPos: { nps: 100, failedSubIndicators: 0 },
      treinamentos: { vendas: 5, pos: 5, tecnico: 5 },
      retailStandards: 100,
      ferramentasDigitais: false,
      propostaComercial: 100,
      sfPenetration: 193,
    }
    var rawMay = {
      vendasRetail: 98,
      bev: 105,
      gkl: 100,
      mMpa: 105,
      bps: 100,
      vocVendas: { nps: 98, failedSubIndicators: 0 },
      pecas: 90,
      videos: 115,
      clientesConectados: 110,
      serviceInclusive: 120,
      teleservice: 105,
      ticketMedio: 90,
      vocPos: { nps: 85, failedSubIndicators: 0 },
      treinamentos: { vendas: 2, pos: 2, tecnico: 1 },
      retailStandards: 98,
      ferramentasDigitais: true,
      propostaComercial: 55.1,
      sfPenetration: 102,
    }
    var tdMay = {
      vendasRetail: 122,
      bev: 200,
      gkl: 200,
      mMpa: 200,
      bps: 185,
      vocVendas: { nps: 100, failedSubIndicators: 0 },
      pecas: 153,
      videos: 263,
      clientesConectados: 268,
      serviceInclusive: 292,
      teleservice: 175,
      ticketMedio: 258,
      vocPos: { nps: 100, failedSubIndicators: 0 },
      treinamentos: { vendas: 5, pos: 5, tecnico: 5 },
      retailStandards: 100,
      ferramentasDigitais: false,
      propostaComercial: 100,
      sfPenetration: 221,
    }

    var marRecord = addMonth({
      mes: 'Março',
      ano: 2026,
      ranking: 4,
      topDealerTotal: 88,
      rawValues: rawMar,
      topDealerRawValues: tdMar,
    })
    addMonth({
      mes: 'Abril',
      ano: 2026,
      ranking: 6,
      topDealerTotal: 85,
      rawValues: rawApr,
      topDealerRawValues: tdApr,
    })
    var mayRecord = addMonth({
      mes: 'Maio',
      ano: 2026,
      ranking: 5,
      topDealerTotal: 84,
      rawValues: rawMay,
      topDealerRawValues: tdMay,
    })

    try {
      app.findFirstRecordByData(
        'action_plans',
        'description',
        'Realizar campanha de vendas de lifestyle na recepção.',
      )
    } catch (_) {
      var plan = new Record(apCol)
      plan.set('monthId', mayRecord.id)
      plan.set('kpiId', 'pecas')
      plan.set('description', 'Realizar campanha de vendas de lifestyle na recepção.')
      plan.set('responsible', 'João Silva')
      plan.set('dueDate', '2026-06-15 00:00:00.000Z')
      plan.set('status', 'Em Andamento')
      app.save(plan)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('month_records')
      app.truncateCollection(col)
    } catch (_) {}
    try {
      const col = app.findCollectionByNameOrId('action_plans')
      app.truncateCollection(col)
    } catch (_) {}
  },
)
