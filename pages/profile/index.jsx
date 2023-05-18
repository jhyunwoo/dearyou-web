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
            내 상품
          </Link>
          <Link
            href={"/profile/my-reviews"}
            className=" bg-white hover:bg-slate-100 transition duration-200 p-4 rounded-xl"
          >
            거래 후기
          </Link>
        </div>
        <Link
          href={"/privacy"}
          className="text-sm mx-auto mt-12 text-slate-600"
        >
          개인정보처리방침
        </Link>
      </Layout>
    </ProtectedPage>
  );
}
