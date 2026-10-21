/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // Definir agente nativo NPS para Skip Cloud
    $ai.agents.define(app, {
      slug: 'nps-analyst',
      name: 'Analista de NPS PG Prime',
      description:
        'Especialista em análise de NPS e casos críticos BMW e Motorrad da PG Prime Jundiaí.',
      systemPrompt:
        'Você é o Analista Especialista de NPS da PG Prime (concessionária BMW e BMW Motorrad em Jundiaí). ' +
        'Sua missão é analisar os casos de clientes insatisfeitos e detratores (notas 0 a 6), identificar padrões de insatisfação recorrentes ' +
        'em Vendas e Pós-Vendas, avaliar o progresso dos planos de ação e sugerir melhorias operacionais práticas para a equipe da PG Prime. ' +
        'Sempre responda em Português brasileiro de forma profissional, objetiva e orientada a dados. ' +
        'Consulte os dados das coleções nps_cases, nps_action_plans e nps_weekly_stats quando relevante.',
      tier: 'fast',
      tools: [
        {
          collection: 'nps_cases',
          perms: { list: true, read: true },
          actAs: 'admin',
        },
        {
          collection: 'nps_action_plans',
          perms: { list: true, read: true },
          actAs: 'admin',
        },
        {
          collection: 'nps_weekly_stats',
          perms: { list: true, read: true },
          actAs: 'admin',
        },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text:
              'Diretrizes NPS PG Prime BMW Jundiaí:\n' +
              '- Notas 0 a 6: Casos Críticos (Detratores). Exigem plano de ação imediato e contato com o cliente em até 24 horas.\n' +
              '- Notas 7 e 8: Neutros / Passivos.\n' +
              '- Notas 9 e 10: Promotores.\n' +
              '- Segmentos monitorados: BMW Auto Vendas, BMW Auto Pós-Vendas, BMW Motorrad Vendas, BMW Motorrad Pós-Vendas.\n' +
              '- Meta de NPS corporativa BMW PG Prime: superior a 80 pontos, com taxa de resposta mínima de 40%.\n' +
              '- Status de caso: Pendente -> Em Tratamento -> Resolvido.',
          },
        },
      ],
    })
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'nps-analyst')
    } catch (_) {}
  },
)
