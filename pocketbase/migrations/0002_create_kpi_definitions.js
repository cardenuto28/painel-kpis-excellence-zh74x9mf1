migrate(
  (app) => {
    const collection = new Collection({
      name: 'kpi_definitions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'kpiId', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: [
            'Vendas',
            'Suporte ao Cliente',
            'Desenvolvimento de Rede',
            'CRM',
            'Serviços Financeiros',
          ],
          maxSelect: 1,
        },
        { name: 'maxPoints', type: 'number', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['percentage', 'number', 'boolean', 'treinamentos', 'voc'],
          maxSelect: 1,
        },
        { name: 'tiers', type: 'json' },
        { name: 'sort_order', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_kpi_definitions_kpiId ON kpi_definitions (kpiId)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('kpi_definitions')
    app.delete(collection)
  },
)
