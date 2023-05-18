import Layout from "@/components/Layout";
import ProtectedPage from "@/components/ProtectedPage";
import HeadBar from "@/components/HeadBar";
import BottomBar from "@/components/BottomBar";

export default function MyReviews() {
  return (
    <ProtectedPage>
      <HeadBar title="내 거래 후기" />
      <BottomBar />
      <Layout>
        <div>My Review Page</div>
      </Layout>
    </ProtectedPage>
  );
}
