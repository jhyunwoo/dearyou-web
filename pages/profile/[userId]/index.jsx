import BottomBar from "@/components/BottomBar";
import HeadBar from "@/components/HeadBar";
import Layout from "@/components/Layout";
import ProtectedPage from "@/components/ProtectedPage";
import { usePbAuth } from "@/contexts/AuthWrapper";
import pb from "@/lib/pocketbase";
import { FireIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Profile() {
  const router = useRouter();

  // profile 보일 user
  const userId = router.query["userId"];
  const [user, setUser] = useState(null);

  async function getUserRecord(){
    const record = await pb.collection("users")?.getOne(userId);
    setUser(record);
  }
  useEffect(() => {
    if(!router.isReady) return;
    getUserRecord();
  }, [router.isReady])

  return (
    <ProtectedPage>
      <BottomBar />
      <HeadBar title="프로필" />
      <Layout>
        <div className="bg-white w-full  p-4 flex flex-col hover:shadow-lg transidion duration-200">
        <div className="flex">
          {user?.avatar ? (
            <Image
              width={100}
              height={100}
              alt={"user avatar"}
              className="rounded-full w-24 h-24"
              src={`https://dearyouapi.moveto.kr/api/files/users/${user?.id}/${user?.avatar}?thumb=100x100`}
            />
          ) : (
            <div className="w-24 h-24 bg-slate-400 rounded-full"></div>
          )}
          <div className="ml-auto text-center">
            <div className="relative w-28 font-bold">
              품격 온도
              <FireIcon className="mx-auto w-20 h-20 stroke-amber-200"/>
              <div className="absolute w-full bottom-3">
                <div className="mx-auto text-4xl font-bold text-amber-500">
                  {user?.dignity}ºC
                </div>
              </div>
            </div>
          </div>
          </div>


          <div className="mt-4">
            <div className="text-xl font-bold">{user?.name}</div>
            <div>{user?.studentId}</div>
            <div>{user?.email}</div>
          </div>
        </div>
      </Layout>
    </ProtectedPage>
  );
}

