import { useEffect, useState } from "react"
import pb from "@/lib/pocketbase"
import Link from "next/link"
import { PencilSquareIcon, CheckBadgeIcon } from "@heroicons/react/24/outline"
import { HeartIcon } from "@heroicons/react/24/solid"
import { useRouter } from "next/router"
import getUploadedTime from "@/lib/getUploadedTime"
import { usePbAuth } from "@/contexts/AuthWrapper"
import ProtectedPage from "@/components/ProtectedPage"
import BottomBar from "@/components/BottomBar"
import Layout from "@/components/Layout"
import ProductImageView from "@/components/ProductImageView"

export const getServerSideProps = async (context) => {
  const { query } = context
  const { productId } = query
  return {
    props: {
      productId,
    },
  }
}

export default function ProductDetail({ productId }) {
  const [productInfo, setProductInfo] = useState("")
  const [userWish, setUserWish] = useState([])
  const autonomy = pb.authStore?.model?.autonomy

  const router = useRouter()

  useEffect(() => {
    async function getProductInfo() {
      const record = await pb.collection("products").getOne(productId, {
        expand: "seller",
      })
      if (record.isConfirmed || record.seller === pb.authStore.model.id) {
        setProductInfo(record)
      } else {
        setProductInfo(false)
      }
    }
    async function getUserWish() {
      const userInfo = await pb
        .collection("users")
        .getOne(pb.authStore.model.id)
      setUserWish(userInfo.wishes)
    }

    getProductInfo()
    getUserWish()
  }, [productId])

  //현재 사용자의 wishes에 product를 추가하는 버튼의 함수
  const currentUser = usePbAuth().user

  async function controlWish() {
    try {
      if (userWish.includes(productId)) {
        const originWishes = userWish
        const updatedWishes = originWishes.filter((wish) => wish !== productId)
        setUserWish(updatedWishes)
        const updatedUser = await pb
          .collection("users")
          .update(pb.authStore.model?.id, {
            wishes: updatedWishes,
          })
      } else {
        setUserWish([...userWish, productId])
        const originWishes = userWish
        const updatedUser = await pb
          .collection("users")
          .update(currentUser.id, {
            wishes: [...originWishes, productId],
          })
      }
    } catch (error) {
      console.error("Error adding product to wishlist:", error)
    }
  }

  /** 판매자와 채팅 버튼 누를 때 호출 */
  async function goToChat() {
    const checkChat = await pb.collection("chats").getFullList({
      // 해당 판매자, 구매자의 채팅 기록이 있는지 확인
      filter: `(user1.id="${pb.authStore.model.id}"&&user2.id="${productInfo.expand.seller.id}")||
              (user2.id="${pb.authStore.model.id}"&&user1.id="${productInfo.expand.seller.id}")`,
      expand: "messages",
    })

    if (checkChat.length > 0) {
      const createMessage = await pb.collection("messages").create({
        chat: checkChat[0].id,
        sender: pb.authStore.model.id,
        receiver: productInfo.seller,
        message: `안녕하세요. "${productInfo.name}"에 대해 문의하고 싶어요!`,
        isRead: false,
        product: productInfo.id,
      })
      const updateChat = await pb
        .collection("chats")
        .update(checkChat[0].id, { messages: createMessage.id })
      router.push(`/chats/${createMessage.chat}`)
    } else {
      const createNewChat = await pb
        .collection("chats")
        .create({ user1: pb.authStore.model.id, user2: productInfo.seller })
      const createMessage = await pb.collection("messages").create({
        chat: createNewChat.id,
        sender: pb.authStore.model.id,
        receiver: productInfo.seller,
        message: `안녕하세요. "${productInfo.name}"에 대해 문의하고 싶어요!`,
        isRead: false,
        product: productInfo.id,
      })
      const updateChat = await pb
        .collection("chats")
        .update(createNewChat.id, { messages: createMessage.id })
      router.push(`/chats/${createMessage.chat}`)
    }
  }

  async function onProductHide() {
    if (!autonomy) return null

    if (
      window.confirm(`자율위원의 권한으로 물품을 조회할 수 없도록 숨길까요?
숨긴 물품은 승인 페이지에서 다시 승인할 수 있습니다.
꼭 필요한 상황에서만 이 기능을 사용해 주세요.`)
    ) {
      let newInfo = productInfo
      newInfo.rejectedReason = "임시로 숨김 처리되었습니다."
      newInfo.isConfirmed = false
      newInfo.confirmedBy = currentUser.id

      await pb.collection("products").update(productInfo.id, newInfo)
      alert("물품을 숨겼습니다.")
      router.replace("/")
    }
  }

  function CloseProductButton() {
    return (
      <div className="w-full  p-2 text-white font-bold flex justify-center items-center">
        <button
          onClick={() => router.push(`/products/review/${productInfo.id}`)}
          className={`p-2 px-6 rounded-full ${
            productInfo?.soldDate
              ? "bg-gray-400"
              : "bg-blue-400 hover:bg-blue-500 transition duration-200"
          }`}
          disabled={productInfo.soldDate ? true : false}
        >
          나눔 완료
        </button>
      </div>
    )
  }
  function GoToChatButton() {
    return (
      <div className="w-full  p-2 text-white font-bold flex justify-center items-center">
        <button
          onClick={goToChat}
          className={`p-2 px-6 rounded-full ${
            productInfo?.soldDate
              ? "bg-gray-400"
              : "bg-amber-400 hover:bg-amber-500 transition duration-200"
          }`}
          disabled={productInfo.soldDate ? true : false}
        >
          &apos;{productInfo.expand.seller?.name}&apos;님에게 채팅 문의
        </button>
      </div>
    )
  }
  // (자율위원 전용) 물품 숨기기 버튼
  function HideProductButton() {
    if (!autonomy) return null

    return (
      <div className="w-full text-white font-bold flex justify-center items-center">
        <button
          className={`p-2 px-6 rounded-full ${"bg-red-400 hover:bg-red-500 transition duration-200"}`}
          onClick={onProductHide}
        >
          <CheckBadgeIcon className="w-6 h-6 mr-2" />
          물품 숨기기
        </button>
      </div>
    )
  }

  return (
    <ProtectedPage>
      {productInfo ? (
        <div className="w-full min-h-screen bg-slate-50 sm:flex sm:flex-col sm:justify-center sm:items-center sm:pb-24">
          {productInfo ? (
            <div className="relative sm:flex sm:bg-white sm:p-4 md:p-8 sm:rounded-xl sm:shadow-xl">
              <ProductImageView
                productInfo={productInfo}
                productId={productId}
              />
              <div className="sm:flex sm:flex-col sm:w-52 sm:pl-4 md:w-80 lg:w-96">
                <div className="p-4 sm:p-2 flex flex-col ">
                  <div className="pb-2 border-b-2 flex flex-col ">
                    <div className="flex justify-between">
                      <div className="text-xl font-bold">
                        {productInfo.name}
                      </div>
                      <div className="flex">
                        <div className="flex items-end">
                          <Link
                            href={`/profile/${productInfo.expand.seller?.id}`}
                            className="text-lg font-semibold text-black"
                          >
                            {productInfo.expand.seller?.name} (
                            {productInfo.expand.seller?.studentId})
                          </Link>

                          {currentUser?.id ===
                            productInfo?.expand?.seller?.id &&
                          !productInfo?.rejectedReason ? (
                            <Link href={`/products/update/${productId}`}>
                              <PencilSquareIcon className="ml-2 w-8 h-8 bg-amber-500 hover:bg-amber-600 transition duration-200 p-1 rounded-md text-white" />
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="ml-auto text-xl font-bold text-slate">
                        {productInfo.isConfirmed ? (
                          productInfo.soldDate ? (
                            <span className="text-amber-500">나눔 완료</span>
                          ) : (
                            <span className="text-amber-400">나눔 중</span>
                          )
                        ) : productInfo.rejectedReason ? (
                          <span className="text-red-500">반려됨</span>
                        ) : (
                          <span className="text-amber-500">승인 대기 중</span>
                        )}
                      </div>
                      <div className="text-lg mt-4 mb-2 border-b-2">
                        {productInfo.explain}
                      </div>
                      <div className="flex items-center">
                        <div className="">종류: {productInfo.type}</div>
                        <div className="mr-2 ml-auto text-sm text-slate-500">
                          {getUploadedTime(productInfo.created)} 등록
                        </div>
                        {productInfo.isConfirmed ? (
                          <button onClick={controlWish}>
                            {userWish?.includes(productId) ? (
                              <HeartIcon className="w-8 h-8 fill-red-500" />
                            ) : (
                              <HeartIcon className="w-8 h-8 fill-red-100" />
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {productInfo.isConfirmed ? (
                    currentUser?.id === productInfo?.expand?.seller?.id ? (
                      <CloseProductButton />
                    ) : (
                      <div>
                        <GoToChatButton />
                        <HideProductButton />
                      </div>
                    )
                  ) : productInfo.rejectedReason ? (
                    <div className="text-red-500">
                      물품 등록 신청이 반려되었습니다. (사유:{" "}
                      {productInfo.rejectedReason})
                    </div>
                  ) : (
                    <div className="text-amber-500">
                      물품 등록 승인 대기 중입니다.
                    </div>
                  )}
                  <div className="w-full h-16 sm:h-0"></div>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        <Layout>
          <div className="flex justify-center items-center m-auto text-xl font-semibold text-slate-500">
            <div>정보가 없습니다.</div>
          </div>
        </Layout>
      )}

      <BottomBar />
    </ProtectedPage>
  )
}
