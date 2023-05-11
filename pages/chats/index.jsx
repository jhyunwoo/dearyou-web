import ProtectedPage from "@/components/ProtectedPage";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { usePbAuth } from "../../contexts/AuthWrapper";
import Link from "next/link";
import pb from "@/lib/pocketbase";
import BottomBar from "@/components/BottomBar";
import Image from "next/image";

export default function Chats() {
  const { user, signOut } = usePbAuth();
  const router = useRouter();
  const [chatsList, setChatsList] = useState([]);

  /** 최근에 메시지 온 순으로 채팅 정렬해 chatsList 스테이트에 저장 */
  async function getSortedChats() {
    const resultList = await pb.collection("chats").getFullList({
      expand: "seller,buyer,messages,read",
      filter: `seller.id="${pb.authStore.model.id}"||buyer.id="${pb.authStore.model.id}"`,
    });

    const sortedList = resultList.sort(function (a, b) {
      const v =
        new Date(a.expand?.messages?.slice(-1)[0].created) -
        new Date(b.expand?.messages?.slice(-1)[0].created);
      if (v < 0) return 1;
      else if (v > 0) return -1;
      else return 0;
    });

    setChatsList(sortedList);
  }

  function generateShortText(text) {
    if (text.length > 15) {
      return text.substr(0, 15) + "...";
    } else {
      return text;
    }
  }

  function Unreads(props) {
    const read = props.data.expand.read;
    return read.unreaduser === user.id && read.unreadcount > 0 ? (
      <span className="ml-2 px-1 rounded-2xl bg-red-400 text-white">
        {read.unreadcount}
      </span>
    ) : null;
  }

  useEffect(() => {
    if (!router.isReady) return;
    getSortedChats();
    pb.collection("chats").subscribe(getSortedChats);
  }, [router.isReady]);

  return (
    <ProtectedPage>
      <BottomBar />
      <div className="w-full min-h-screen p-4 bg-slate-50">
        <div className="font-semibold mb-3 text-lg">채팅</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {chatsList.length === 0 ? (
            <div className="mx-auto mt-12 sm:col-span-2 lg:col-span-3 xl:col-span-4">
              드려유에서 물건을 거래해 보세요.
            </div>
          ) : (
            ""
          )}
          {chatsList?.map((data, key) => (
            <Link
              className="bg-white p-2 rounded-xl hover:bg-slate-100 transition duration-200"
              href={"/chats/" + data?.id}
              key={key}
            >
              <div className="flex ">
                {data?.expand["buyer"]?.id === user.id ? (
                  data.expand["seller"].avatar ? (
                    <Image
                      width={100}
                      height={100}
                      alt={"user avatar"}
                      className="w-16 h-16 rounded-full my-auto"
                      src={`https://dearu-pocket.moveto.kr/api/files/users/${data.expand["seller"].id}/${data.expand["seller"].avatar}?thumb=100x100`}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-200 my-auto"></div>
                  )
                ) : data.expand["buyer"].avatar ? (
                  <Image
                    width={100}
                    height={100}
                    alt={"user avatar"}
                    className="w-16 h-16 rounded-full my-auto"
                    src={`https://dearu-pocket.moveto.kr/api/files/users/${data.expand["buyer"].id}/${data.expand["buyer"].avatar}?thumb=100x100`}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-200 my-auto"></div>
                )}

                <div className="flex flex-col ml-4 justify-center">
                  <div className="text-base font-bold">
                    {data?.expand["buyer"]?.id === user.id
                      ? data?.expand["seller"]?.name
                      : data?.expand["buyer"]?.name}
                    <Unreads data={data} />
                  </div>
                  <div className="text-sm font-medium">
                    {data?.expand?.messages?.slice(-1)[0].text
                      ? generateShortText(
                          data?.expand.messages.slice(-1)[0].text,
                        )
                      : "사진"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="w-full h-16"></div>
      </div>
    </ProtectedPage>
  );
}
