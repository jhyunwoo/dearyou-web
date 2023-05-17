import { useRouter } from "next/navigation";
import pb from "../lib/pocketbase";
import { usePbAuth } from "../contexts/AuthWrapper";
import Image from "next/image";
import Loading from "@/components/Loading";
import { useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const { setUserData } = usePbAuth();
  const [isLoading, setIsLoading] = useState(false);

  async function kakaoLogin() {
    setIsLoading(true);
    try {
      const authData = await pb
        .collection("users")
        .authWithOAuth2({ provider: "kakao" });
      if (authData.token) {
        setUserData(authData.record);
        router.replace("/");
      }
    } catch {
      router.refresh();
      alert("로그인을 다시 시도해주세요.");
    }
    setIsLoading(false);
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 flex justify-center items-center">
      {isLoading ? <Loading /> : ""}
      <div className="bg-white max-w-xl shadow-xl p-8 py-16 flex flex-col w-5/6">
        <div className="text-3xl font-bold mx-auto m-4">로그인</div>
        <button
          onClick={kakaoLogin}
          className="bg-yellow-400 shadow-lg p-2 px-4 rounded-lg flex hover:bg-yellow-500 transition duration-200"
        >
          {/* <Image
            src={"/google_logo.png"}
            className="my-auto"
            width={25}
            height={25}
            alt={"logo"}
          /> */}
          <div className="font-semibold text-base m-auto text-white">
            카카오로 로그인
          </div>
        </button>
      </div>
    </div>
  );
}
