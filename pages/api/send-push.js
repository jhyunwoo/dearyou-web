import webpush from "web-push"

export default async function handler(req, res) {
  if (req.method === "POST") {
    webpush.setVapidDetails(
      `mailto:${process.env.WEB_PUSH_EMAIL}`,
      process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
      process.env.WEB_PUSH_PRIVATE_KEY,
    )
    const requestData = req.body
    let result = []
    for (let i = 0; i < requestData?.users?.length; i++) {
      try {
        await webpush.sendNotification(
          {
            endpoint: requestData.users[i].endpoint,
            keys: {
              p256dh: requestData.users[i].p256dh,
              auth: requestData.users[i].auth,
            },
          },

          JSON.stringify({
            title: requestData.push.title,
            message: requestData.push.content,
            tag: "message-tag",
          }),
        )
      } catch {
        result.push(requestData.users[i].id)
      }
    }
    res.status(200).json({ failed: result })
  } else {
    res.status(500).json({ message: "invalid request" })
  }
}
