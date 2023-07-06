import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import pb from "@/lib/pocketbase"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import { usePbAuth } from "@/contexts/AuthWrapper"
import ProtectedPage from "@/components/ProtectedPage"
import ChatHistory from "@/components/ChatHistory"
import DeveloperPage from "@/components/DeveloperPage"

export default function Chat() {
  const { user } = usePbAuth()
  const router = useRouter()
  const chatId = router.query["chatId"]

  // pb에서 가져온 chat 관련 데이터 저장하는 state
  const [chatRecord, setChatRecord] = useState(null)

  // pb에서 받아온 chat 관련 데이터 저장하는 state
  const [userMe, setUserMe] = useState() // 나 ID, 이름 저장
  const [userOther, setUserOther] = useState() // 상대방 ID, 이름 저장

  // 로딩 중 상태 여부 저장하는 state
  const [isLoading, setIsLoading] = useState(false)

  // ref
  const chatInput = useRef() // 채팅 텍스트 input을 ref
  const imgRef = useRef() // 이미지 input을 ref

  /* ********************************** */
  /*  초기 데이터 로딩&실시간 로딩 처리   */
  /* ********************************** */

  /** 처음 페이지 로딩할 때 subChatRecord 호출 */
  useEffect(() => {
    if (!router.isReady) return
    // pb에서 Chat Record 실시간으로 가져오도록 subscribe
    getInitChatRecord()
  }, [router.isReady])

  /* 채팅 관련 정보 subscribe (useEffect로 처음에 호출) */
  async function getInitChatRecord() {
    setIsLoading(true)
    const record = await getChatRecord()

    // UserMe, UserOther 저장
    const buyer = record?.expand.buyer
    const seller = record?.expand.seller
    setUserMe(buyer?.id === user?.id ? buyer : seller)
    setUserOther(buyer?.id === user.id ? seller : buyer)
    setIsLoading(false)
    return
  }

  /* Chats 콜렉션에서 데이터 가져옴 (useEffect로 호출) */
  async function getChatRecord() {
    if (!chatId) return
    let record = null
    try {
      record = await pb.collection("chats").getOne(chatId, {
        expand: "seller,buyer,messages,messages.owner,read",
      })
      setChatRecord(record)
    } catch {}
    return record
  }

  if (chatRecord == null) {
    // 접속할 수 없는 or 존재하지 않는 chatId일 경우
    return (
      <ProtectedPage>
        <DeveloperPage>
          <div className="w-full min-h-screen bg-slate-50 flex justify-center items-center">
            <div className="text-base">
              {isLoading
                ? "정보를 불러오는 중입니다..."
                : "존재하지 않는 채팅입니다."}
            </div>
          </div>
        </DeveloperPage>
      </ProtectedPage>
    )
  } else {
    return (
      <ProtectedPage>
        <DeveloperPage>
          <div className="w-full min-h-screen bg-slate-50">
            <ChatHistory
              parseTime={false}
              chatRecord={chatRecord}
              userMe={userMe}
              userOther={userOther}
            />
            <div className="flex p-2 px-4 items-center fixed top-0 right-0 left-0 bg-white">
              <Link href={"/devpage/chats-log"}>
                <ArrowLeftIcon className=" w-8 h-8 bg-amber-400 text-white p-2 rounded-full" />
              </Link>
              <h3 className="text-xl font-semibold ml-4 text-blue-500">
                채팅 로그 조회 중
              </h3>
            </div>
          </div>

          <div className="flex items-center fixed bottom-2 right-0 left-0">
            <h3 className="font-semibold flex w-screen">
              <div className="mx-auto text-center">
                <div>
                  ◀ {userOther.name}({userOther.studentId})
                </div>
                <div className="text-xs">id: {userOther.id}</div>
              </div>
              <div className="mx-auto">-</div>
              <div className="mx-auto text-center">
                <div>
                  {userMe.name}({userMe.studentId}) ▶
                </div>
                <div className="text-xs">id: {userOther.id}</div>
              </div>
            </h3>
          </div>
        </DeveloperPage>
      </ProtectedPage>
    )
  }
}
