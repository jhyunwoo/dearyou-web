import Link from "next/link"
import { Cog6ToothIcon } from "@heroicons/react/24/outline"
import BottomBar from "@/components/BottomBar"
import HeadBar from "@/components/HeadBar"
import Layout from "@/components/Layout"
import ProtectAdmin from "@/components/ProtectAdmin"
import SEO from "@/components/SEO"

export default function LogPage() {
  return (
    <ProtectAdmin>
      <SEO title={"개발자 페이지"} />
      <BottomBar />
      <HeadBar title="개발자 페이지" />
      <Layout>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 my-2 dark:text-white">
          <Link
            href={"/devpage/chats-log"}
            className="flex bg-white dark:bg-gray-900 hover:bg-slate-100 hover:dark:bg-slate-800 transition duration-200 p-4 rounded-xl"
          >
            <Cog6ToothIcon className="w-6 h-6 stroke-slate-600 mr-1 " />
            채팅 로그 조회
          </Link>
        </div>
      </Layout>
    </ProtectAdmin>
  )
}
