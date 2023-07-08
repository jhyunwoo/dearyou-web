import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import pb from "@/lib/pocketbase"
import { usePbAuth } from "@/contexts/AuthWrapper"
import { useRouter } from "next/router"

/** 로그인 되어 있으면 하위 JSX를 보여주고 로그인 되어 있지 않으면 로그인 페이지로 이동하는 링크를 보여줌 */
/** 또한, 로그인은 되어 있으나 학번이 등록되지 않았으면 학번 이름 등록 페이지로 이동*/
export default function ProtectedPage(props) {

  const { user } = usePbAuth()

  const [isProtect, setIsProtect] = useState(false)

  const router = useRouter()

  useEffect(() => {
    async function checkIsProtect() {
      const path = router.asPath
      if (path === "/signin") {
        setIsProtect(false)
      } else {
        setIsProtect(true)
      }
    }
    checkIsProtect()
  }, [router])

  

  if (!isProtect) {
    return <>{props.children}</>
  } else if (!user) {
    /** 로그인이 돼있지 않을 때 */
    return (
      <div className="w-full h-screen bg-slate-50 dark:bg-black p-4 flex justify-center items-center">
        <div className="">
          <Image
            className="mx-auto my-4"
            src="/favicon.png"
            width={100}
            height={100}
            alt="logo"
          />
          <Link
            className="bg-amber-400 hover:bg-amber-500 duration-200 transition text-white dark:text-black font-semibold text-xl p-2 px-6 rounded-full"
            href={"/signin"}
          >
            로그인 페이지
          </Link>
        </div>
      </div>
    )
  } else if (user && user?.isBanned) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center bg-black p-12 fixed top-0 bottom-0 right-0 left-0">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl flex flex-col items-center">
          <div className="text-2xl font-bold p-4">자율위원회</div>
          <div>비정상적 활동으로 계정이 정지 조치 되었습니다.</div>
          <Link
            href={"https://open.kakao.com/o/sGLY1utf"}
            className="p-2 px-4 rounded-lg bg-orange-500 text-white dark:text-black mt-4 w-full text-center font-semibold"
          >
            문의하기
          </Link>
        </div>
      </div>
    )
  } else if (
    !user?.studentId|| !user?.studentId )
  ) {
    /** 학번 정보가 없을 때 */
    return (
      <div className="w-full h-screen bg-slate-50 dark:bg-black flex justify-center items-center p-4">
        <div className="bg-white dark:bg-gray-900 shadow-lg p-4 flex flex-col">
          <div className="text-lg font-bold mx-auto mt-4">
            학번과 이름 등록이 필요합니다 .
          </div>
          <div className="mx-auto my-4">
            <Link
              href={"/profile/add-info"}
              className="bg-amber-400 hover:bg-amber-500 transition duration-200 p-2 px-6 rounded-full text-white dark:text-black font-semibold"
            >
              이동
            </Link>
          </div>
        </div>
      </div>
    )
  } else {
    return <>{props.children}</>
  }
}
