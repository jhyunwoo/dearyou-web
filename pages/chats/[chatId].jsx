import { useEffect, useState, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useInView } from "react-intersection-observer"
import { useForm } from "react-hook-form"
import pb from "@/lib/pocketbase"
import TextareaAutosize from "react-textarea-autosize"
import {
  ArrowLeftCircleIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline"
import ProtectedPage from "@/components/ProtectedPage"

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

export default function Chat({ chatId }) {
  /** 채팅 정보 저장 */
  const [chatInfo, setChatInfo] = useState()
  /** 초기 메세지 및 새로 받는 메세지 저장 */
  const [messages, setMessages] = useState([])
  /** 메제시 과거 기록 저장 */
  const [oldMessages, setOldMessages] = useState([])
  /** 과거 메세지를 불러올 때 더 불러올 메세지가 있는지 판단 */
  const [hasNextPage, setHasNextPage] = useState(true)
  // update message after user sended message
  const [updateMessages, setUpdateMessages] = useState(0)
  /** 사용자가 맨 위로 올렸는지 판단 */
  const [ref, inView] = useInView()
  /** React Hook Form 설정 */
  const { register, handleSubmit, setValue } = useForm()
  /** 메세지 전송 후 스크롤 내리는 기준 */
  const messageEndRef = useRef(null)
  /** infinite scroll 후 이전 메세지로 이동하는 기준 */
  const infiniteRef = useRef(null)
  /** 메세지 불러오는 페이지 */
  const page = useRef(1)

  /** 채팅 입력 후 message 생성 */
  const onSubmit = async (data) => {
    setValue("text", "")
    const message = {
      chat: chatId,
      sender: pb.authStore.model.id,
      receiver:
        pb.authStore.model.id === chatInfo.user1
          ? chatInfo.user2
          : chatInfo.user1,
      message: data.text,
      isRead: false,
    }
    const record = await pb.collection("messages").create(message)
    const update = {
      messages: record.id,
    }
    const updateChat = await pb.collection("chats").update(chatId, update)
    setTimeout(() => setUpdateMessages((prev) => prev + 1), 2000)
  }

  /** 사진 입력 후 사진 업로드 */
  async function onLoadImage(e) {
    const file = e.target.files
    const formData = new FormData()
    formData.append("image", file["0"])
    formData.append("chat", chatId)
    formData.append("sender", pb.authStore.model.id)
    formData.append(
      "receiver",
      pb.authStore.model.id === chatInfo.user1
        ? chatInfo.user2
        : chatInfo.user1,
    )
    formData.append("isRead", false)

    try {
      const result = await pb.collection("messages").create(formData)
      const updateChat = await pb.collection("chats").update(chatId, {
        messages: result.id,
      })
    } catch (e) {
      console.log(e)
    }
    setTimeout(() => setUpdateMessages((prev) => prev + 1), 2000)
  }

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
    } catch (err) {
      console.log(err)
    }
  }, [])

  useEffect(() => {
    async function readMessage() {
      if (messages.length < 1) return
      let lastMessage = messages.slice(-1)
      if (lastMessage[0].receiver === pb.authStore.model.id) {
        const readMessage = await pb
          .collection("messages")
          .update(lastMessage[0].id, { isRead: true })
      }
    }
    /** 채팅 정보 가져오기 */
    async function getChatInfo() {
      if (chatId) {
        const info = await pb.collection("chats").getOne(chatId, {
          expand: "user1,user2",
        })
        setChatInfo(info)
      }
    }
    /** 실시간 채팅을 위한 realtime 설정 */
    async function subscribeChat() {
      if (chatId) {
        pb.collection("chats").subscribe(chatId, async function (e) {
          const newMessage = await pb
            .collection("messages")
            .getOne(e?.record?.messages)
          setMessages((prev) => [...prev, newMessage])
          readMessage()
        })
      }
    }
    subscribeChat()
    getChatInfo()
  }, [chatId])

  useEffect(() => {
    /** infinite scroll 후 보던 메세지로 이동 */
    infiniteRef?.current?.scrollIntoView()
  }, [oldMessages])

  useEffect(() => {
    async function updateMessages() {
      try {
        let messageList = await pb.collection("messages").getList(1, 20, {
          filter: `chat.id="${chatId}"`,
          sort: "-created",
          expand: "sender, product,reviewProduct",
        })

        setMessages(messageList.items.reverse())
      } catch (err) {
        console.log(err)
      }
    }
    updateMessages()
  }, [chatId, updateMessages])

  /** inView와 hasNextPage값이 참이면 추가 message 로드 */
  useEffect(() => {
    if (inView && hasNextPage) {
      fetch()
    }
  }, [fetch, hasNextPage, inView])

  useEffect(() => {
    /** 사용자가 채팅방에 들어오면 상대방이 보낸 메세지 읽음 표시 */
    async function readMessage() {
      if (messages.length < 1) return
      let lastMessage = messages.slice(-1)
      if (lastMessage[0].receiver === pb.authStore.model.id) {
        const readMessage = await pb
          .collection("messages")
          .update(lastMessage[0].id, { isRead: true })
      }
    }
    /** 채팅 입력 후 스크롤 아래로 내리기 */
    messageEndRef?.current?.scrollIntoView({ behavior: "smooth" })
    readMessage()
  }, [messages])

  return (
    <ProtectedPage>
      <div className="bg-slate-50 min-h-screen">
        <div className="fixed top-0 right-0 left-0 p-2 bg-white shadow-md flex items-center">
          <Link href={"/chats"}>
            <ArrowLeftCircleIcon className="w-8 h-8 text-amber-500" />
          </Link>
          <div className="text-lg ml-2 font-bold">
            {pb?.authStore?.model?.id === chatInfo?.user1
              ? chatInfo?.expand?.user2?.name
              : chatInfo?.expand?.user1?.name}
          </div>
        </div>
        <div ref={ref} className="w-full pt-20 "></div>
        <div className="bg-slate-50 flex justify-center">
          {hasNextPage ? (
            <div className="flex justify-center items-center flex-col items-cente p-2">
              <ArrowPathIcon className="w-8 h-8 p-2 animate-spin text-slate-600 " />
              <div className="text-sm">
                로딩이 되지 않는다면 창을 내렸다 올려주세요.
              </div>
            </div>
          ) : (
            <div className="text-sm p-2">더 이상 기록이 없습니다.</div>
          )}
        </div>
        <div className="overflow-auto pb-16 flex flex-col space-y-2">
          {oldMessages?.map((data, key) => (
            <section
              key={key}
              className={`${
                pb.authStore.model.id === data?.sender
                  ? "ml-auto items-end"
                  : "mr-auto items-start"
              } mb-1 flex flex-col  mx-2`}
            >
              {key === 19 ? <div ref={infiniteRef}></div> : ""}
              <div className="text-xs">
                {pb.authStore.model.id === data?.sender
                  ? pb.authStore.model.name
                  : data?.expand?.sender?.name}
              </div>
              <div className="bg-white p-1 px-2 rounded-md">
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
                pb.authStore.model.id === data?.sender
                  ? "ml-auto flex-row-reverse"
                  : "mr-auto"
              } mb-1  mx-2 flex items-end`}
            >
              <div
                className={`flex flex-col ${
                  pb.authStore.model.id === data?.sender
                    ? "items-end"
                    : "items-start"
                }`}
              >
                <div className="text-xs">
                  {pb.authStore.model.id === data?.sender
                    ? pb.authStore.model.name
                    : data?.expand?.sender?.name}
                </div>
                <div className="bg-white p-1 px-2 rounded-md max-w-xs">
                  {data?.product ? (
                    pb.authStore.model.id === data?.sender ? (
                      <section>
                        <Image
                          src={`https://dearyouapi.moveto.kr/api/files/products/${data?.expand?.product?.id}/${data?.expand?.product?.photos[0]}`}
                          width={300}
                          height={300}
                          alt={"photo"}
                        />
                      </section>
                    ) : (
                      <Link href={`/products/${data?.expand?.product?.id}`}>
                        <Image
                          src={`https://dearyouapi.moveto.kr/api/files/products/${data?.expand?.product?.id}/${data?.expand?.product?.photos[0]}`}
                          width={300}
                          height={300}
                          alt={"photo"}
                        />
                      </Link>
                    )
                  ) : (
                    ""
                  )}
                  {data.reviewProduct ? (
                    pb.authStore.model.id === data?.sender ? (
                      <section>
                        <Image
                          src={`https://dearyouapi.moveto.kr/api/files/products/${data?.expand?.reviewProduct?.id}/${data?.expand?.reviewProduct?.photos[0]}`}
                          width={300}
                          height={300}
                          alt={"photo"}
                        />
                      </section>
                    ) : (
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
                    )
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
                <div className="text-xs text-slate-700">
                  {data.isRead ? "읽음" : ""}
                </div>
              ) : (
                ""
              )}
            </section>
          ))}
        </div>
        <div ref={messageEndRef}></div>
        <div className="w-full p-2 fixed bottom-0 right-0 left-0 bg-slate-100 ">
          <form onSubmit={handleSubmit(onSubmit)} className="flex items-end">
            <label
              htmlFor="input-file"
              onChange={onLoadImage}
              className="bg-white ring-2  hover:bg-amber-400 text-amber-500 hover:text-white transition duration-200 ring-amber-400 rounded-xl p-1 font-semibold flex justify-center items-center w-10 h-10 mx-1"
            >
              <PhotoIcon className="w-6 h-6" />
              <input
                type="file"
                id="input-file"
                className="hidden"
                accept="image/jpg, image/png, image/jpeg, image/webp, image/heic, image/heic-sequence, image/heif-sequence image/heif"
              />
            </label>
            <TextareaAutosize
              className="flex-auto outline-none p-2 rounded-lg mx-1 break-all"
              {...register("text", {
                required: {
                  value: true,
                  message: "메세지를 입력해주세요.",
                },
              })}
            />
            <button
              className=" w-10 h-10 p-1 rounded-full flex justify-center items-center bg-amber-500 text-white"
              type="submit"
            >
              <ArrowUpIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </ProtectedPage>
  )
}
