routerAdd(
  'POST',
  '/backend/v1/admin/reset-password',
  (e) => {
    const info = e.requestInfo()
    const authRecord = info.auth

    if (!authRecord) {
      throw new UnauthorizedError('Usuário não autenticado.')
    }

    const requesterRole = authRecord.getString('role')
    const body = info.body || {}
    const targetUserId = body.userId
    const newPassword = body.password

    if (!targetUserId || !newPassword) {
      throw new BadRequestError('ID do usuário e nova senha são obrigatórios.')
    }

    if (newPassword.length < 8) {
      throw new BadRequestError('A nova senha deve ter no mínimo 8 caracteres.')
    }

    // Only Admin can reset another user's password; any user can change their own password
    const isSelf = authRecord.id === targetUserId
    const isAdmin = requesterRole === 'Admin'

    if (!isAdmin && !isSelf) {
      throw new ForbiddenError('Apenas administradores podem alterar a senha de outros usuários.')
    }

    const targetUser = $app.findRecordById('users', targetUserId)
    targetUser.setPassword(newPassword)
    $app.save(targetUser)

    return e.json(200, {
      success: true,
      message: 'Senha atualizada com sucesso.',
      userId: targetUserId,
    })
  },
  $apis.requireAuth(),
)
