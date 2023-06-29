import BottomBar from "@/components/BottomBar";
import HeadBar from "@/components/HeadBar";
import Layout from "@/components/Layout";
import DeveloperPage from "@/components/DeveloperPage";
import { usePbAuth } from "@/contexts/AuthWrapper";
import pb from "@/lib/pocketbase";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";

export default function LogPage() {
  return (
    <ProtectedPage>
        <DeveloperPage>
        <BottomBar />
        <HeadBar title="개발자 페이지" />
        <Layout>
            <Link
                href={"/logs/chats"}
                className=" bg-white hover:bg-slate-100 transition duration-200 p-4 rounded-xl"
            >
                채팅 로그 조회
            </Link>
        </Layout>
        </DeveloperPage>
    </ProtectedPage>
  );
}

