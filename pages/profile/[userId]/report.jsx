<<<<<<< HEAD
export default function report() {
  return <div>report page</div>;
}
=======
import BottomBar from "@/components/BottomBar";
import HeadBar from "@/components/HeadBar";
import Layout from "@/components/Layout";
import ProtectedPage from "@/components/ProtectedPage";
import { usePbAuth } from "@/contexts/AuthWrapper";
import pb from "@/lib/pocketbase";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function Report() {
  const currentUser = usePbAuth().user;
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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


  async function handleReport(data){
    if(data.reason === reportOptions[0]){
        alert("신고 사유를 선택하세요.");
        return;
    }

    const records = await pb.collection('reports').getFullList({
        sort: '-created',
    });
    for(let i = 0; i < records.length; i++){
        if(records[i].target === userId){
          const time_elapsed = (new Date() - new Date(records[i].created)) / 1000;

          if(time_elapsed <= 7200){
            alert("최근에 이 사용자를 이미 신고했습니다.");
            return;
          }
        }
    }

    // example create data
    const newRecord = {
        "target": `${userId}`,
        "reporter": `${currentUser.id}`,
        "reason": `${data.reason}`,
        "isHandled": false
    };

    await pb.collection('reports').create(newRecord);
    alert("신고가 접수되었습니다.");
    router.push(`/profile/${userId}`);
  }

  const reportOptions = [
    "* 신고 사유를 선택하세요 *",
    "부적절한 물건 등록",
    "금전 거래 시도",
    "비매너 채팅",
  ];
  return (
    <ProtectedPage>
      <Layout>
      <div className="fixed top-0 right-0 left-0 bottom-0 flex justify-center items-center bg-slate-50/50">
            <div className="relative m-2 p-6 rounded-lg border-2 w-4/5 bg-white">

                <div className="text-lg font-bold text-center">
                    {user?.name}님을 신고합니까?
                </div>
                <form
                  onSubmit={handleSubmit(handleReport)}
                  className="flex flex-col"
                >
                    <button
                        className="bg-red-400 hover:bg-red-500 transition duration-200  text-white p-2 px-12 rounded-full text-base font-semibold mt-4"
                        type="submit"
                    >
                        신고
                    </button>
                    <div className="text-lg font-semibold mt-4">
                        신고 사유
                    </div>
                    <select
                        {...register("reason", { required: true })}
                        className="p-2 rounded-lg outline-none ring-2 ring-amber-400 hover:ring-offset-2 transition duration-200 my-2"
                    >
                    {reportOptions.map((item, key) => (
                        <option key={key} value={item}>
                            {item}
                        </option>
                    ))}
                    </select>
                </form>
            </div>
        </div>
        </Layout>
      <BottomBar />
      <HeadBar title="프로필" />
          
    </ProtectedPage>
  );
}

>>>>>>> develop
