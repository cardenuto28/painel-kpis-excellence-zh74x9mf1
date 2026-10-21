migrate(
  (app) => {
    // 1. nps_cases
    const npsCases = new Collection({
      name: 'nps_cases',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'Admin' || @request.auth.role = 'Editor'",
      updateRule: "@request.auth.role = 'Admin' || @request.auth.role = 'Editor'",
      deleteRule: "@request.auth.role = 'Admin'",
      fields: [
        { name: 'cliente', type: 'text', required: true },
        {
          name: 'marca',
          type: 'select',
          required: true,
          values: ['BMW', 'Motorrad'],
          maxSelect: 1,
        },
        { name: 'veiculo', type: 'text' },
        { name: 'data', type: 'date', required: true },
        {
          name: 'departamento',
          type: 'select',
          required: true,
          values: ['Vendas', 'Pós-Vendas'],
          maxSelect: 1,
        },
        { name: 'nota', type: 'number', required: false, min: 0, max: 10 },
        { name: 'comentario', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Pendente', 'Em Tratamento', 'Resolvido'],
          maxSelect: 1,
        },
        { name: 'responsavel', type: 'text' },
        { name: 'observacao_insatisfacao', type: 'text' },
        { name: 'embedding', type: 'vector', dimensions: 1536, distance: 'cosine' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_nps_cases_status ON nps_cases (status)',
        'CREATE INDEX idx_nps_cases_data ON nps_cases (data)',
        'CREATE INDEX idx_nps_cases_departamento ON nps_cases (departamento)',
        'CREATE INDEX idx_nps_cases_marca ON nps_cases (marca)',
      ],
    })
    app.save(npsCases)

    // 2. nps_action_plans
    const casesId = app.findCollectionByNameOrId('nps_cases').id
    const npsPlans = new Collection({
      name: 'nps_action_plans',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'Admin' || @request.auth.role = 'Editor'",
      updateRule: "@request.auth.role = 'Admin' || @request.auth.role = 'Editor'",
      deleteRule: "@request.auth.role = 'Admin' || @request.auth.role = 'Editor'",
      fields: [
        {
          name: 'nps_case_id',
          type: 'relation',
          required: true,
          collectionId: casesId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'descricao', type: 'text', required: true },
        { name: 'prazo', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Pendente', 'Concluído'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_nps_action_plans_case ON nps_action_plans (nps_case_id)'],
    })
    app.save(npsPlans)

    // 3. nps_weekly_stats
    const weeklyStats = new Collection({
      name: 'nps_weekly_stats',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'Admin' || @request.auth.role = 'Editor'",
      updateRule: "@request.auth.role = 'Admin' || @request.auth.role = 'Editor'",
      deleteRule: "@request.auth.role = 'Admin'",
      fields: [
        {
          name: 'brand',
          type: 'select',
          required: true,
          values: ['BMW Auto', 'BMW Motorrad'],
          maxSelect: 1,
        },
        {
          name: 'department',
          type: 'select',
          required: true,
          values: ['Vendas', 'Pós-Vendas'],
          maxSelect: 1,
        },
        { name: 'nps_score', type: 'number', required: true },
        { name: 'response_rate', type: 'number', required: true },
        { name: 'update_date', type: 'date', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_nps_weekly_stats_lookup ON nps_weekly_stats (brand, department, update_date)',
      ],
    })
    app.save(weeklyStats)
  },
  (app) => {
    try {
      const plans = app.findCollectionByNameOrId('nps_action_plans')
      app.delete(plans)
    } catch (_) {}
    try {
      const stats = app.findCollectionByNameOrId('nps_weekly_stats')
      app.delete(stats)
    } catch (_) {}
    try {
      const cases = app.findCollectionByNameOrId('nps_cases')
      app.delete(cases)
    } catch (_) {}
  },
)
