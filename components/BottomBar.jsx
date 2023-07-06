import {
  HomeIcon,
  MagnifyingGlassIcon,
  ChatBubbleBottomCenterTextIcon,
  UserCircleIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline"
import { usePbAuth } from "../contexts/AuthWrapper"
import { useState, useEffect } from "react"
import pb from "@/lib/pocketbase"
import Link from "next/link"

export default function BottomBar() {
  const [autonomy, setAutonomy] = useState(false)

  useEffect(() => {
    setAutonomy(pb.authStore.model.autonomy)
  }, [])

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full h-16 bg-white rounded-t-3xl flex justify-around items-center">
      {autonomy ? (
        <Link
          href={"/autonomy"}
          className="text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white p-2 rounded-2xl transition duration-200"
        >
          <CheckBadgeIcon className="w-8 h-8" />
        </Link>
      ) : null}

      <Link
        href={"/"}
        className="text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white p-2 rounded-2xl transition duration-200"
      >
        <HomeIcon className="w-8 h-8  " />
      </Link>
      <Link
        href={"/chats"}
        className="relative text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white p-2 rounded-2xl transition duration-200"
      >
        <ChatBubbleBottomCenterTextIcon className="w-8 h-8  " />
      </Link>

      <Link
        href={"/profile"}
        className="text-amber-600 hover:bg-amber-500 hover:shadow-md hover:text-white p-2 rounded-2xl transition duration-200"
      >
        <UserCircleIcon className="w-8 h-8  " />
      </Link>
    </div>
  )
}
