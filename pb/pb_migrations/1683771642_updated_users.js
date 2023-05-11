migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.listRule = ""
  collection.viewRule = ""
  collection.updateRule = ""
  collection.deleteRule = null
  collection.options = {
    "allowEmailAuth": true,
    "allowOAuth2Auth": true,
    "allowUsernameAuth": false,
    "exceptEmailDomains": null,
    "manageRule": null,
    "minPasswordLength": 8,
    "onlyEmailDomains": null,
    "requireEmail": false
  }
  collection.indexes = [
    "CREATE INDEX `__pb_users_auth__created_idx` ON `users` (`created`)",
    "CREATE UNIQUE INDEX `idx_unique_aiilz7pr` ON `users` (`studentId`)"
  ]

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "aiilz7pr",
    "name": "studentId",
    "type": "number",
    "required": false,
    "unique": false,
    "options": {
      "min": 210100,
      "max": 231299
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mv1za8wu",
    "name": "wishes",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "m4nsxmydx8j2teo",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": []
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.listRule = null
  collection.viewRule = null
  collection.updateRule = null
  collection.deleteRule = "id = @request.auth.id"
  collection.options = {
    "allowEmailAuth": true,
    "allowOAuth2Auth": true,
    "allowUsernameAuth": true,
    "exceptEmailDomains": null,
    "manageRule": null,
    "minPasswordLength": 8,
    "onlyEmailDomains": null,
    "requireEmail": false
  }
  collection.indexes = []

  // remove
  collection.schema.removeField("aiilz7pr")

  // remove
  collection.schema.removeField("mv1za8wu")

  return dao.saveCollection(collection)
})
