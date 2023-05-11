migrate((db) => {
  const collection = new Collection({
    "id": "y7zb7u5mv6m9j8w",
    "created": "2023-05-11 02:20:42.664Z",
    "updated": "2023-05-11 02:20:42.664Z",
    "name": "chats",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "t9hkm37i",
        "name": "read",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "g1j7ndd15o0bomc",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": []
        }
      },
      {
        "system": false,
        "id": "81tvmyji",
        "name": "seller",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": []
        }
      },
      {
        "system": false,
        "id": "ctxsgjii",
        "name": "buyer",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": []
        }
      },
      {
        "system": false,
        "id": "2gwui9w1",
        "name": "messages",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "jnwd6r1vrxtc859",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": null,
          "displayFields": []
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `_y7zb7u5mv6m9j8w_created_idx` ON `chats` (`created`)"
    ],
    "listRule": "@request.auth.id = seller.id || @request.auth.id = buyer.id",
    "viewRule": "@request.auth.id = seller.id || @request.auth.id = buyer.id",
    "createRule": "@request.auth.id = seller.id || @request.auth.id = buyer.id",
    "updateRule": "@request.auth.id = seller.id || @request.auth.id = buyer.id",
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("y7zb7u5mv6m9j8w");

  return dao.deleteCollection(collection);
})
