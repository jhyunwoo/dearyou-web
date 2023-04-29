import BottomBar from "@/components/BottomBar";
import ProtectedPage from "@/components/ProtectedPage";

export default function Profile() {
  return (
    <ProtectedPage>
      <BottomBar />
      <div>Profile Page</div>
    </ProtectedPage>
  );
}
