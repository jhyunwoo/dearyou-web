migrate((db) => {
  const collection = new Collection({
    "id": "g1j7ndd15o0bomc",
    "created": "2023-05-11 02:20:42.664Z",
    "updated": "2023-05-11 02:20:42.664Z",
    "name": "chats_read",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "yknajafg",
        "name": "chat",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "y7zb7u5mv6m9j8w",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": []
        }
      },
      {
        "system": false,
        "id": "9yhovyiy",
        "name": "unreaduser",
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
        "id": "mysqnnkk",
        "name": "unreadcount",
        "type": "number",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null
        }
      },
      {
        "system": false,
        "id": "pxgaidyq",
        "name": "lastread",
        "type": "date",
        "required": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("g1j7ndd15o0bomc");

  return dao.deleteCollection(collection);
})
