migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.listRule = '@request.auth.role = "Admin"'
    col.viewRule = '@request.auth.role = "Admin" || id = @request.auth.id'
    col.createRule = ''
    col.updateRule = '@request.auth.role = "Admin"'
    col.deleteRule = '@request.auth.role = "Admin"'
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.listRule = 'id = @request.auth.id'
    col.viewRule = 'id = @request.auth.id'
    col.createRule = ''
    col.updateRule = 'id = @request.auth.id'
    col.deleteRule = 'id = @request.auth.id'
    app.save(col)
  },
)
