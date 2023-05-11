import { useRouter } from "next/router";
import { useEffect } from "react";
import pb from "../lib/pocketbase";
import { usePbAuth } from "../contexts/AuthWrapper";
import Image from "next/image";
export default function SignIn() {
  const { setUserData, googleSignIn, appleSignIn } = usePbAuth();

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
        if (user.name) {
          storeUserAndRedirect(user);
        } else
          pb.collection("users")
            .update(response.record.id, {
              name: response.meta?.name,
              avatar: response.meta?.avatarUrl,
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
  }, []);
  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 flex justify-center items-center">
      <div className="bg-white shadow-xl p-8 flex flex-col w-5/6">
        <div className="text-3xl font-bold mx-auto m-4">로그인</div>
        <button
          onClick={googleSignIn}
          className="bg-white shadow-lg p-2 px-4 rounded-lg flex"
        >
          <Image
            src={"/google_logo.png"}
            className="my-auto"
            width={25}
            height={25}
            alt={"logo"}
          />
          <div className="font-semibold text-base m-auto">구글로 로그인</div>
        </button>
        {/* <button
          onClick={appleSignIn}
          className="bg-black mt-4 text-white shadow-lg p-2 px-4 rounded-lg flex"
        >
          <Image
            src={"/apple_logo.png"}
            className="my-auto"
            width={23}
            height={23}
            alt={"logo"}
          />
          <div className="font-semibold text-base m-auto">애플로 로그인</div>
        </button> */}
      </div>
    </div>
  );
}
