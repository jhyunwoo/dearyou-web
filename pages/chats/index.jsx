import ProtectedPage from "@/components/ProtectedPage";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { usePbAuth } from "../../contexts/AuthWrapper";
import Link from "next/link";
import pb from "@/lib/pocketbase";
import BottomBar from "@/components/BottomBar";

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
      <BottomBar />
      <div className="shadow-2xl w-full mx-auto h-screen">
        <h3 className="text-2xl font-bold text-center pt-5">채팅 목록</h3>
        <p className="text-center">{user?.id}</p>
        <div className="grid grid-cols-1 overflow-y-auto m-5 px-3">
          {chatsList?.map((data, key) => (
            <Link
              className="m-1 p-1 text-xl flex border-2 border-gray-500 rounded-xl"
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
