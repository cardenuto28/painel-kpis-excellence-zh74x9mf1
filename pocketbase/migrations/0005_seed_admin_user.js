migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'ricardo@grupoeuromotors.com.br')
      return
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('ricardo@grupoeuromotors.com.br')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Ricardo')
    record.set('role', 'Admin')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'ricardo@grupoeuromotors.com.br')
      app.delete(record)
    } catch (_) {}
  },
)
