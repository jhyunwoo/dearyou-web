import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import pb from "../lib/pocketbase";
import { usePbAuth } from "../contexts/AuthWrapper";

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
  }, []);
  return (
    <div>
      <div>SignIn Page</div>
      <button onClick={googleSignIn}>Sign in with Google</button>
      <button onClick={appleSignIn}>Sign in with Apple</button>
    </div>
  );
}
