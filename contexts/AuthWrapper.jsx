import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import pb from "../lib/pocketbase";

const AuthContext = createContext(null);

const AuthWrapper = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [googleAuthProvider, setGoogleAuthProvider] = useState(null);
  const [githubAuthProvider, setGithubAuthProvider] = useState(null);
  const [kakaoAuthProvider, setKakaoAuthProvider] = useState(null);
  const [appleAuthProvider, setAppleAuthProvider] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const authMethods = await pb
        .collection("users")
        .listAuthMethods()
        .then((methods) => methods)
        .catch((err) => {
          console.error(err);
        });

      if (authMethods)
        for (const provider of authMethods.authProviders) {
          if (provider.name === "google") setGoogleAuthProvider(provider);
          if (provider.name === "github") setGithubAuthProvider(provider);
          if (provider.name === "kakao") setKakaoAuthProvider(provider);
          if (provider.name === "apple") setAppleAuthProvider(provider);
        }
    };

    initAuth();

    if (pb.authStore.model) setUserData(pb.authStore.model);
  }, []);

  const setUserData = (pbUser) => {
    const { id, name, email, username, studentId, avatarUrl } = pbUser;
    setUser({ id, name, email, username, studentId, avatarUrl });
  };

  const googleSignIn = () => {
    signOut();
    localStorage.setItem("provider", JSON.stringify(googleAuthProvider));
    const redirectUrl = `${location.origin}/signin`;
    const url = googleAuthProvider?.authUrl + redirectUrl;

    router.push(url);
  };
  const appleSignIn = () => {
    signOut();
    localStorage.setItem("provider", JSON.stringify(appleAuthProvider));
    const redirectUrl = `${location.origin}/signin`;
    const url = appleAuthProvider?.authUrl + redirectUrl;

    router.push(url);
  };

  const githubSignIn = () => {
    signOut();
    localStorage.setItem("provider", JSON.stringify(githubAuthProvider));
    const redirectUrl = `${location.origin}/signin`;
    const url = githubAuthProvider?.authUrl + redirectUrl;

    router.push(url);
  };

  const kakaoSignIn = () => {
    signOut();
    localStorage.setItem("provider", JSON.stringify(kakaoAuthProvider));
    const redirectUrl = `${location.origin}/signin`;
    const url = kakaoAuthProvider?.authUrl + redirectUrl;

    router.push(url);
  };

  const signOut = () => {
    setUser(null);
    pb.authStore.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        googleSignIn,
        githubSignIn,
        setUserData,
        signOut,
        kakaoSignIn,
        appleSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const usePbAuth = () => useContext(AuthContext);
export default AuthWrapper;
