import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import pb from "../lib/pocketbase";
import { usePbAuth } from "../contexts/AuthWrapper";
import Loading from "@/components/Loading";

export default function SignIn() {
  const { setUserData, kakaoSignIn } = usePbAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  /** 사용자 데이터를 userData에 저장하고 홈 페이지로 리다이렉트 */
  const storeUserAndRedirect = (user) => {
    setUserData(user);
    router.replace("/");
  };

  useEffect(() => {
    const localAuthProvider = JSON.parse(localStorage.getItem("provider"));
    const params = new URL(location.href).searchParams;
    const redirectUrl = `${location.origin}/signin`;
    const code = params.get("code");

    // 리다이렉트 되지 않으면 로그인 취소
    if (
      !localAuthProvider ||
      !code ||
      localAuthProvider.state !== params.get("state")
    )
      return;
    setIsLoading(true);
    pb.collection("users")
      .authWithOAuth2(
        localAuthProvider.name,
        code,
        localAuthProvider.codeVerifier,
        redirectUrl,
      )
      .then(async (response) => {
        const user = await pb.collection("users").getOne(response.record.id);

        // skip profile updation if user already exists or user data from OAuth providers haven't changed
        if (
          user.name &&
          user.avatarUrl &&
          user.name === response.meta?.name &&
          user.avatarUrl === response.meta?.avatarUrl
        ) {
          storeUserAndRedirect(user);
        } else
          pb.collection("users")
            .update(response.record.id, {
              name: response.meta?.name,
              avatarUrl: response.meta?.avatarUrl,
            })
            .then((res) => {
              storeUserAndRedirect(res);
            })
            .catch((err) => {
              console.error(err);
            });
      })
      .catch((err) => {
        console.error(err);
      });
    setIsLoading(false);
  }, []);
  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 flex justify-center items-center">
      {isLoading ? <Loading /> : ""}
      <div className="bg-white max-w-xl shadow-xl p-8 py-16 flex flex-col w-5/6 space-y-2">
        <div className="text-3xl font-bold mx-auto m-4">로그인</div>
        <button
          onClick={kakaoSignIn}
          className="bg-yellow-400 shadow-lg p-2 px-4 rounded-lg flex hover:bg-yellow-300 transition duration-200"
        >
          <div className="font-semibold text-base m-auto text-white">
            카카오로 로그인
          </div>
        </button>
      </div>
    </div>
  );
}
