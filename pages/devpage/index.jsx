import Link from "next/link"
import { Cog6ToothIcon } from "@heroicons/react/24/outline"
import BottomBar from "@/components/BottomBar"
import HeadBar from "@/components/HeadBar"
import Layout from "@/components/Layout"
import DeveloperPage from "@/components/DeveloperPage"
import ProtectedPage from "@/components/ProtectedPage"

export default function LogPage() {
  return (
    <ProtectedPage>
      <DeveloperPage>
        <BottomBar />
        <HeadBar title="개발자 페이지" />
        <Layout>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 my-2">
            <Link
              href={"/devpage/chats-log"}
              className="flex bg-white hover:bg-slate-100 transition duration-200 p-4 rounded-xl"
            >
              <Cog6ToothIcon className="w-6 h-6 stroke-slate-600 mr-1" />
              채팅 로그 조회
            </Link>
          </div>
        </Layout>
      </DeveloperPage>
    </ProtectedPage>
  )
}
