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
  const { productId } = router.query;
  const [rating, setRating] = useState(0);
  const [chatedUsers, setChatedUsers] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function onSubmit(data) {
    console.log(data);
  }

  useEffect(() => {
    async function getChatedUsers() {
      let userList = [];
      const record = await pb
        .collection("users")
        .getOne(pb.authStore.model?.id, {
          expand: "chats(buyer).seller, chats(seller).buyer",
        });

      console.log(record);
    }
    getChatedUsers();
  }, []);

  return (
    <ProtectedPage>
      <HeadBar title="거래 후기 남기기" />
      <BottomBar />
      <Layout>
        <div>My Review Page</div>
        <div>{productId}</div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex">
            <button
              type="button"
              onClick={() => setRating(1)}
              className={`p-1 px-2 rounded-lg ${
                rating === 1 ? "bg-amber-500 text-white" : "bg-amber-50"
              } hover:bg-amber-300 hover:text-white transition duration-200`}
            >
              1점
            </button>
            <button
              type="button"
              onClick={() => setRating(2)}
              className={`p-1 px-2 rounded-lg ${
                rating === 2 ? "bg-amber-500 text-white" : "bg-amber-50"
              } hover:bg-amber-300 hover:text-white transition duration-200`}
            >
              2점
            </button>
            <button
              type="button"
              onClick={() => setRating(3)}
              className={`p-1 px-2 rounded-lg ${
                rating === 3 ? "bg-amber-500 text-white" : "bg-amber-50"
              } hover:bg-amber-300 hover:text-white transition duration-200`}
            >
              3점
            </button>
            <button
              type="button"
              onClick={() => setRating(4)}
              className={`p-1 px-2 rounded-lg ${
                rating === 4 ? "bg-amber-500 text-white" : "bg-amber-50"
              } hover:bg-amber-300 hover:text-white transition duration-200`}
            >
              4점
            </button>
            <button
              type="button"
              onClick={() => setRating(5)}
              className={`p-1 px-2 rounded-lg ${
                rating === 5 ? "bg-amber-500 text-white" : "bg-amber-50"
              } hover:bg-amber-300 hover:text-white transition duration-200`}
            >
              5점
            </button>
          </div>
          <div>후기</div>
          <input {...register("review", { required: true })} />
        </form>
      </Layout>
    </ProtectedPage>
  );
}
