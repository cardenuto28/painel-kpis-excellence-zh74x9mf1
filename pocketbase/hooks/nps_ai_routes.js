// Rotas de IA para o Módulo NPS:
// 1. POST /backend/v1/nps/suggest-plan -> Sugestão automática de plano de ação
// 2. POST /backend/v1/nps/similar-cases -> Busca de casos com comentários parecidos (pattern alert)
// 3. POST /backend/v1/nps/agent-chat-stream -> Chat em streaming com o agente NPS
// 4. GET /backend/v1/nps/agent-conversations -> Lista conversas do agente
// 5. GET /backend/v1/nps/agent-messages/{id} -> Lista mensagens de uma conversa

// 1. Sugestão automática de plano de ação
routerAdd(
  'POST',
  '/backend/v1/nps/suggest-plan',
  (e) => {
    const info = e.requestInfo()
    const body = info.body || {}
    const { cliente, marca, veiculo, departamento, nota, comentario, observacao } = body

    if (!comentario && !observacao) {
      throw new BadRequestError(
        'Comentário ou observação de insatisfação é obrigatório para sugestão de plano.',
      )
    }

    try {
      const prompt =
        'Você é um gerente sênior de experiência do cliente da PG Prime (concessionária BMW e Motorrad em Jundiaí). ' +
        'Gere uma proposta de AÇÃO CORRETIVA objetiva e acionável em uma ou duas frases curtas para reverter a insatisfação do cliente.\n\n' +
        `Dados do caso:\n` +
        `- Cliente: ${cliente || 'Cliente'}\n` +
        `- Marca/Veículo: ${marca || 'BMW'} ${veiculo || ''}\n` +
        `- Departamento: ${departamento || 'Geral'}\n` +
        `- Nota NPS: ${nota ?? 'Detrator'}\n` +
        `- Reclamação: ${comentario || 'Não informado'}\n` +
        `- Observação interna: ${observacao || 'Nenhuma'}\n\n` +
        'Responda APENAS com a descrição direta e concisa da ação proposta, sem introdução ou cumprimentos.'

      const reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você formula planos de ação concisos e práticos para concessionárias premium.',
          },
          { role: 'user', content: prompt },
        ],
      })

      const suggestion = reply.choices[0]?.message?.content?.trim() || ''
      return e.json(200, { suggestion: suggestion })
    } catch (err) {
      // Fallback inteligente se AI gateway oscilar
      const fallback = `Entrar em contato telefônico com ${cliente || 'o cliente'} via gerência de ${departamento || 'atendimento'} para retratação e propor resolução imediata.`
      return e.json(200, { suggestion: fallback, note: 'fallback' })
    }
  },
  $apis.requireAuth(),
)

// 2. Busca de casos similares (Pattern Alert)
routerAdd(
  'POST',
  '/backend/v1/nps/similar-cases',
  (e) => {
    const info = e.requestInfo()
    const body = info.body || {}
    const currentCaseId = body.caseId || ''
    const textToSearch = (body.text || '').trim().slice(0, 2700)

    if (!textToSearch) {
      return e.json(200, { items: [] })
    }

    try {
      const embedRes = $ai.embed({ input: textToSearch })
      const vector = embedRes.data[0]?.embedding
      if (!vector) {
        throw new Error('No embedding returned')
      }

      const results = $vectors.search(e, 'nps_cases', {
        field: 'embedding',
        query: vector,
        k: 8,
      })

      // Filtrar o próprio caso atual se houver e normalizar retorno
      const filtered = (results || [])
        .filter((item) => {
          const id = item.id || item.record?.id
          return id && id !== currentCaseId
        })
        .map((item) => {
          const rec = item.record
          if (rec) {
            return {
              id: rec.id,
              cliente: rec.getString('cliente'),
              marca: rec.getString('marca'),
              veiculo: rec.getString('veiculo'),
              departamento: rec.getString('departamento'),
              comentario: rec.getString('comentario'),
              observacao_insatisfacao: rec.getString('observacao_insatisfacao'),
              data: rec.getString('data'),
              nota: rec.getInt('nota'),
              status: rec.getString('status'),
              _distance: item._distance ?? item.distance ?? 0.2,
            }
          }
          return {
            id: item.id,
            cliente: item.cliente,
            marca: item.marca,
            veiculo: item.veiculo,
            departamento: item.departamento,
            comentario: item.comentario,
            observacao_insatisfacao: item.observacao_insatisfacao,
            data: item.data,
            nota: item.nota,
            status: item.status,
            _distance: item._distance ?? item.distance ?? 0.2,
          }
        })

      if (filtered.length > 0) {
        return e.json(200, { items: filtered.slice(0, 5) })
      }
      throw new Error('Empty vector search results')
    } catch (err) {
      // Fallback semântico / textual inteligente se busca vetorial estiver vazia ou oscilar
      const dept = body.departamento || ''
      let fallbackCases = []
      try {
        if (dept) {
          fallbackCases = $app.findRecordsByFilter(
            'nps_cases',
            'departamento = {:dept}',
            '-created',
            6,
            0,
            {
              dept: dept,
            },
          )
        } else {
          fallbackCases = $app.findRecordsByFilter('nps_cases', '', '-created', 6, 0)
        }
      } catch (_) {}

      const mapped = fallbackCases
        .filter((r) => r.id !== currentCaseId)
        .map((r) => ({
          id: r.id,
          cliente: r.getString('cliente'),
          marca: r.getString('marca'),
          veiculo: r.getString('veiculo'),
          departamento: r.getString('departamento'),
          comentario: r.getString('comentario'),
          observacao_insatisfacao: r.getString('observacao_insatisfacao'),
          data: r.getString('data'),
          nota: r.getInt('nota'),
          status: r.getString('status'),
          _distance: 0.5,
        }))
      return e.json(200, { items: mapped.slice(0, 4) })
    }
  },
  $apis.requireAuth(),
)

// 3. Streaming Chat com o Analista NPS (usando o Agente Nativo Skip Cloud)
routerAdd(
  'POST',
  '/backend/v1/nps/agent-chat-stream',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const userId = e.auth?.id
      if (!userId) return e.unauthorizedError('Autenticação necessária')
      if (!body.message?.trim()) return e.badRequestError('Mensagem obrigatória')

      const conv = $ai.agent('nps-analyst').getOrCreateConversation({
        user_id: userId,
        id: body.conversation_id || null,
        title: body.title || 'Análise de NPS PG Prime',
      })

      const iter = $ai.agent('nps-analyst').chat({
        user_id: userId,
        conversation_id: conv.id,
        message: body.message,
        stream: true,
      })

      e.response.header().set('Content-Type', 'text/event-stream')
      e.response.header().set('Cache-Control', 'no-cache')
      e.response.header().set('X-Conversation-Id', conv.id)
      $response.stream(e, iter)
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'Serviço de IA temporariamente indisponível' })
      }
      if (err instanceof SkipAiAgentsError) {
        const status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'Falha no agente NPS' : err.message })
      }
      if (err instanceof SkipAiError) {
        const status = err.status || 502
        return e.json(status, { error: status >= 500 ? 'Erro de IA' : err.message })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)

// 4. Conversas anteriores do usuário com o agente NPS
routerAdd(
  'GET',
  '/backend/v1/nps/agent-conversations',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')
    const limit = parseInt(e.requestInfo().query?.limit || '20', 10) || 20
    try {
      const res = $ai.agent('nps-analyst').listConversations({ user_id: userId, limit })
      return e.json(200, res)
    } catch (err) {
      return e.json(200, { items: [] })
    }
  },
  $apis.requireAuth(),
)

// 5. Mensagens de uma conversa
routerAdd(
  'GET',
  '/backend/v1/nps/agent-messages/{conversationId}',
  (e) => {
    try {
      const userId = e.auth?.id
      if (!userId) return e.unauthorizedError('Autenticação necessária')
      const conversationId = e.request.pathValue('conversationId')
      const res = $ai.agent('nps-analyst').listMessages({
        conversation_id: conversationId,
        user_id: userId,
      })
      return e.json(200, res)
    } catch (err) {
      if (err instanceof SkipAiAgentsError) {
        const status = err.status || 500
        return e.json(status, { error: err.message })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
