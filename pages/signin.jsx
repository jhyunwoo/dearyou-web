import { useRouter } from "next/router";
import pb from "../lib/pocketbase";
import { usePbAuth } from "@/contexts/AuthWrapper";
import Loading from "@/components/Loading";
import { useState, useEffect } from "react";

export default function SignIn() {
  const router = useRouter();
  const { setUserData } = usePbAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [startLogin, setStartLogin] = useState(false);

  async function kakaoLogin() {
    setIsLoading(true);
    setStartLogin(true);
    try {
      const authData = await pb
        .collection("users")
        .authWithOAuth2({ provider: "kakao" });
      if (authData.token) {
        setUserData(authData.record);
        await router?.replace("/");
      }
    } catch {
      router.reload();
      alert("로그인을 다시 시도해주세요.");
    }
    setIsLoading(false);
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 flex justify-center items-center">
      {isLoading ? <Loading /> : ""}
      <div className="bg-white max-w-xl shadow-xl p-8 py-16 flex flex-col w-5/6 space-y-2">
        <div className="text-3xl font-bold mx-auto m-4">로그인</div>
        <button
          onClick={kakaoLogin}
          className="bg-yellow-400 shadow-lg p-2 px-4 rounded-lg flex hover:bg-yellow-300 transition duration-200"
        >
          <div className="font-semibold text-base m-auto text-white">
            카카오로 로그인
          </div>
        </button>
        {startLogin ? (
          <div className={"mt-4 text-center"}>
            사파리에서 로그인이 되지 않는다면 설정 {">"} Safari {">"} 팝업
            차단을 해재해주세요.
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
