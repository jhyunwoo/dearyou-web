import BottomBar from "@/components/BottomBar";
import ProtectedPage from "@/components/ProtectedPage";
import { usePbAuth } from "@/contexts/AuthWrapper";
import pb from "@/lib/pocketbase";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Profile() {
  const { user, signOut } = usePbAuth();
  const router = useRouter();
  return (
    <ProtectedPage>
      <BottomBar />
      <div className="w-full min-h-screen bg-slate p-4">
        <div className="bg-white w-full  p-4 flex flex-col">
          {pb?.authStore?.model?.avatar ? (
            <Image
              width={100}
              height={100}
              alt={"user avatar"}
              className="rounded-full w-24 h-24"
              src={`https://dearu-pocket.moveto.kr/api/files/users/${pb.authStore.model.id}/${pb.authStore.model.avatar}?thumb=100x100`}
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
        <div className="my-4 bg-white hover:bg-slate-100 transition duration-200 p-4 rounded-xl">
          <button
            className="w-full text-left"
            onClick={() => router.push("/profile/wish")}
          >
            관심목록
          </button>
        </div>
        <div className="my-4 bg-white hover:bg-slate-100 transition duration-200 p-4 rounded-xl">
          <button
            className="w-full text-left"
            onClick={() => router.push("/profile/my-products")}
          >
            내 상품
          </button>
        </div>
      </div>
    </ProtectedPage>
  );
}
