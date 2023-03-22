import { useRouter } from "next/router";
import { useEffect } from "react";
import { usePbAuth } from "../contexts/AuthWrapper";

export default function Home() {
  const { user, signOut } = usePbAuth();
  const router = useRouter();

  function checkUserAuth() {
    if (!user) {
      router.replace("/signin");
    }
  }

  useEffect(() => checkUserAuth(), [user]);

  return (
    <div>
      <div className="w-full h-screen flex justify-center items-center text-4xl font-extrabold">
        DEARU Home Page
      </div>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
