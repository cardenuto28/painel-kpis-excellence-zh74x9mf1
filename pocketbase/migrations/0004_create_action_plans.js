migrate(
  (app) => {
    const monthRecordsId = app.findCollectionByNameOrId('month_records').id
    const collection = new Collection({
      name: 'action_plans',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'monthId',
          type: 'relation',
          collectionId: monthRecordsId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'kpiId', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'responsible', type: 'text', required: true },
        { name: 'dueDate', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Pendente', 'Em Andamento', 'Concluído'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_action_plans_monthId ON action_plans (monthId)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('action_plans')
    app.delete(collection)
  },
)
