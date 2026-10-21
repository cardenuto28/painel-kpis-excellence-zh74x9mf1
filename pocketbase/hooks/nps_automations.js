// Embedding automático para nps_cases ao criar ou atualizar
onRecordAfterCreateSuccess((e) => {
  const comentario = e.record.getString('comentario')
  const obs = e.record.getString('observacao_insatisfacao')
  const text = (comentario + '\n' + obs).trim().slice(0, 2700)
  if (!text) return e.next()

  try {
    const res = $ai.embed({ input: text })
    if (res && res.data && res.data[0] && res.data[0].embedding) {
      const record = $app.findRecordById('nps_cases', e.record.id)
      record.set('embedding', res.data[0].embedding)
      $app.save(record)
    }
  } catch (err) {
    console.log('Erro ao gerar embedding no create nps_cases ' + e.record.id + ': ' + err.message)
  }
  return e.next()
}, 'nps_cases')

onRecordAfterUpdateSuccess((e) => {
  const comentarioChanged =
    e.record.getString('comentario') !== e.record.original().getString('comentario')
  const obsChanged =
    e.record.getString('observacao_insatisfacao') !==
    e.record.original().getString('observacao_insatisfacao')

  // Evitar loop recursivo se texto não mudou
  if (!comentarioChanged && !obsChanged) return e.next()

  const text = (
    e.record.getString('comentario') +
    '\n' +
    e.record.getString('observacao_insatisfacao')
  )
    .trim()
    .slice(0, 2700)
  if (!text) return e.next()

  try {
    const res = $ai.embed({ input: text })
    if (res && res.data && res.data[0] && res.data[0].embedding) {
      const record = $app.findRecordById('nps_cases', e.record.id)
      record.set('embedding', res.data[0].embedding)
      $app.save(record)
    }
  } catch (err) {
    console.log('Erro ao gerar embedding no update nps_cases ' + e.record.id + ': ' + err.message)
  }
  return e.next()
}, 'nps_cases')

// Auto-resolução do caso ao atualizar planos de ação
onRecordAfterUpdateSuccess((e) => {
  try {
    const caseId = e.record.getString('nps_case_id')
    if (!caseId) return e.next()

    // Buscar todos os planos deste caso
    const plans = $app.findRecordsByFilter(
      'nps_action_plans',
      'nps_case_id = {:caseId}',
      '',
      100,
      0,
      {
        caseId: caseId,
      },
    )

    if (plans.length > 0) {
      const allCompleted = plans.every((p) => p.getString('status') === 'Concluído')
      if (allCompleted) {
        const caseRec = $app.findRecordById('nps_cases', caseId)
        if (caseRec.getString('status') !== 'Resolvido') {
          caseRec.set('status', 'Resolvido')
          $app.save(caseRec)
        }
      }
    }
  } catch (err) {
    console.log('Erro na auto-resolução de nps_cases: ' + err.message)
  }
  return e.next()
}, 'nps_action_plans')

onRecordAfterCreateSuccess((e) => {
  // Se for criado já com status de plano Concluído e todos forem concluídos, validar também
  try {
    const caseId = e.record.getString('nps_case_id')
    if (!caseId) return e.next()

    const plans = $app.findRecordsByFilter(
      'nps_action_plans',
      'nps_case_id = {:caseId}',
      '',
      100,
      0,
      {
        caseId: caseId,
      },
    )

    if (plans.length > 0 && plans.every((p) => p.getString('status') === 'Concluído')) {
      const caseRec = $app.findRecordById('nps_cases', caseId)
      if (caseRec.getString('status') !== 'Resolvido') {
        caseRec.set('status', 'Resolvido')
        $app.save(caseRec)
      }
    }
  } catch (err) {
    console.log('Erro na auto-resolução após create de nps_action_plans: ' + err.message)
  }
  return e.next()
}, 'nps_action_plans')
