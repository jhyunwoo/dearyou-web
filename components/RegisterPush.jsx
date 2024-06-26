import errorTransmission from "@/lib/errorTransmission"
import pb from "@/lib/pocketbase"
import { isNoti, modalState } from "@/lib/recoil"
import { BellIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSetRecoilState } from "recoil"
import { useRecoilState } from "recoil"
import Loading from "./Loading"

export default function RegisterPush() {
  const [noti, setNoti] = useRecoilState(isNoti)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const setModal = useSetRecoilState(modalState)

  async function pushInfo(subscription) {
    try {
      setIsLoading(true)
      if (pb.authStore.model?.id) {
        const jsonPushInfo = JSON.stringify(subscription)
        const pushInfo = JSON.parse(jsonPushInfo)
        const data = {
          endpoint: pushInfo.endpoint,
          expirationTime: pushInfo.expirationTime,
          auth: pushInfo.keys.auth,
          p256dh: pushInfo.keys.p256dh,
          user: pb.authStore.model.id,
        }

        try {
          await pb.collection("pushInfos").create(data)
          window.localStorage.setItem("pushInfo", "true")
          setModal("알림이 등록되었습니다.")
          setNoti(true)
        } catch {
          window.localStorage.setItem("pushInfo", "true")
          setModal("이미 등록된 기기입니다.")
          setNoti(true)
        }
      }
      setIsLoading(false)
    } catch (e) {
      setIsLoading(false)
      errorTransmission(e)
    }
  }

  function isIOS() {
    const agent = navigator.userAgent.toLowerCase()
    return (
      agent.includes("iphone") ||
      agent.includes("ipad") ||
      agent.includes("ipod") ||
      agent.includes("macintosh")
    )
  }

  async function register() {
    try {
      setIsLoading(true)
      const result = await window.Notification.requestPermission()
      if (result === "denied") {
        setModal("알림이 거부됨")
        return
      } else {
        navigator.serviceWorker.ready.then((registration) => {
          registration.pushManager
            .getSubscription()
            .then(async (subscription) => {
              if (subscription) {
                pushInfo(subscription)
              } else {
                registration.pushManager
                  .subscribe({
                    userVisibleOnly: true,
                    applicationServerKey:
                      process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
                  })
                  .then(async (subscription) => {
                    pushInfo(subscription)
                  })
              }
            })
        })
      }
      setIsLoading(false)
    } catch (e) {
      setIsLoading(false)
      errorTransmission(e)
    }
  }

  useEffect(() => {
    if (isIOS() && !("standalone" in window.navigator)) {
      window.localStorage.setItem("pushInfo", "true")
      setNoti(true)
    } else {
      try {
        if (Notification?.permission === "granted") {
          setNoti(true)
        } else {
          setNoti(false)
        }
      } catch {
        setNoti(false)
      }
    }
  }, [router, setNoti])

  return (
    <div className="">
      {isLoading ? <Loading /> : ""}
      {!noti ? (
        <button
          onClick={register}
          className="p-1 px-4 bg-amber-400 hover:bg-amber-500 transition duration-200 text-white dark:text-black flex items-center justify-center rounded-full"
        >
          <BellIcon className="w-6 h-6" />
          <div className="font-semibold">알림 등록</div>
        </button>
      ) : (
        ""
      )}
    </div>
  )
}
