import {
  HomeIcon,
  MagnifyingGlassIcon,
  ChatBubbleBottomCenterTextIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { usePbAuth } from "../contexts/AuthWrapper";
import { useState, useEffect} from "react";
import pb from "@/lib/pocketbase";
import Link from "next/link";

export default function BottomBar() {
  const { user } = usePbAuth();
  const [ unreadChat, setUnreadChat ] = useState(false)
  
  async function getChat(){
    const resultList = await pb.collection("chats").getFullList({
      expand: "seller,buyer,messages,read",
      filter: `seller.id="${pb.authStore.model.id}"||buyer.id="${pb.authStore.model.id}"`,
    });

    for(let i = 0; i < resultList.length; i++){
      let read = resultList[i].expand.read
      if(read.unreaduser == user.id && read.unreadcount > 0 ){
        setUnreadChat(true);
        break;
      }
    }
  }

  useEffect(() => {
    getChat();
    pb.collection("chats").subscribe("*", getChat);
  }, []);

  const Notify = () => (<div className="absolute top-1 right-1 w-4 h-4 rounded-2xl bg-red-600"/>);
  return (
    <div className="fixed bottom-0 left-0 right-0 w-full h-16 bg-white rounded-t-3xl flex justify-around items-center">
      <Link
        href={"/"}
        className="text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white p-2 rounded-2xl transition duration-200"
      >
        <HomeIcon className="w-8 h-8  " />
      </Link>
      <Link
        href="/search"
        className="text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white p-2 rounded-2xl transition duration-200"
      >
        <MagnifyingGlassIcon className="w-8 h-8  " />
      </Link>
      <Link
        href={"/chats"}
        className="relative text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white p-2 rounded-2xl transition duration-200"
      >
        <ChatBubbleBottomCenterTextIcon className="w-8 h-8  " />
        {unreadChat ? <Notify /> : null}
      </Link>
      <Link
        href={"/profile"}
        className="text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white p-2 rounded-2xl transition duration-200"
      >
        <UserCircleIcon className="w-8 h-8  " />
      </Link>
    </div>
  );
}
