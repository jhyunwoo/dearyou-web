import BottomBar from "@/components/BottomBar"
import HeadBar from "@/components/HeadBar"
import Layout from "@/components/Layout"
import ProtectedPage from "@/components/ProtectedPage"
import pb from "@/lib/pocketbase"
import { useEffect, useState } from "react"
import { usePbAuth } from "@/contexts/AuthWrapper"
import Link from "next/link"
import getUploadedTime from "@/lib/getUploadedTime"

export default function ChatList() {
  const { user } = usePbAuth()
  const [chats, setChats] = useState([])
  const [updateChats, setUpdateChats] = useState(0)
  useEffect(() => {
    async function getChatList() {
      try {
        let list = await pb
          .collection("chats")
          .getFullList({ expand: "user1,user2,messages", sort: "-updated" })

        setChats(list)
      } catch (e) {
        console.log(e)
      }
    }

    getChatList()
  }, [updateChats])
  useEffect(() => {
    async function subscribeChat() {
      console.log("subscribed")
      pb.collection("chats").subscribe("*", async function (e) {
        setUpdateChats((prev) => prev + 1)
      })
    }
    subscribeChat()
  }, [])
  return (
    <Layout>
      <BottomBar />
      <HeadBar title={"채팅"} />
      <ProtectedPage>
        <div className="grid grid-cols gap-3">
          {chats.map((data, key) => (
            <section key={key} className="relative">
              {!data?.expand?.messages?.isRead &&
              data?.expand?.messages?.receiver === pb.authStore.model.id ? (
                <div className="w-3 h-3 bg-red-300 animate-pulse rounded-full absolute -top-1 -right-1"></div>
              ) : (
                ""
              )}
              <Link
                href={`/chats/${data.id}`}
                className="bg-white p-3 rounded-l  flex justify-between items-center"
              >
                <div className="text-lg font-bold">
                  {user.id !== data.expand.user1.id
                    ? data.expand.user1.name
                    : data.expand.user2.name}
                </div>
                <div className="flex flex-col items-end">
                  <div className="font-bold ">
                    {data?.expand?.messages?.message
                      ? data.expand.messages.message
                      : "<사진>"}
                  </div>
                  <div className="text-sm">
                    {getUploadedTime(data?.expand?.messages?.created)}
                  </div>
                </div>
              </Link>
            </section>
          ))}
        </div>
      </ProtectedPage>
    </Layout>
  )
}
