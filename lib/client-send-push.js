import pb from "@/lib/pocketbase"
import axios from "axios"

/** 사용자에게 Push Notification을 보내는 함수 (userId:사용자 아이디, pushTitle: 알림 제목, pushContent: 알림 내용) */
export default async function sendPush(userId, pushTitle, pushContent) {
  const pushUserInfo = await pb
    .collection("pushInfos")
    .getFullList({ filter: `user="${userId}"` })
  if (pushUserInfo.length === 0) return
  axios.post("/api/send-push", {
    users: pushUserInfo,
    push: { title: pushTitle, content: pushContent },
  })
}
