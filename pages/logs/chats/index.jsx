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

export default function ChatLogPage() {
  return (
    <ProtectedPage>
        <DeveloperPage>
        <BottomBar />
        <HeadBar title="채팅 로그 조회" />
        <Layout>
            <div className="rounded-lg border-2 m-4">
                aa
            </div>
        </Layout>
        </DeveloperPage>
    </ProtectedPage>
  );
}

