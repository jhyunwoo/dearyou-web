import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import pb from "@/lib/pocketbase"
import { usePbAuth } from "@/contexts/AuthWrapper"

/** 로그인 되어 있으면 하위 JSX를 보여주고 로그인 되어 있지 않으면 로그인 페이지로 이동하는 링크를 보여줌 */
/** 또한, 로그인은 되어 있으나 학번이 등록되지 않았으면 학번 이름 등록 페이지로 이동*/
export default function ProtectedPage(props) {
  const [userInfo, setUserInfo] = useState(null)
  const { user } = usePbAuth()

  useEffect(() => {
    /** 사용자 정보 */
    async function checkUser() {
      if (pb?.authStore?.model?.id) {
        const userData = await pb
          .collection("users")
          .getOne(pb.authStore.model.id)
        setUserInfo(userData)
      }
    }
    checkUser()
  }, [])

  if (!user) {
    /** 로그인이 돼있지 않을 때 */
    return (
      <div className="w-full h-screen bg-slate-50 p-4 flex justify-center items-center">
        <div className="">
          <Image
            className="mx-auto my-4"
            src="/favicon.png"
            width={100}
            height={100}
            alt="logo"
          />
          <Link
            className="bg-amber-400 hover:bg-amber-500 duration-200 transition text-white font-semibold text-xl p-2 px-6 rounded-full"
            href={"/signin"}
          >
            로그인 페이지
          </Link>
        </div>
      </div>
    )
  } else if (userInfo && userInfo?.isBanned) {
    return (
      <div>
        <div>Banned</div>
      </div>
    )
  } else if (
    userInfo &&
    (userInfo?.studentId === 0 || userInfo?.studentId == null)
  ) {
    /** 학번 정보가 없을 때 */
    return (
      <div className="w-full h-screen bg-slate-50 flex justify-center items-center p-4">
        <div className="bg-white shadow-lg p-4 flex flex-col">
          <div className="text-lg font-bold mx-auto mt-4">
            학번과 이름 등록이 필요합니다 .
          </div>
          <div className="mx-auto my-4">
            <Link
              href={"/profile/add-info"}
              className="bg-amber-400 hover:bg-amber-500 transition duration-200 p-2 px-6 rounded-full text-white font-semibold"
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
