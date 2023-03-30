import Link from "next/link";
import { usePbAuth } from "../contexts/AuthWrapper";

/** 로그인 되어 있으면 하위 JSX를 보여주고 로그인 되어 있지 않으면 로그인 페이지로 이동하는 링크를 보여줌 */
export default function ProtectedPage(props) {
  const { user } = usePbAuth();
  if (!user) {
    return (
      <div className="w-full h-screen bg-slate-100">
        <Link href={"/signin"}>Sign In Page</Link>
      </div>
    );
  } else {
    return <>{props.children}</>;
  }
}
