migrate(
  (app) => {
    const weeklyStatsCol = app.findCollectionByNameOrId('nps_weekly_stats')
    const casesCol = app.findCollectionByNameOrId('nps_cases')
    const plansCol = app.findCollectionByNameOrId('nps_action_plans')

    // 1. Seed weekly stats se vazio
    const existingStats = app.findRecordsByFilter('nps_weekly_stats', '', '', 1, 0)
    if (existingStats.length === 0) {
      const segments = [
        { brand: 'BMW Auto', department: 'Vendas', nps: 84, responseRate: 48 },
        { brand: 'BMW Auto', department: 'Pós-Vendas', nps: 76, responseRate: 52 },
        { brand: 'BMW Motorrad', department: 'Vendas', nps: 89, responseRate: 45 },
        { brand: 'BMW Motorrad', department: 'Pós-Vendas', nps: 81, responseRate: 39 },
      ]
      const now = new Date().toISOString().slice(0, 10)
      for (const seg of segments) {
        const rec = new Record(weeklyStatsCol)
        rec.set('brand', seg.brand)
        rec.set('department', seg.department)
        rec.set('nps_score', seg.nps)
        rec.set('response_rate', seg.responseRate)
        rec.set('update_date', now)
        app.save(rec)
      }
    }

    // 2. Seed cases se vazio
    const existingCases = app.findRecordsByFilter('nps_cases', '', '', 1, 0)
    if (existingCases.length === 0) {
      const sampleCases = [
        {
          cliente: 'Carlos Eduardo Silveira',
          marca: 'BMW',
          veiculo: 'BMW 320i M Sport',
          data: '2025-02-14',
          departamento: 'Pós-Vendas',
          nota: 4,
          comentario:
            'Demora excessiva na revisão periódica e veículo foi entregue sem a lavagem combinada com o consultor.',
          status: 'Em Tratamento',
          responsavel: 'Marcos Silva',
          observacao_insatisfacao:
            'Cliente esperava prazo de 3h, revisão levou 7h. Foco em alinhar expectativa de tempo de box.',
        },
        {
          cliente: 'Fernanda Albuquerque',
          marca: 'BMW',
          veiculo: 'BMW X1 sDrive20i',
          data: '2025-02-18',
          departamento: 'Vendas',
          nota: 5,
          comentario:
            'Falta de clareza nas opções de financiamento e atraso de 4 dias na entrega técnica do veículo zero km.',
          status: 'Pendente',
          responsavel: 'Patrícia Prado',
          observacao_insatisfacao:
            'Cliente reclamou de atraso na emissão de nota e comunicação falha durante o faturamento.',
        },
        {
          cliente: 'Rodrigo Guimarães',
          marca: 'Motorrad',
          veiculo: 'BMW R 1300 GS',
          data: '2025-02-10',
          departamento: 'Pós-Vendas',
          nota: 3,
          comentario:
            'Peça da suspensão demorou 20 dias para chegar da fábrica e fiquei sem moto para viagem de fim de semana.',
          status: 'Em Tratamento',
          responsavel: 'Lucas Mendes',
          observacao_insatisfacao:
            'Falta de peça no estoque nacional (backorder). Necessário acompanhar pedido em emergência.',
        },
        {
          cliente: 'Juliana Costa e Silva',
          marca: 'Motorrad',
          veiculo: 'BMW F 900 R',
          data: '2025-01-28',
          departamento: 'Vendas',
          nota: 6,
          comentario:
            'Vendedor prometeu brindes de capacete e jaqueta que não estavam disponíveis no momento da entrega.',
          status: 'Resolvido',
          responsavel: 'Renato Faria',
          observacao_insatisfacao:
            'Promessa verbal sem voucher registrado. Entregue kit de pilotagem via correios com pedido de desculpas.',
        },
      ]

      for (const item of sampleCases) {
        const caseRec = new Record(casesCol)
        caseRec.set('cliente', item.cliente)
        caseRec.set('marca', item.marca)
        caseRec.set('veiculo', item.veiculo)
        caseRec.set('data', item.data)
        caseRec.set('departamento', item.departamento)
        caseRec.set('nota', item.nota)
        caseRec.set('comentario', item.comentario)
        caseRec.set('status', item.status)
        caseRec.set('responsavel', item.responsavel)
        caseRec.set('observacao_insatisfacao', item.observacao_insatisfacao)
        app.save(caseRec)

        // Criar plano de ação de exemplo para o caso
        const planRec = new Record(plansCol)
        planRec.set('nps_case_id', caseRec.id)
        if (item.status === 'Resolvido') {
          planRec.set(
            'descricao',
            'Enviar kit oficial Motorrad ao cliente e telefonema de retratação',
          )
          planRec.set('prazo', '2025-02-05')
          planRec.set('status', 'Concluído')
        } else {
          planRec.set('descricao', 'Contato telefônico da gerência e agendamento de cortesia')
          planRec.set('prazo', '2025-03-01')
          planRec.set('status', 'Pendente')
        }
        app.save(planRec)
      }
    }
  },
  (app) => {
    // Revert seeds se necessário
  },
)
