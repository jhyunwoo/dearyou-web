import { usePbAuth } from "@/contexts/AuthWrapper"
import { useRouter } from "next/router"
import Loading from "./Loading"

/** 개발자 전용 페이지 -> 권한 확인 */
export default function ProtectAdmin({ props }) {
  const { user } = usePbAuth()
  const router = useRouter()
  if (user.admin) {
    return <>{props.children}</>
  } else {
    router.replace("/")
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loading />
      </div>
    )
  }
}
