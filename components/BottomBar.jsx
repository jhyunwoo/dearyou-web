import Link from "next/link"
import {
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
  UserCircleIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline"
import { usePbAuth } from "@/contexts/AuthWrapper"

/** 하단 바 */
export default function BottomBar() {
  const { user } = usePbAuth()

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full h-16 bg-white dark:bg-gray-900 rounded-t-3xl flex justify-around items-center">
      {user?.autonomy ? (
        <Link
          href={"/autonomy"}
          className="text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white hover:dark:text-black dark:text-amber-500 p-2 rounded-2xl transition duration-200"
        >
          <CheckBadgeIcon className="w-8 h-8" />
        </Link>
      ) : null}

      <Link
        href={"/"}
        className="text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white hover:dark:text-black dark:text-amber-500 p-2 rounded-2xl transition duration-200"
      >
        <HomeIcon className="w-8 h-8  " />
      </Link>
      <Link
        href={"/chats"}
        className="relative text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white hover:dark:text-black dark:text-amber-500 p-2 rounded-2xl transition duration-200"
      >
        <ChatBubbleBottomCenterTextIcon className="w-8 h-8  " />
      </Link>

      <Link
        href={"/profile"}
        className="text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white hover:dark:text-black dark:text-amber-500 p-2 rounded-2xl transition duration-200"
      >
        <UserCircleIcon className="w-8 h-8  " />
      </Link>
    </div>
  )
}
