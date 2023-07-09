/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./worker/index.js":
/*!*************************!*\
  !*** ./worker/index.js ***!
  \*************************/
/***/ (() => {

eval("self.__WB_DISABLE_DEV_LOGS = true;\nself.addEventListener(\"push\", function(event) {\n    const data = JSON.parse(event.data?.text() ?? {\n        title: \"\"\n    });\n    event.waitUntil(self.registration.showNotification(data.title, {\n        body: data.message,\n        icon: \"/images/icons/icon-192x192.png\"\n    }));\n});\nself.addEventListener(\"notificationclick\", function(event) {\n    event.notification.close();\n    event.waitUntil(self.clients.matchAll({\n        type: \"window\",\n        includeUncontrolled: true\n    }).then(function(clientList) {\n        if (clientList.length > 0) {\n            let client = clientList[0];\n            for(let i = 0; i < clientList.length; i++){\n                if (clientList[i].focused) {\n                    client = clientList[i];\n                }\n            }\n            return client.focus();\n        }\n        return self.clients.openWindow(\"/\");\n    }));\n});\n\n\n//# sourceURL=webpack://dearyou-web/./worker/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./worker/index.js"]();
/******/ 	
/******/ })()
;