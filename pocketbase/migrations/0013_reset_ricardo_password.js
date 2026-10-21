migrate(
  (app) => {
    const targetEmail = 'ricardo.cardenuto@pgprime.com.br'
    let userRecord

    try {
      userRecord = app.findAuthRecordByEmail('_pb_users_auth_', targetEmail)
    } catch (_) {
      try {
        userRecord = app.findFirstRecordByData('users', 'email', targetEmail)
      } catch (err) {
        console.log('User ricardo.cardenuto@pgprime.com.br not found to reset password:', err)
        return
      }
    }

    if (userRecord) {
      userRecord.setPassword('pgprime123')
      userRecord.setVerified(true)
      userRecord.set('role', 'Admin')
      app.save(userRecord)
      console.log('Password successfully reset to pgprime123 for', targetEmail)
    }
  },
  () => {
    // Revert is a no-op since resetting password backward is undefined
  },
)
