import pb from "@/lib/pocketbase"
import axios from "axios"

export default async function sendPush(userId, pushTitle, pushContent) {
  const pushUserInfo = await pb
    .collection("pushInfos")
    .getFullList({ filter: `user="${userId}"` })
  if (pushUserInfo.length === 0) return
  axios.post("/api/send-push", {
    users: pushUser,
    push: { title: pushTitle, content: pushContent },
  })
}
