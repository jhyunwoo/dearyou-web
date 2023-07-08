import { useEffect, useState } from "react"
import pb from "@/lib/pocketbase"
import Layout from "@/components/Layout"
import HeadBar from "@/components/HeadBar"
import BottomBar from "@/components/BottomBar"

export default function MyReviews() {
  const [reviewsTo, setReviewsTo] = useState([])
  const [reviewsFrom, setReviewsFrom] = useState([])

  useEffect(() => {
    async function getMyReviews() {
      let reviews = await pb.collection("reviews").getFullList({
        filter: `to.id="${pb.authStore.model?.id}"`,
        expand: "from",
      })
      setReviewsFrom(reviews)
      reviews = await pb.collection("reviews").getFullList({
        filter: `from.id="${pb.authStore.model?.id}"`,
        expand: "to",
      })
      setReviewsTo(reviews)
    }
    getMyReviews()
  }, [])

  return (
    <Layout>
      <HeadBar title="내 나눔 후기" />
      <BottomBar />
      <div className="mt-2 w-full grid grid-cols-1 gap-2">
        <div className="text-lg dark:text-white">내가 받은 후기</div>
        {reviewsFrom.map((data, key) => (
          <div
            key={key}
            className="flex flex-col bg-white dark:bg-gray-900 p-2 rounded-md shadow-md"
          >
            <div className="font-base text-slate-700 ml-2 dark:text-slate-200">
              from. {data?.expand?.from?.name}
            </div>
            <div className="mt-1 text-lg font-semibold flex">
              <div className="text-white  bg-amber-400 px-2 rounded-full mx-2 dark:text-black">
                {data?.rate}
              </div>
              <div className="dark:text-white">{data.comment}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 w-full grid grid-cols-1 gap-2 pb-8">
        <div className="text-lg dark:text-white">내가 남긴 후기</div>
        {reviewsTo.map((data, key) => (
          <div
            key={key}
            className="flex flex-col bg-white dark:bg-gray-900 p-2 rounded-md shadow-md"
          >
            <div className="font-base text-slate-700 dark:text-slate-200 ml-2">
              to. {data?.expand?.to?.name}
            </div>
            <div className="mt-1 text-lg font-semibold flex">
              <div className="text-white dark:text-black bg-amber-400 px-2 rounded-lg mx-2">
                {data?.rate}
              </div>
              <div className="dark:text-white">{data.comment}</div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
