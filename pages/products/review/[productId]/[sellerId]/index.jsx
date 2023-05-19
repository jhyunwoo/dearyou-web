import Layout from "@/components/Layout";
import ProtectedPage from "@/components/ProtectedPage";
import HeadBar from "@/components/HeadBar";
import BottomBar from "@/components/BottomBar";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";

export default function MyReviews() {
  const router = useRouter();
  const { productId, sellerId } = router.query;
  const [rating, setRating] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function onSubmit(data) {
    if (rating) {
      console.log(data, sellerId, rating);
      const sellerInfo = await pb.collection("users").getOne(sellerId);
      const reviewData = {
        product: productId,
        seller: sellerId,
        buyer: pb.authStore.model?.id,
        comment: data.review,
        rate: rating,
      };

      const record = await pb.collection("reviews").create(reviewData);
      const updatedSeller = await pb
        .collection("users")
        .update(sellerId, { dignity: sellerInfo.dignity + rating });

      router.push("/");
    } else {
      alert("후기를 입력해주세요.");
    }
  }

  return (
    <ProtectedPage>
      <HeadBar title="거래 후기 남기기" />
      <BottomBar />
      <Layout>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col mt-4">
          <div className="text-lg font-semibold my-2">거래 만족도</div>
          <div className="flex w-full justify-around space-x-1">
            <button
              type="button"
              onClick={() => setRating(1)}
              className={`p-1 px-4 w-full rounded-lg ${
                rating === 1
                  ? "bg-amber-500 text-white"
                  : "bg-amber-50 hover:bg-amber-300 hover:text-white"
              }  transition duration-200`}
            >
              1
            </button>
            <button
              type="button"
              onClick={() => setRating(2)}
              className={`p-1 px-4 w-full rounded-lg ${
                rating === 2
                  ? "bg-amber-500 text-white"
                  : "bg-amber-50 hover:bg-amber-300 hover:text-white"
              }  transition duration-200`}
            >
              2
            </button>
            <button
              type="button"
              onClick={() => setRating(3)}
              className={`p-1 px-4 w-full rounded-lg ${
                rating === 3
                  ? "bg-amber-500 text-white"
                  : "bg-amber-50 hover:bg-amber-300 hover:text-white"
              }  transition duration-200`}
            >
              3
            </button>
            <button
              type="button"
              onClick={() => setRating(4)}
              className={`p-1 px-4 w-full rounded-lg ${
                rating === 4
                  ? "bg-amber-500 text-white"
                  : "bg-amber-50 hover:bg-amber-300 hover:text-white"
              }  transition duration-200`}
            >
              4
            </button>
            <button
              type="button"
              onClick={() => setRating(5)}
              className={`p-1 px-4 w-full rounded-lg ${
                rating === 5
                  ? "bg-amber-500 text-white"
                  : "bg-amber-50 hover:bg-amber-300 hover:text-white"
              }  transition duration-200`}
            >
              5
            </button>
          </div>
          <div className="mt-4 text-lg font-semibold my-2">후기</div>
          <textarea
            className="p-2 px-4 h-48 rounded-lg outline-none w-full"
            {...register("review", {
              required: { value: true, message: "후기를 입력해주세요." },
            })}
          />
          {errors.review && <div>{errors.review.message}</div>}
          <button
            type="submit"
            className="bg-amber-400 p-2 rounded-full hover:bg-amber-500 transition duration-200 text-white font-semibold mt-4 text-lg"
          >
            제출
          </button>
        </form>
      </Layout>
    </ProtectedPage>
  );
}
