import pb from "@/lib/pocketbase"
import { useRouter } from "next/router"

/** 에러 로그를 받으면 서버로 전송 */
export default async function errorTransmission(errorLog) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter()
  try {
    const userId = pb.authStore.model?.id
    const data = {
      userAgent: navigator.userAgent,
      userAgentData: navigator.userAgentData,
      errorMessage: errorLog,
      path: router.asPath,
    }
    if (userId) {
      data.user = userId
    }
    await pb.collection("errors").create(data)
  } catch (e) {
    alert("서버 오류! 관리자 또는 각 반 자율위원에게 신고바랍니다.")
  }
}
