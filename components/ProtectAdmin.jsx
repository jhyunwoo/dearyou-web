import { usePbAuth } from "@/contexts/AuthWrapper"
import Link from "next/link"

/** 개발자 전용 페이지 -> 권한 확인 */
export default function ProtectAdmin(props) {
  const { user } = usePbAuth()

  if (user?.admin) {
    return <>{props?.children}</>
  } else {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="bg-white p-4 sm:p-8 px-8 sm:px-16 rounded-lg shadow-xl flex flex-col items-center">
          <div className="text-4xl mb-4 font-extrabold text-red-600">
            WARNING!
          </div>
          <div className="text-xl font-semibold">올바르지 않은 접근</div>
          <Link
            href={"/"}
            className="p-2 text-lg font-semibold px-4 rounded-lg text-center bg-amber-400 text-white mt-4 hover:bg-amber-500 transition duration-200"
          >
            Home
          </Link>
        </div>
      </div>
    )
  }
}
