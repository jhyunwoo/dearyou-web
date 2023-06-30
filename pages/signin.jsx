import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import pb from "../lib/pocketbase";
import { usePbAuth } from "../contexts/AuthWrapper";
import Loading from "@/components/Loading";
import Image from "next/image";

export default function SignIn() {
  const { setUserData, kakaoSignIn, appleSignIn } = usePbAuth();
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
      .authWithOAuth2Code(
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
        } else storeUserAndRedirect(user);
        // pb.collection("users")
        //   .update(response.record.id, {
        //     name: response.meta?.name,
        //     avatarUrl: response.meta?.avatarUrl,
        //   })
        //   .then((res) => {
        //     storeUserAndRedirect(res);
        //   })
        //   .catch((err) => {
        //     console.error(err);
        //   });
      })
      .catch((err) => {
        console.error(err);
      });
    setIsLoading(false);
  }, []);
  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 flex justify-center items-center">
      {isLoading ? <Loading /> : ""}
      <div className="bg-white max-w-xl shadow-xl p-8 py-16 flex flex-col w-5/6 space-y-2 ">
        <div className="text-3xl font-bold mx-auto m-4">로그인</div>
        <button
          onClick={kakaoSignIn}
          className="bg-[#ffe812] shadow-lg  p-2 px-4 rounded-lg  transition duration-200 flex justify-center items-center"
        >
          <Image
            src={"/kakao-logo.png"}
            className=""
            width={25}
            height={25}
            alt={"logo"}
          />
          <div className="ml-4 font-semibold text-base text-white">
            카카오로 로그인
          </div>
        </button>
        <button
          onClick={appleSignIn}
          className="bg-black mt-4 text-white shadow-lg p-2 px-4 rounded-lg flex justify-center items-center"
        >
          <Image
            src={"/apple_logo.png"}
            className=""
            width={20}
            height={20}
            alt={"logo"}
          />
          <div className="font-semibold text-base ml-4">애플로 로그인</div>
        </button>
      </div>
    </div>
  );
}
