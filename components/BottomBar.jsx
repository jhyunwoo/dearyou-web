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
      <Link
        href={"/"}
        className="text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white p-2 rounded-lg transition duration-200"
      >
        <HomeIcon className="w-8 h-8  " />
      </Link>
      <Link
        href="/search"
        className="text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white p-2 rounded-lg transition duration-200"
      >
        <MagnifyingGlassIcon className="w-8 h-8  " />
      </Link>
      <Link
        href={"/chats"}
        className="text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white p-2 rounded-lg transition duration-200"
      >
        <ChatBubbleBottomCenterTextIcon className="w-8 h-8  " />
      </Link>
      <Link
        href={"/profile"}
        className="text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white p-2 rounded-lg transition duration-200"
      >
        <UserCircleIcon className="w-8 h-8  " />
      </Link>
    </div>
  );
}
