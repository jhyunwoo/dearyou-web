import Link from "next/link";
import Image from "next/image";
import pb from "@/lib/pocketbase";
import { usePbAuth } from "../contexts/AuthWrapper";

/** 개발자 전용 페이지 -> 권한 확인 */
export default function DeveloperPage(props) {
  const permission = pb.authStore.model?.logPermission;
  if (!permission) {
    return (
      <div className="w-full h-screen bg-slate-50 flex justify-center items-center p-4">
        <div className="p-2 m-4 text-center">
          <Image
            className="mx-auto my-4"
            src="./favicon.ico"
            width={100}
            height={100}
            alt="logo"
          />
          <div className="text-lg">액세스 권한이 없습니다.</div>
          <div className="">
            이 페이지는 개발자만 접근할 수 있는 페이지입니다.
          </div>
        </div>
      </div>
    );
  } else {
    return <>{props.children}</>;
  }
}
