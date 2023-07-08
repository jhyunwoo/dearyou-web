import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import pb from "@/lib/pocketbase"
import { useForm } from "react-hook-form"
import { StarIcon } from "@heroicons/react/24/outline"
import Layout from "@/components/Layout"
import HeadBar from "@/components/HeadBar"
import BottomBar from "@/components/BottomBar"
import { useSetRecoilState } from "recoil"
import { modalState } from "@/lib/recoil"

export default function MyReviews() {
  const router = useRouter()
  const { productId, sellerId } = router.query
  const [rating, setRating] = useState(0)
  const [seller, setSeller] = useState()

  const setModal = useSetRecoilState(modalState)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  async function onSubmit(data) {
    if (rating) {
      const reviewData = {
        product: productId,
        to: sellerId,
        from: pb.authStore.model?.id,
        comment: data.review,
        rate: rating,
      }

      const record = await pb.collection("reviews").create(reviewData)
      const updateSeller = await pb
        .collection("users")
        .update(seller.id, { dignity: seller.dignity + rating })

      router.push("/")
    } else {
      setModal("후기를 입력해주세요.")
    }
  }

  useEffect(() => {
    async function getSellerInfo() {
      const sellerInfo = await pb.collection("users").getOne(sellerId)
      setSeller(sellerInfo)
    }
    getSellerInfo()
  }, [sellerId])

  function Star({ idx }) {
    return (
      <StarIcon
        type="button"
        onClick={() => setRating(idx)}
        className={`p-1 px-4 w-full rounded-lg h-20 ${
          rating >= idx ? "stroke-amber-500 fill-amber-500" : "stroke-amber-500"
        }  transition duration-200`}
      />
    )
  }

  return (
    <Layout>
      <HeadBar title="나눔 후기 남기기" />
      <BottomBar />
      {sellerId === pb.authStore.model?.id ? (
        <div className="dark:text-white">이미 후기를 남기셨습니다.</div>
      ) : (
        <>
          <div>
            <div className="text-lg font-semibold my-2 dark:text-white">
              거래한 사람: {seller?.name}
            </div>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col mt-4"
          >
            <div className="text-lg font-semibold my-2 dark:text-white">
              거래 만족도
            </div>
            <div className="flex w-full justify-around space-x-1">
              <Star idx={1} />
              <Star idx={2} />
              <Star idx={3} />
              <Star idx={4} />
              <Star idx={5} />
            </div>
            <div className="mt-4 text-lg font-semibold my-2 dark:text-white">
              후기
            </div>
            <textarea
              className="p-2 px-4 h-48 rounded-lg outline-none w-full dark:bg-gray-800 dark:text-white"
              {...register("review", {
                required: { value: true, message: "후기를 입력해주세요." },
              })}
            />
            {errors.review && (
              <div className="dark:text-white">{errors.review.message}</div>
            )}
            <button
              type="submit"
              className="bg-amber-400 p-2 rounded-full hover:bg-amber-500 transition duration-200 text-white dark:text-black font-semibold mt-4 text-lg"
            >
              제출
            </button>
          </form>
        </>
      )}
    </Layout>
  )
}
