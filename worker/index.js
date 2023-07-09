self.__WB_DISABLE_DEV_LOGS = true

self.addEventListener("push", function (event) {
  const data = JSON.parse(event.data?.text() ?? { title: "" })
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: "/images/icons/icon-192x192.png",
    }),
  )
})

self.addEventListener("notificationclick", function (event) {
  event.notification.close()
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        if (clientList.length > 0) {
          let client = clientList[0]
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i]
            }
          }
          return client.focus()
        }
        return self.clients.openWindow("/")
      }),
  )
})

export {}
