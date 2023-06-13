import BottomBar from "@/components/BottomBar";
import HeadBar from "@/components/HeadBar";
import Layout from "@/components/Layout";
import ProtectedPage from "@/components/ProtectedPage";
import { usePbAuth } from "@/contexts/AuthWrapper";
import pb from "@/lib/pocketbase";
import Image from "next/image";
import Link from "next/link";

export default function Profile() {
  const { user, signOut } = usePbAuth();

  return (
    <ProtectedPage>
      <BottomBar />
      <Layout>
        <div className="mx-auto pb-12 text-center">
            <Image 
                src={'/favicon.ico'}
                width={50}
                height={50}
                className="rounded-full mx-auto"
            />
            <div className="mt-4 text-2xl">MADE BY</div>
            <div className="mt-4">충남삼성고 IT 개발 동아리</div>
            <div className="text-xl">Beatus</div>

            <Link href="https://club.moveto.kr/beatus">
                <Image 
                src={'/BeatusLogo.jpg'}
                width={250}
                height={250}
                className="rounded-3xl mt-8"
                />
            </Link>

            <div className="mt-2 mb-24 text-slate-400 text-xs">사진을 누르면 소개 페이지로 이동합니다.</div>

            <div className="w-full mb-10 border-2 rounded-full border-slate-200"/>
            <div className="text-xl my-2 font-bold">기획</div>
            <div>김형진</div>
            <div>정윤승</div>
            <div>허준영</div>
            
            <div className="w-full my-10 border-2 rounded-full border-slate-100"/>
            <div className="text-xl my-2 font-bold">개발</div>
            <div>전현우</div>
            <div>김연준</div>
            <div>윤기완</div>
            <div>홍준혁</div>
            <div>변상빈</div>
            <div>임진성</div>
            <div>우성민</div>

            <div className="w-full my-10 border-2 rounded-full border-slate-100"/>
            <div className="text-xl my-2 font-bold">디자인</div>
            <div>박유민</div>
            <div>김시연</div>
            <div>연수인</div>
            <div>백승하</div>

            <div className="w-full my-10 border-2 rounded-full border-slate-200"/>
            <div className="text-lg my-2 font-bold">IN ASSOCIATION WITH</div>
            <div>충남삼성고 10대 자율위원단</div>
        </div>
      </Layout>
    </ProtectedPage>
  );
}

