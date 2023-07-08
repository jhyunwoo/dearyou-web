import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import pb from "@/lib/pocketbase"
import { useForm } from "react-hook-form"
import { StarIcon } from "@heroicons/react/24/outline"
import Layout from "@/components/Layout"
import HeadBar from "@/components/HeadBar"
import BottomBar from "@/components/BottomBar"
import { usePbAuth } from "@/contexts/AuthWrapper"
import { useSetRecoilState } from "recoil"
import { modalState } from "@/lib/recoil"

export default function MyReviews() {
  const router = useRouter()
  const { productId } = router.query
  const [rating, setRating] = useState(0)
  const [chatedUsers, setChatedUsers] = useState([])
  const [selectedUser, setSelectedUset] = useState()

  const setModal = useSetRecoilState(modalState)

  const { user } = usePbAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  async function onSubmit(data) {
    if (selectedUser && rating) {
      const reviewData = {
        product: productId,
        from: pb.authStore.model?.id,
        to: selectedUser.id,
        comment: data.review,
        rate: rating,
      }
      const sendReview = await pb.collection("reviews").create(reviewData)
      console.log(sendReview)
      const findChat = await pb.collection("chats").getFullList({
        filter: `(user1="${user.id}"&&user2="${selectedUser.id}")||user2="${user.id}"&&user1="${selectedUser.id}"`,
      })
      console.log(findChat)
      const requestData = {
        chat: findChat[0].id,
        sender: user.id,
        receiver: selectedUser.id,
        message: "나눔에 대해 리뷰해주세요.",
        isRead: false,
        reviewProduct: productId,
      }
      const sendReviewRequest = await pb
        .collection("messages")
        .create(requestData)
      const updateChat = await pb
        .collection("chats")
        .update(findChat[0].id, { messages: sendReviewRequest.id })
      console.log(updateChat)
      const closeProduct = await pb
        .collection("products")
        .update(productId, { soldDate: new Date(), buyer: selectedUser.id })
      router.push("/")
    } else if (selectedUser && !rating) {
      setModal("별점을 입력해주세요.")
    } else if (!selectedUser && rating) {
      setModal("나눔한 사람을 선택해주세요.")
    } else {
      setModal("나눔한 사람과 별점을 입력해주세요.")
    }
  }

  useEffect(() => {
    async function getChatedUsers() {
      if (!user?.id) return
      let userList = []
      const record = await pb.collection("chats").getFullList({
        filter: `user1="${user?.id}"||user2="${user?.id}"`,
        expand: "user1,user2",
      })
      record.map((data) => {
        if (data.user1 === user?.id) {
          userList.push(data.expand.user2)
        } else if (data.user2 === user?.id) {
          userList.push(data.expand.user1)
        }
      })
      console.log(userList)
      setChatedUsers(userList)
    }
    getChatedUsers()
  }, [user?.id])

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
      <div>
        <div className="text-lg font-semibold my-2 dark:text-white">
          나눔(거래)한 사람
        </div>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-auto scrollbar-hide">
          {chatedUsers?.map((data, key) => (
            <button
              key={key}
              onClick={() => setSelectedUset(data)}
              className={`${
                selectedUser === data
                  ? "bg-amber-500 text-white dark:text-black"
                  : "bg-white dark:bg-gray-900 hover:bg-amber-100 "
              } p-2 px-4 rounded-lg transition duration-200`}
            >
              <div className="dark:text-white">{data.name}</div>
            </button>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col mt-4">
        <div className="text-lg font-semibold my-2 dark:text-white">만족도</div>
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
          className="p-2 px-4 h-48 rounded-lg outline-none w-full dark:bg-slate-800 dark:text-white"
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
    </Layout>
  )
}
