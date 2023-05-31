import Layout from "@/components/Layout";
import ProtectedPage from "@/components/ProtectedPage";
import HeadBar from "@/components/HeadBar";
import BottomBar from "@/components/BottomBar";
import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    async function getMyReviews() {
      const reviews = await pb.collection("reviews").getFullList({
        filter: `to.id="${pb.authStore.model?.id}"`,
        expand: "from",
      });
      setReviews(reviews);
    }
    getMyReviews();
  }, []);

  return (
    <ProtectedPage>
      <HeadBar title="내 거래 후기" />
      <BottomBar />
      <Layout>
        <div className="w-full grid grid-cols-1 gap-2">
          {reviews.map((data, key) => (
            <div
              key={key}
              className="flex flex-col bg-white p-2 rounded-md shadow-md"
            >
              <div className="font-base text-slate-700">
                {data?.expand?.from?.name}
              </div>
              <div className="mt-1 text-lg font-semibold flex">
                <div className="text-white bg-amber-400 px-2 rounded-full mx-2">
                  {data?.rate}
                </div>
                <div>{data.comment}</div>
              </div>
            </div>
          ))}
        </div>
      </Layout>
    </ProtectedPage>
  );
}
