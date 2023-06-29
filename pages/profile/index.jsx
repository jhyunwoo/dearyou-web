import BottomBar from "@/components/BottomBar";
import HeadBar from "@/components/HeadBar";
import Layout from "@/components/Layout";
import ProtectedPage from "@/components/ProtectedPage";
import { usePbAuth } from "@/contexts/AuthWrapper";
import pb from "@/lib/pocketbase";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

export default function Profile() {
  const { user, signOut } = usePbAuth();

  // 개발자 권한 (로그 열람 권한)
  const permission = pb.authStore.model?.logPermission;
  return (
    <ProtectedPage>
      <BottomBar />
      <HeadBar title="프로필" />
      <Layout>
        <div className="bg-white w-full  p-4 flex flex-col hover:shadow-lg transidion duration-200">
          {pb?.authStore?.model?.avatar ? (
            <Image
              width={100}
              height={100}
              alt={"user avatar"}
              className="rounded-full w-24 h-24"
              src={`https://dearyouapi.moveto.kr/api/files/users/${pb.authStore.model.id}/${pb.authStore.model.avatar}?thumb=100x100`}
            />
          ) : (
            <div className="w-24 h-24 bg-slate-400 rounded-full"></div>
          )}
          <div className="mt-4">
            <div className="text-xl font-bold">{user?.name}</div>
            <div>{user?.studentId}</div>
            <div>{user?.email}</div>

            <div className=" flex flex-col my-4 justify-center items-center">
              <button
                className="bg-red-500 hover:bg-red-600 transition duration-200 text-white p-1 px-4 rounded-full mb-2"
                onClick={signOut}
              >
                로그아웃
              </button>
              <Link
                className="bg-orange-400 hover:bg-orange-500 transition duration-200 text-white p-1 px-4 rounded-full"
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
            className=" bg-white hover:bg-slate-100 transition duration-200 p-4 rounded-xl"
          >
            관심목록
          </Link>
          <Link
            href={"/profile/my-products"}
            className=" bg-white hover:bg-slate-100 transition duration-200 p-4 rounded-xl"
          >
            내가 등록한 물품
          </Link>
          <Link
            href={"/profile/my-reviews"}
            className=" bg-white hover:bg-slate-100 transition duration-200 p-4 rounded-xl"
          >
            나눔 후기
          </Link>
          {
            permission ? (
            <Link
              href={"/devpage"}
              className="flex bg-white hover:bg-slate-100 transition duration-200 p-4 rounded-xl"
            >
              <Cog6ToothIcon className="w-6 h-6 stroke-slate-600 mr-1"/>개발자 페이지
            </Link>
            ) : null
          }
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
      </Layout>
    </ProtectedPage>
  );
}

