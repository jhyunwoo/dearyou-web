import {
  HomeIcon,
  MagnifyingGlassIcon,
  ChatBubbleBottomCenterTextIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function BottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 w-full h-16 bg-white rounded-t-3xl flex justify-around items-center">
      <Link href={"/"}>
        <HomeIcon className="w-8 h-8 text-amber-800 " />
      </Link>
      <Link href="/search">
        <MagnifyingGlassIcon className="w-8 h-8 text-amber-800 " />
      </Link>
      <Link href={"/chats"}>
        <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-amber-800 " />
      </Link>
      <Link href={"/profile"}>
        <UserCircleIcon className="w-8 h-8 text-amber-800 " />
      </Link>
    </div>
  );
}
