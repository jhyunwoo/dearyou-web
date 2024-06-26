import Image from "next/image"
import Link from "next/link"
import Layout from "@/components/Layout"
import { XMarkIcon } from "@heroicons/react/24/outline"
import BottomBar from "@/components/BottomBar"
import SEO from "@/components/SEO"

export default function Profile() {
  return (
    <Layout>
      <SEO title={"Credits"} />
      <BottomBar />
      <div className="mx-auto text-center dark:text-white">
        <div className="">
          <Image
            src={"/favicon.png"}
            width={64}
            height={64}
            className="mt-10 rounded-2xl mx-auto"
            alt="dearyou logo"
          />
          <div className="mt-2 text-xl dark:text-white">드려유 (DearYou)</div>
          <div className="mt-2 text-3xl font-bold dark:text-white">
            만든 사람들
          </div>

          <div className="flex mt-20 px-10 my-5 items-center text-cyan-900 dark:text-cyan-50">
            <div className="mx-auto ">
              <div className="">
                <div>IT 개발 동아리</div>
                <div>Beatus</div>
              </div>
              <Image
                src="/BeatusLogo.jpg"
                alt="beatusLogo"
                width={200}
                height={200}
                className="w-24 h-24 my-2 mx-auto"
              />
            </div>
            <XMarkIcon className="w-6 h-8 mx-2 mt-10" />
            <div className="mx-auto">
              <div className="">
                <div>충남삼성고</div>
                <div>10대 자율위원단</div>
              </div>
              <Image
                src="/csc.png"
                alt="CscLogo"
                width={200}
                height={200}
                className="w-24 h-24 my-2 mx-auto"
              />
            </div>
          </div>
        </div>

        <div className="w-full mb-8 border-2 rounded-full border-slate-200" />
        <div className="text-2xl font-bold dark:text-white">Beatus</div>

        <div className="w-full my-8 border-2 rounded-full border-slate-100" />
        <div className="text-xl my-2 font-bold dark:text-white">기획팀</div>
        <div className="font-semibold dark:text-white">김형진</div>
        <div className="dark:text-white">정윤승</div>
        <div className="dark:text-white">허준영</div>

        <div className="w-full my-8 border-2 rounded-full border-slate-100" />
        <div className="text-xl my-2 font-bold">개발팀</div>
        <Link href={"https://jhyunwoo.com"} className="font-semibold">
          전현우
        </Link>
        <div className="font-semibold">김연준</div>
        <div>윤기완</div>
        <div>홍준혁</div>
        <div>변상빈</div>
        <div>임진성</div>
        <div>우성민</div>

        <div className="w-full my-8 border-2 rounded-full border-slate-100" />
        <div className="text-xl my-2 font-bold">디자인팀</div>
        <div>박유민</div>
        <div>김시연</div>
        <div>연수인</div>
        <div>백승하</div>

        <div className="w-full my-8 border-2 rounded-full border-slate-200" />
        <div className="text-2xl font-bold">자율위원단</div>

        <div className="w-full my-8 border-2 rounded-full border-slate-100" />
        <div className="text-xl my-2 font-bold">자율위원장</div>
        <div>우예원</div>

        <div className="w-full my-8 border-2 rounded-full border-slate-100" />
        <div className="text-xl my-2 font-bold">자율부위원장</div>
        <div>최진우</div>
        <div>이준희</div>
        <div className="w-full my-8 border-2 rounded-full border-slate-100" />
        <div className="text-lg my-2 font-semibold">자율위원단 36명</div>

        <div className="w-full my-8 border-2 rounded-full border-slate-100" />
      </div>
    </Layout>
  )
}
