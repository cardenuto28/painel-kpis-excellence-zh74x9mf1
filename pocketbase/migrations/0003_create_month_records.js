migrate(
  (app) => {
    const collection = new Collection({
      name: 'month_records',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'mes', type: 'text', required: true },
        { name: 'ano', type: 'number', required: true, onlyInt: true },
        { name: 'ranking', type: 'number', required: true, onlyInt: true },
        { name: 'topDealerTotal', type: 'number', required: true },
        { name: 'rawValues', type: 'json' },
        { name: 'topDealerRawValues', type: 'json' },
        { name: 'points', type: 'json' },
        { name: 'totalScore', type: 'number', required: true },
        { name: 'categoryScores', type: 'json' },
        { name: 'criadoPor', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_month_records_ano_mes ON month_records (ano, mes)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('month_records')
    app.delete(collection)
  },
)
