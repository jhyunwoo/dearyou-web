import Image from "next/image"
import Link from "next/link"
import {
  CheckBadgeIcon,
  Cog6ToothIcon,
  FireIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline"
import { usePbAuth } from "@/contexts/AuthWrapper"
import BottomBar from "@/components/BottomBar"
import HeadBar from "@/components/HeadBar"
import Layout from "@/components/Layout"
import SEO from "@/components/SEO"
import RegisterPush from "@/components/RegisterPush"

export default function Profile() {
  const { user, signOut } = usePbAuth()

  return (
    <Layout>
      <SEO title={"Profile"} />
      <div className="bg-white dark:bg-gray-900 w-full p-4 flex flex-col hover:shadow-lg transidion duration-200">
        <div className="flex">
          {user?.avatar ? (
            <Image
              width={100}
              height={100}
              alt={"user avatar"}
              className="rounded-full w-24 h-24"
              src={`https://dearyouapi.moveto.kr/api/files/users/${user.id}/${user.avatar}?thumb=100x100`}
            />
          ) : (
            <div className="w-24 h-24 bg-slate-400 rounded-full"></div>
          )}
          <div className="ml-auto text-center">
            <div className="relative w-28 font-bold dark:text-white">
              품격 온도
              <FireIcon className="mx-auto w-20 h-20 stroke-amber-200 dark:stroke-amber-800" />
              <div className="absolute w-full bottom-3">
                <div className="mx-auto text-4xl font-bold text-amber-500">
                  {user?.dignity} ºC
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center text-xl font-bold dark:text-white ">
            {user?.name}
            {user?.admin ? (
              <Cog6ToothIcon className="w-6 h-6 ml-1 stroke-slate-600" />
            ) : user?.autonomy ? (
              <CheckBadgeIcon className="w-6 h-6 ml-1 stroke-slate-600" />
            ) : null}
          </div>
          <div className="dark:text-white">
            {user?.studentId < 20000 ? "교사용 계정" : user?.studentId}
          </div>
          <div className="dark:text-white">{user?.email}</div>

          <div className=" flex flex-col my-4 justify-center items-center">
            <RegisterPush />
            <button
              className="bg-red-500 mt-2 dark:text-black font-semibold hover:bg-red-600 transition duration-200 text-white p-1 px-4 rounded-full mb-2"
              onClick={signOut}
            >
              로그아웃
            </button>
            <Link
              className=" transition duration-200 text-orange-600 p-1 px-4 rounded-full"
              href={"/profile/add-info"}
            >
              사용자 정보 변경
            </Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 my-2">
        <Link
          href={"/profile/wish"}
          className=" bg-white dark:bg-gray-900 hover:bg-slate-100 hover:dark:bg-slate-800  transition duration-200 p-4 rounded-xl dark:text-white"
        >
          관심목록
        </Link>
        <Link
          href={"/profile/my-products"}
          className=" bg-white dark:bg-gray-900 hover:bg-slate-100 hover:dark:bg-slate-800  transition duration-200 p-4 rounded-xl dark:text-white"
        >
          내가 등록한 물건
        </Link>
        <Link
          href={"/profile/my-reviews"}
          className=" bg-white dark:bg-gray-900 hover:bg-slate-100 hover:dark:bg-slate-800  transition duration-200 p-4 rounded-xl dark:text-white"
        >
          나눔 후기
        </Link>
        <Link
          href={"https://open.kakao.com/o/sGLY1utf"}
          className=" bg-white dark:bg-gray-900 hover:bg-slate-100 hover:dark:bg-slate-800  transition duration-200 p-4 rounded-xl dark:text-white"
        >
          드려유 고객센터
        </Link>
        <Link
          href={"/profile/guideline"}
          className=" bg-white dark:bg-gray-900 hover:bg-slate-100 hover:dark:bg-slate-800  transition duration-200 p-4 rounded-xl dark:text-white flex items-center"
        >
          <QuestionMarkCircleIcon className="w-6 stroke-slate-600 h-6 mr-1" />
          도움말
        </Link>
        {user?.admin ? (
          <Link
            href={"/devpage"}
            className="flex bg-white dark:bg-gray-900 hover:bg-slate-100 hover:dark:bg-slate-800  transition duration-200 p-4 rounded-xl dark:text-white"
          >
            <Cog6ToothIcon className="w-6 h-6 stroke-slate-600 mr-1" />
            개발자 페이지
          </Link>
        ) : null}
      </div>
      <Link
        href={"/credits"}
        className="text-sm mx-auto mt-12 mb-2 text-slate-600"
      >
        만든 사람들
      </Link>
      <Link
        href={"/privacy"}
        className="text-sm mx-auto mb-12 mt-2 text-slate-600"
      >
        개인정보처리방침
      </Link>
      <HeadBar title="프로필" />
      <BottomBar />
    </Layout>
  )
}
