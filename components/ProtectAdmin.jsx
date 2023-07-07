import { usePbAuth } from "@/contexts/AuthWrapper"
import { useRouter } from "next/router"

/** 개발자 전용 페이지 -> 권한 확인 */
export default function ProtectAdmin() {
  const { user } = usePbAuth()
  const router = useRouter()
  if (!user.admin) {
    router.replace("/")
  }
  return <></>
}
