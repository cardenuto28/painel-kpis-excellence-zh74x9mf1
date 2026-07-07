migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('action_plans')
    if (!col.fields.getByName('resultFile')) {
      col.fields.add(
        new FileField({
          name: 'resultFile',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['application/pdf'],
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('action_plans')
    const field = col.fields.getByName('resultFile')
    if (field) col.fields.remove(field)
    app.save(col)
  },
)
