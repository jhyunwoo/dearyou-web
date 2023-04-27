import ProtectedPage from "@/components/ProtectedPage";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { usePbAuth } from "../../contexts/AuthWrapper";
import Link from "next/link";
import pb from "@/lib/pocketbase";

export default function Chats() {
  const { user, signOut } = usePbAuth();
  const router = useRouter();
  const [chatsList, setChatsList] = useState([]);

  async function getChats() {
    const chatId = router.query["chatId"];
    console.log(user?.id);
    const userEmail = pb.authStore.model.email;
    console.log(userEmail);
    const resultList = await pb.collection("chats").getFullList({
      expand: "seller,buyer",
    });
    try {
      console.log("getChats: 채팅 목록 불러옴");
      //console.log(resultList);
      setChatsList(resultList);
      return;
    } catch {
      return;
    }
  }

  useEffect(() => {
    if (!router.isReady) return;
    getChats();
  }, [router.isReady]);

  return (
    <ProtectedPage>
      <div>Chats</div>
      <div>
        <h3 className="text-2xl font-bold text-center">채팅 목록</h3>
        <p className="text-center">{user?.id}</p>
        <div className="grid grid-cols-1 overflow-y-auto m-5 p-3 border-4 border-slate-100 rounded-2xl">
          {chatsList?.map((data, key) => (
            <Link
              className="m-2 p-1 text-xl flex border-2 border-gray-500"
              href={"/chats/" + data?.id}
              key={key}
            >
              <span className="p-1 font-bold text-blue-800">
                {data?.expand["buyer"]?.id === user.id
                  ? data?.expand["seller"]?.name
                  : data?.expand["buyer"]?.name}
              </span>
              <span className="p-1">님과의 채팅</span>
            </Link>
          ))}
        </div>
      </div>
    </ProtectedPage>
  );
}
