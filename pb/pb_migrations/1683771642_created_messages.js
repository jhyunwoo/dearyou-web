migrate((db) => {
  const collection = new Collection({
    "id": "jnwd6r1vrxtc859",
    "created": "2023-05-11 02:20:42.664Z",
    "updated": "2023-05-11 02:20:42.664Z",
    "name": "messages",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "8q9eb3iv",
        "name": "text",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "r2ki50ez",
        "name": "image",
        "type": "file",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 99,
          "maxSize": 5242880,
          "mimeTypes": [
            "image/png",
            "image/vnd.mozilla.apng",
            "image/jpeg",
            "image/gif",
            "image/webp",
            "image/heic",
            "image/heic-sequence",
            "image/heif",
            "image/heif-sequence"
          ],
          "thumbs": [],
          "protected": false
        }
      },
      {
        "system": false,
        "id": "b0l6naoa",
        "name": "owner",
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
        "id": "xvir7xu8",
        "name": "pdlink",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "m4nsxmydx8j2teo",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": []
        }
      },
      {
        "system": false,
        "id": "k6sszeqm",
        "name": "pdthumblink",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("jnwd6r1vrxtc859");

  return dao.deleteCollection(collection);
})
