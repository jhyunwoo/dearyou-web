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

  async function getChats() {
    const resultList = await pb.collection("chats").getFullList({
      expand: "seller,buyer,messages",
      filter: `seller.id="${pb.authStore.model.id}"||buyer.id="${pb.authStore.model.id}"`,
    });
    console.log(resultList);
    setChatsList(resultList);
  }

  useEffect(() => {
    if (!router.isReady) return;
    getChats();
  }, [router.isReady]);

  return (
    <ProtectedPage>
      <BottomBar />
      <div className="w-full min-h-screen p-4 bg-slate-50">
        <div className="font-semibold mb-3 text-lg">채팅</div>
        <div className="grid grid-cols-1 ">
          {chatsList?.map((data, key) => (
            <Link
              className="bg-white p-2 rounded-xl shadow-md"
              href={"/chats/" + data?.id}
              key={key}
            >
              <div className="flex ">
                {data?.expand["buyer"]?.id === user.id ? (
                  data.expand["buyer"].avatar ? (
                    <Image
                      width={100}
                      height={100}
                      alt={"user avatar"}
                      className="w-16 h-16 rounded-full"
                      src={`https://dearu-pocket.moveto.kr/api/files/users/${data.expand["buyer"].id}/${data.expand["buyer"].avatar}?thumb=100x100`}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                  )
                ) : data.expand["seller"].avatar ? (
                  <Image
                    width={100}
                    height={100}
                    alt={"user avatar"}
                    className="w-16 h-16 rounded-full"
                    src={`https://dearu-pocket.moveto.kr/api/files/users/${data.expand["seller"].id}/${data.expand["buyer"].avatar}?thumb=100x100`}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                )}

                <div className="flex flex-col ml-4 justify-center">
                  <div className="text-base font-bold">
                    {data?.expand["buyer"]?.id === user.id
                      ? data?.expand["seller"]?.name
                      : data?.expand["buyer"]?.name}
                  </div>
                  <div className="text-sm font-medium">
                    {data?.expand.messages.slice(-1)[0].text
                      ? data?.expand.messages.slice(-1)[0].text
                      : "사진"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ProtectedPage>
  );
}
