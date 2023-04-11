import Link from "next/link";
import { usePbAuth } from "../contexts/AuthWrapper";

/** 로그인 되어 있으면 하위 JSX를 보여주고 로그인 되어 있지 않으면 로그인 페이지로 이동하는 링크를 보여줌 */
/** 또한, 로그인은 되어 있으나 학번이 등록되지 않았으면 학번 이름 등록 페이지로 이동*/
export default function ProtectedPage(props) {
  const { user } = usePbAuth();
  if (!user) { /** 로그인이 돼있지 않을 때 */
    return (
      <div className="w-full h-screen bg-slate-100">
        <div className="text-2xl font-bold">로그인 후 이용 가능한 페이지입니다.</div>
        <Link href={"/signin"}>Sign In Page</Link>
      </div>
    );
  } else if(user.studentId === 0 || user.studentId == null) { /** 학번 정보가 없을 때 */
    return (
      <div className="w-full h-screen bg-slate-100">
      <div className="text-2xl font-bold">학번과 이름을 등록한 후 이용 가능한 페이지입니다.</div>
        <div><Link href={"/profile/add-info"}>학번/이름 설정 페이지</Link></div>
        <div><Link href={"/signin"}>Sign In Page</Link></div>
      </div>
    )
  }
  else{
    return <>{props.children}</>;
  }
}
