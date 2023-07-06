import Image from "next/image";
import pb from "@/lib/pocketbase";

/** 자율위원 전용 페이지 -> 권한 확인 */
export default function AutonomyPage(props) {
  const autonomy = pb.authStore.model.autonomy;
  if (!autonomy) {
    return (
      <div className="w-full h-screen bg-slate-50 flex justify-center items-center p-4">
        <div className="p-2 m-4 text-center">
          <Image
            className="mx-auto my-4"
<<<<<<< HEAD
            src="/favicon.ico"
=======
            src="./favicon.png"
>>>>>>> develop
            width={100}
            height={100}
            alt="logo"
          />
          <div className="text-lg">액세스 권한이 없습니다.</div>
          <div className="">
            이 페이지는 자율위원 및 운영진만 접근할 수 있는 페이지입니다.
            자율위원이시라면 관리자에게 권한을 요청해 주세요.
          </div>
        </div>
      </div>
    );
  } else {
    return <>{props.children}</>;
  }
}
