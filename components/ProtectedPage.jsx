import Link from "next/link";
import { usePbAuth } from "../contexts/AuthWrapper";

export default function ProtectedPage(props) {
  const { user, signOut } = usePbAuth();
  if (!user) {
    return (
      <div>
        <Link href={"/signin"}>Sign In Page</Link>
      </div>
    );
  } else {
    return props.chlidren;
  }
}
