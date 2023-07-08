import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import pb from "@/lib/pocketbase"
import { usePbAuth } from "@/contexts/AuthWrapper"
import Loading from "@/components/Loading"

export default function SignIn() {
  const { setUserData, kakaoSignIn } = usePbAuth()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const localAuthProvider = JSON.parse(localStorage.getItem("provider"))
    const params = new URL(location.href).searchParams
    const redirectUrl = `${location.origin}/signin`
    const code = params.get("code")

    const storeUserAndRedirect = (user) => {
      setUserData(user)
      router.replace("/")
    }

    // 리다이렉트 되지 않으면 로그인 취소
    if (
      !localAuthProvider ||
      !code ||
      localAuthProvider.state !== params.get("state")
    )
      return
    setIsLoading(true)
    pb.collection("users")
      .authWithOAuth2Code(
        localAuthProvider.name,
        code,
        localAuthProvider.codeVerifier,
        redirectUrl,
        {
          emailVisibility: false,
        },
        { $autoCancel: false },
      )
      .then(async (response) => {
        const user = await pb.collection("users").getOne(response.record.id)
        storeUserAndRedirect(user)
      })
    setIsLoading(false)
  }, [])

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-black p-4 flex justify-center items-center">
      {isLoading ? <Loading /> : ""}
      <div className="bg-white dark:bg-gray-900 max-w-xl shadow-xl p-8 py-16 flex flex-col w-5/6 space-y-2 ">
        <div className="text-3xl font-bold mx-auto m-4">로그인</div>
        <button
          onClick={kakaoSignIn}
          className="bg-[#ffe812] shadow-lg  p-2 px-4 rounded-lg  transition duration-200 flex justify-center items-center"
        >
          <Image
            src={"/kakao-logo.png"}
            className=""
            width={25}
            height={25}
            alt={"logo"}
          />
          <div className="ml-4 font-semibold text-base text-white dark:text-black">
            카카오로 로그인
          </div>
        </button>
      </div>
    </div>
  )
}
