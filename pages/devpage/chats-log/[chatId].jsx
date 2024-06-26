import { useEffect, useState, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useInView } from "react-intersection-observer"
import pb from "@/lib/pocketbase"
import {
  ArrowLeftCircleIcon,
  ArrowPathIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"
import ProtectAdmin from "@/components/ProtectAdmin"
import { useSetRecoilState } from "recoil"
import { modalState } from "@/lib/recoil"
import SEO from "@/components/SEO"
import errorTransmission from "@/lib/errorTransmission"

/** 주소에서 chatId 가져오기 */
export const getServerSideProps = async (context) => {
  const { query } = context
  const { chatId } = query
  return {
    props: {
      chatId,
    },
  }
}

export default function ChatLog({ chatId }) {
  /** 채팅 정보 저장 */
  const [chatInfo, setChatInfo] = useState()
  /** 초기 메세지 및 새로 받는 메세지 저장 */
  const [messages, setMessages] = useState([])
  /** 메제시 과거 기록 저장 */
  const [oldMessages, setOldMessages] = useState([])
  /** 과거 메세지를 불러올 때 더 불러올 메세지가 있는지 판단 */
  const [hasNextPage, setHasNextPage] = useState(true)
  // userInfo PopUp
  const [userInfoPopup, setUserInfoPopup] = useState()
  // update user info
  const [updateUser, setUpdateUser] = useState(0)
  /** 사용자가 맨 위로 올렸는지 판단 */
  const [ref, inView] = useInView()
  /** 메세지 전송 후 스크롤 내리는 기준 */
  const messageEndRef = useRef(null)
  /** infinite scroll 후 이전 메세지로 이동하는 기준 */
  const infiniteRef = useRef(null)
  /** 메세지 불러오는 페이지 */
  const page = useRef(1)

  const setModal = useSetRecoilState(modalState)

  /** message를 불러오는 함수 */
  const fetch = useCallback(async () => {
    try {
      let messageList = await pb
        .collection("messages")
        .getList(page.current, 20, {
          filter: `chat.id="${chatId}"`,
          sort: "-created",
          expand: "sender, product,reviewProduct",
        })
      if (page.current === 1) {
        setMessages(messageList.items.reverse())
      } else {
        let reversedMessage = [...messageList.items].reverse()
        setOldMessages((prev) => [...reversedMessage, ...prev])
      }
      setHasNextPage(messageList.items.length === 20)
      if (messageList.items.length) {
        page.current += 1
      }
    } catch (e) {
      errorTransmission(e)
    }
  }, [])

  useEffect(() => {
    /** 채팅 정보 가져오기 */
    async function getChatInfo() {
      try {
        if (chatId) {
          const info = await pb.collection("chats").getOne(chatId, {
            expand: "user1,user2",
          })
          setChatInfo(info)
        }
      } catch (e) {
        errorTransmission(e)
      }
    }
    /** 실시간 채팅을 위한 realtime 설정 */
    async function subscribeChat() {
      try {
        if (chatId) {
          pb.collection("chats").subscribe(chatId, async function (e) {
            const newMessage = await pb
              .collection("messages")
              .getOne(e?.record?.messages)
            setMessages((prev) => [...prev, newMessage])
          })
        }
      } catch (e) {
        errorTransmission(e)
      }
    }
    subscribeChat()
    getChatInfo()
  }, [chatId, updateUser])

  useEffect(() => {
    try {
      /** infinite scroll 후 보던 메세지로 이동 */
      infiniteRef?.current?.scrollIntoView()
    } catch (e) {
      errorTransmission(e)
    }
  }, [oldMessages])

  useEffect(() => {
    try {
      /** 채팅 입력 후 스크롤 아래로 내리기 */
      messageEndRef?.current?.scrollIntoView({ behavior: "smooth" })
    } catch (e) {
      errorTransmission(e)
    }
  }, [messages])

  /** inView와 hasNextPage값이 참이면 추가 message 로드 */
  useEffect(() => {
    if (inView && hasNextPage) {
      fetch()
    }
  }, [fetch, hasNextPage, inView])

  function UserInfoPopUp() {
    async function handleUserBan(userId, isBanned) {
      try {
        if (isBanned) {
          const ban = await pb
            .collection("users")
            .update(userId, { isBanned: false })
          setUpdateUser((prev) => prev + 1)
          setUserInfoPopup(null)
          if (ban) {
            setModal(`${ban.name} 차단 해제`)
          }
        } else {
          const ban = await pb
            .collection("users")
            .update(userId, { isBanned: true })
          setUpdateUser((prev) => prev + 1)
          setUserInfoPopup(null)
          if (ban) {
            setModal(`${ban.name} 차단 완료`)
          }
        }
      } catch (e) {
        errorTransmission(e)
      }
    }
    return (
      <div className="fixed top-0 bottom-0 left-0 right-0 w-full h-screen bg-slate-50 dark:bg-black flex justify-center items-center p-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg relative w-full max-w-sm">
          <button
            className="absolute -top-2 -right-2"
            onClick={() => setUserInfoPopup(null)}
          >
            <XCircleIcon className="w-8 h-8 text-slate-700" />
          </button>
          <div className="text-xl font-bold mb-2 dark:text-white">
            {userInfoPopup?.name}
          </div>
          <div className="text-lg font-semibold dark:text-white">
            학번: {userInfoPopup?.studentId}
          </div>
          <div className="text-lg font-semibold dark:text-white">
            이메일: {userInfoPopup?.email}
          </div>
          <div className="text-lg font-semibold dark:text-white">
            품격 온도: {userInfoPopup?.dignity}
          </div>
          <div className="text-lg font-semibold dark:text-white">
            자율위원: {userInfoPopup?.autonomy ? "✅" : "❌"}
          </div>
          <div className="text-lg font-semibold dark:text-white">
            관리자: {userInfoPopup?.admin ? "✅" : "❌"}
          </div>
          <div className="text-lg font-semibold dark:text-white">
            차단 여부: {userInfoPopup?.isBanned ? "✅" : "❌"}
          </div>
          <button
            onClick={() =>
              handleUserBan(userInfoPopup.id, userInfoPopup.isBanned)
            }
            className={`mt-4 w-full p-2 rounded-md ${
              userInfoPopup?.isBanned
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-500 hover:bg-red-600"
            } text-white dark:text-black font-semibold text-lg transition duration-200`}
          >
            {userInfoPopup?.isBanned ? "차단 해제" : "차단"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProtectAdmin>
      <SEO title={"채팅 로그"} />
      {userInfoPopup ? <UserInfoPopUp /> : ""}
      <div className="bg-slate-50 dark:bg-black min-h-screen w-screen">
        <div className="fixed top-0 right-0 left-0 p-2 bg-white dark:bg-gray-900 shadow-md flex items-center justify-between">
          <Link href={"/devpage/chats-log"}>
            <ArrowLeftCircleIcon className="w-8 h-8 text-amber-500" />
          </Link>
          <div className="text-md ml-2 font-bold flex justify-between dark:text-white">
            Chat ID: {chatInfo?.id}
          </div>
        </div>
        <div ref={ref} className="w-full pt-20"></div>
        <div className="bg-slate-50 dark:bg-black flex justify-center">
          {hasNextPage ? (
            <div className="flex justify-center items-center flex-col items-cente p-2">
              <ArrowPathIcon className="w-8 h-8 p-2 animate-spin text-slate-600 dark:text-slate-300" />
              <div className="text-sm">
                로딩이 되지 않는다면 창을 내렸다 올려주세요.
              </div>
            </div>
          ) : (
            <div className="text-sm p-2 dark:text-white">
              더 이상 기록이 없습니다.
            </div>
          )}
        </div>
        <div className="overflow-auto pb-24 flex flex-col space-y-2">
          {oldMessages?.map((data, key) => (
            <section
              key={key}
              className={`${
                chatInfo.user2 === data?.sender
                  ? "ml-auto items-end"
                  : "mr-auto items-start"
              } mb-1 flex flex-col  mx-2`}
            >
              {key === 19 ? <div ref={infiniteRef}></div> : ""}
              <div className="text-xs dark:text-white">
                {chatInfo.user2 === data?.sender
                  ? data?.expand?.receiver?.name
                  : data?.expand?.sender?.name}
              </div>
              <div className="bg-white dark:text-white dark:bg-gray-900 p-1 px-2 rounded-md max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl break-words">
                {data?.message ? (
                  data.message
                ) : (
                  <Image
                    alt="image"
                    className="rounded-lg"
                    src={`https://dearyouapi.moveto.kr/api/files/messages/${data.id}/${data.image}`}
                    width={300}
                    height={300}
                  />
                )}
              </div>
            </section>
          ))}
          {messages?.map((data, key) => (
            <section
              key={key}
              className={`${
                chatInfo.user2 === data?.sender
                  ? "ml-auto flex-row-reverse"
                  : "mr-auto"
              } mb-1  mx-2 flex items-end`}
            >
              <div
                className={`flex flex-col ${
                  chatInfo.user2 === data?.sender ? "items-end" : "items-start"
                }`}
              >
                <div className="text-xs dark:text-white">
                  {chatInfo.user2 === data?.sender
                    ? data?.expand?.receiver?.name
                    : data?.expand?.sender?.name}
                </div>
                <div className="bg-white dark:text-white dark:bg-gray-900 p-1 px-2 rounded-md max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl break-words">
                  {data?.product ? (
                    <Link href={`/products/${data?.expand?.product?.id}`}>
                      <Image
                        src={`https://dearyouapi.moveto.kr/api/files/products/${data?.expand?.product?.id}/${data?.expand?.product?.photos[0]}`}
                        width={300}
                        height={300}
                        alt={"photo"}
                      />
                    </Link>
                  ) : (
                    ""
                  )}
                  {data.reviewProduct ? (
                    <Link
                      href={`/products/buyer-review/${data?.expand?.reviewProduct?.id}?sellerId=${data.sender}`}
                    >
                      <Image
                        src={`https://dearyouapi.moveto.kr/api/files/products/${data?.expand?.reviewProduct?.id}/${data?.expand?.reviewProduct?.photos[0]}`}
                        width={300}
                        height={300}
                        alt={"photo"}
                      />
                    </Link>
                  ) : (
                    ""
                  )}
                  {data?.message ? (
                    data.message
                  ) : (
                    <Image
                      alt="image"
                      className="rounded-lg"
                      src={`https://dearyouapi.moveto.kr/api/files/messages/${data.id}/${data.image}`}
                      width={300}
                      height={300}
                    />
                  )}
                </div>
              </div>
              {messages.length === key + 1 ? (
                <div className="text-xs text-slate-700 dark:text-slate-200">
                  {data.isRead ? "읽음" : ""}
                </div>
              ) : (
                ""
              )}
            </section>
          ))}
          <div ref={messageEndRef}></div>
        </div>
        <div className="flex justify-between p-2 px-4 items-center fixed bottom-0 right-0 left-0 w-full bg-amber-50 dark:bg-slate-800">
          <button
            onClick={() => setUserInfoPopup(chatInfo?.expand?.user1)}
            className="flex justify-center flex-col p-2 px-4 rounded-lg shadow-xl bg-white dark:bg-gray-900 hover:bg-slate-100 dark:hover:bg-gray-700 transition duration-200"
          >
            <div className="dark:text-white">User 1</div>
            <div className="text-lg font-semibold dark:text-white">
              {chatInfo?.expand?.user1?.name}
            </div>
          </button>
          <button
            onClick={() => setUserInfoPopup(chatInfo?.expand?.user2)}
            className="flex justify-center flex-col p-2 px-4 rounded-lg shadow-xl bg-white dark:bg-gray-900 hover:bg-slate-100 dark:hover:bg-gray-700 transition duration-200"
          >
            <div className="dark:text-white">User 2</div>
            <div className="text-lg font-semibold dark:text-white">
              {chatInfo?.expand?.user2?.name}
            </div>
          </button>
        </div>
      </div>
    </ProtectAdmin>
  )
}
