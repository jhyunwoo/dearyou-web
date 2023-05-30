import Link from "next/link";
import Image from "next/image";
import pb from "@/lib/pocketbase";
import { usePbAuth } from "../contexts/AuthWrapper";

/** 로그인 되어 있으면 하위 JSX를 보여주고 로그인 되어 있지 않으면 로그인 페이지로 이동하는 링크를 보여줌 */
/** 또한, 로그인은 되어 있으나 학번이 등록되지 않았으면 학번 이름 등록 페이지로 이동*/
export default function AutonomyPage(props) {
  const autonomy = pb.authStore.model.autonomy;
  if(!autonomy){
    return (
        <div className="w-full h-screen bg-slate-50 flex justify-center items-center p-4">
            <div className="p-2 m-4 text-center">
                    <Image
                    className="mx-auto my-4"
                    src="./favicon.ico"
                    width={100}
                    height={100}
                    />
                <div className="text-lg">액세스 권한이 없습니다.</div>
                <div className="">이 페이지는 자율위원 및 운영진만 접근할 수 있는 페이지입니다. 자율위원이시라면 관리자에게 권한을 요청해 주세요.</div>
            </div>
        </div>
    )
  }
  else {
    return <>{props.children}</>;
  }
}
