import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import pb from "@/lib/pocketbase"
import {
  CheckIcon,
  PencilSquareIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"
import getUploadedTime from "@/lib/getUploadedTime"
import { usePbAuth } from "@/contexts/AuthWrapper"
import ProtectedPage from "@/components/ProtectedPage"
import BottomBar from "@/components/BottomBar"
import Layout from "@/components/Layout"
import ProductImageView from "@/components/ProductImageView"
import { useSetRecoilState } from "recoil"
import { modalState } from "@/lib/recoil"

// productId를 서버사이드에서 수집
export const getServerSideProps = async (context) => {
  const { query } = context
  const { productId } = query
  return {
    props: {
      productId,
    },
  }
}

/** 반려 사유 리스트 */
const rejectOptions = [
  "* 반려 사유를 선택하세요 *",
  "제목 또는 설명이 불충분해요.",
  "올라온 사진만으로 물건의 상태를 확인하기 어려워요.",
  "물건의 종류가 잘못 설정되었어요.",
  "학교에서 거래되기에 부적절한 물건이에요.",
]

export default function ProductDetail({ productId }) {
  const router = useRouter()
  const { register, handleSubmit } = useForm()
  const setModal = useSetRecoilState(modalState)

  // 물품 정보 저장
  const [productInfo, setProductInfo] = useState("")
  // 승인 되었는지 저장
  const [checked, setChecked] = useState(false)

  /** 사용자 정보 */
  const currentUser = usePbAuth().user

  // 승인 버튼
  async function handleConfirm() {
    let newInfo = productInfo
    newInfo.isConfirmed = true
    newInfo.confirmedBy = currentUser.id
    newInfo.rejectedReason = null

    await pb.collection("products").update(productInfo.id, newInfo)
    setModal(`승인되었습니다.`)

    router.push("/autonomy")
  }

  //거절 버튼
  async function handleReject(data) {
    if (data.type === "* 반려 사유를 선택하세요 *") {
      setModal("반려 사유를 아래 목록에서 선택해 주세요!")
      return
    }
    let newInfo = productInfo
    newInfo.rejectedReason = data.type
    newInfo.confirmedBy = currentUser.id

    try {
      await pb.collection("products").update(productInfo.id, newInfo)
    } catch (e) {
      setModal("반려 처리 오류")
      console.log(e)
    }
    setModal(`반려 처리되었습니다. 사유: "${data.type}"`)

    await router.push("/autonomy")
  }

  useEffect(() => {
    /** 물품 정보 불러오기 expand seller, confirmedBy */
    async function getProductInfo() {
      try {
        const record = await pb.collection("products").getOne(productId, {
          expand: "seller, confirmedBy",
        })
        if (!record.isConfirmed) {
          setProductInfo(record)
        } else {
          setProductInfo(false)
        }
      } catch (e) {
        console.log(e)
      }
    }
    getProductInfo()
  }, [productId])

  return (
    <Layout>
      {productInfo ? (
        <div className="w-full min-h-screen bg-slate-50 sm:flex sm:flex-col sm:justify-center sm:items-center sm:pt-6 sm:pb-24">
          {productInfo ? (
            <div className="sm:bg-white sm:p-4 md:p-8 sm:rounded-xl sm:shadow-xl">
              <div className="relative sm:flex ">
                <ProductImageView
                  productInfo={productInfo}
                  productId={productId}
                />
                <div className="sm:flex sm:flex-col sm:w-52 md:w-80 lg:w-96">
                  <div className="p-4 sm:p-2 flex flex-col ">
                    <div className=" pb-2 border-b-2 flex flex-col ">
                      <div className="flex justify-between">
                        <div className="text-xl font-bold">
                          {productInfo.name}
                        </div>
                        <div className="flex">
                          <div className="flex flex-col items-end mr-2">
                            <div className="text-sm">
                              {productInfo.expand.seller.name}
                            </div>
                            <div className="text-sm">
                              {productInfo.expand.seller.studentId}
                            </div>

                            {currentUser?.id ===
                            productInfo?.expand?.seller?.id ? (
                              <Link href={`/products/update/${productId}`}>
                                <PencilSquareIcon className="w-8 h-8 bg-amber-500 hover:bg-amber-600 transition duration-200 p-1 rounded-md text-white" />
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-col">
                        <div className="ml-auto">
                          {getUploadedTime(productInfo.created)}에 등록
                        </div>

                        <div className="ml-auto font-bold text-slate-500">
                          {productInfo.rejectedReason
                            ? `반려됨 (검토인: ${productInfo.expand.confirmedBy?.name})`
                            : "승인 대기 중"}
                        </div>

                        <div className="font-medium text-lg my-2">
                          {productInfo.explain}
                        </div>
                        <div>종류: {productInfo.type}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="px-4 sm:p-2 flex flex-col text-center">
                  {productInfo.rejectedReason ? (
                    <div className="font-bold text-red-500">
                      앞선 검토에서 &quot;{productInfo.rejectedReason}&quot;
                      사유로 등록이 거절된 물건입니다.
                    </div>
                  ) : null}
                  <div className="pb-2 font-bold ">
                    물건을 {productInfo.rejectedReason ? "재" : null}검토하려면
                    아래 상자에 체크하세요.
                  </div>
                  <div className="pb-4 flex items-center mx-auto">
                    <input
                      className="w-0 h-0"
                      type="checkbox"
                      id="check"
                      onChange={({ target: { checked } }) => {
                        setChecked(checked)
                      }}
                    />
                    <label for="check" className="w-8 h-8">
                      <CheckIcon
                        className={
                          checked
                            ? "bg-amber-500 stroke-white border-2 border-transparent rounded-xl cursor-pointer"
                            : "bg-white stroke-slate-100 border-2 border-slate-300 rounded-xl cursor-pointer"
                        }
                      />
                    </label>
                    <div className="ml-2">
                      등록된 물건 정보를 잘 확인했습니다.
                    </div>
                  </div>
                </div>
              </div>

              {checked ? (
                <div className="fixed top-0 right-0 left-0 bottom-0 flex justify-center items-center bg-slate-50/50">
                  <div className="relative m-2 p-6 rounded-lg border-2 w-4/5 bg-white max-w-md">
                    <XCircleIcon
                      onClick={() => setChecked(null)}
                      className="absolute cursor-pointer top-0 right-0 w-8 h-8 text-slate-600"
                    />
                    <div className="text-lg font-bold text-center">
                      물건 검토
                    </div>
                    <button
                      className="w-full bg-green-500 hover:bg-green-600 transition duration-200  text-white p-2 px-12 rounded-full text-base font-semibold mt-4"
                      onClick={handleConfirm}
                    >
                      승인
                    </button>
                    <form
                      onSubmit={handleSubmit(handleReject)}
                      className="flex flex-col"
                    >
                      <button
                        className="bg-red-500 hover:bg-red-600 transition duration-200  text-white p-2 px-12 rounded-full text-base font-semibold mt-4"
                        type="submit"
                      >
                        반려
                      </button>
                      <div className="text-lg font-semibold mt-4">
                        반려 사유
                      </div>
                      <select
                        {...register("type", { required: true })}
                        className="p-2 rounded-lg outline-none ring-2 ring-amber-400 transition duration-200 my-2"
                      >
                        {rejectOptions.map((item, key) => (
                          <option key={key} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </form>
                  </div>
                </div>
              ) : null}
              <div className="w-full h-16 sm:h-0"></div>
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center m-auto text-xl font-semibold text-slate-500">
          <div>정보가 없습니다.</div>
        </div>
      )}

      <BottomBar />
    </Layout>
  )
}
