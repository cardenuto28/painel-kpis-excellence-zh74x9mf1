migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.listRule = '@request.auth.role = "Admin"'
    col.viewRule = '@request.auth.role = "Admin" || id = @request.auth.id'
    col.createRule = ''
    col.updateRule = '@request.auth.role = "Admin" || id = @request.auth.id'
    col.deleteRule = '@request.auth.role = "Admin"'
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.listRule = '@request.auth.role = "Admin"'
    col.viewRule = '@request.auth.role = "Admin" || id = @request.auth.id'
    col.createRule = ''
    col.updateRule = '@request.auth.role = "Admin"'
    col.deleteRule = '@request.auth.role = "Admin"'
    app.save(col)
  },
)
