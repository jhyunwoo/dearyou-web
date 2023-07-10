import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import pb from "@/lib/pocketbase"
import { CheckIcon, XCircleIcon } from "@heroicons/react/24/outline"
import getUploadedTime from "@/lib/getUploadedTime"
import { usePbAuth } from "@/contexts/AuthWrapper"
import BottomBar from "@/components/BottomBar"
import ProductImageView from "@/components/ProductImageView"
import { useSetRecoilState } from "recoil"
import { modalState } from "@/lib/recoil"
import SEO from "@/components/SEO"
import sendPush from "@/lib/client-send-push"
import errorTransmission from "@/lib/errorTransmission"

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
  "금전 거래를 암시하는 내용이 있어요.",
]

export default function ProductDetail({ productId }) {
  const router = useRouter()
  const { register, handleSubmit } = useForm()
  const setModal = useSetRecoilState(modalState)

  const [isLoading, setIsLoading] = useState(false)
  // 물품 정보 저장
  const [productInfo, setProductInfo] = useState("")
  // 승인 되었는지 저장
  const [checked, setChecked] = useState(false)

  /** 사용자 정보 */
  const currentUser = usePbAuth().user

  // 승인 버튼
  async function handleConfirm() {
    try {
      let newInfo = productInfo
      newInfo.isConfirmed = true
      newInfo.confirmedBy = currentUser.id
      newInfo.rejectedReason = null

      await pb.collection("products").update(productInfo.id, newInfo)
      setModal(`승인되었습니다.`)
      sendPush(
        productInfo.seller,
        "자율위원회",
        "등록한 물품이 승인되었습니다.",
      )

      router.push("/autonomy")
    } catch (e) {
      errorTransmission(e)
    }
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
      sendPush(
        productInfo.seller,
        "자율위원회",
        "등록한 물품이 반려되었습니다.",
      )
      setModal(`반려 처리되었습니다. 사유: "${data.type}"`)
    } catch (e) {
      setModal("반려 처리 오류")
      errorTransmission(e)
    }

    await router.push("/autonomy")
  }

  useEffect(() => {
    /** 물품 정보 불러오기 expand seller, confirmedBy */
    async function getProductInfo() {
      try {
        setIsLoading(true)
        const record = await pb.collection("products").getOne(productId, {
          expand: "seller, confirmedBy",
        })
        if (!record.isConfirmed) {
          setProductInfo(record)
        } else {
          setProductInfo(false)
        }
        setIsLoading(false)
      } catch (e) {
        setIsLoading(false)
        errorTransmission(e)
      }
    }
    getProductInfo()
  }, [productId])

  return (
    <>
      <SEO title={"자율위원 물품 검토"} />
      {productInfo ? (
        <div className="w-full min-h-screen bg-slate-50 dark:bg-black sm:flex sm:flex-col sm:justify-center sm:items-center sm:pt-6 sm:pb-24">
          {productInfo ? (
            <div className="sm:bg-white sm:dark:bg-black sm:p-4 md:p-8 sm:rounded-xl sm:shadow-xl">
              <div className="relative sm:flex ">
                <ProductImageView
                  productInfo={productInfo}
                  productId={productId}
                />
                <div className="sm:flex sm:flex-col sm:w-52 md:w-80 lg:w-96">
                  <div className="p-4 sm:p-2 flex flex-col ">
                    <div className=" pb-2 border-b-2 flex flex-col ">
                      <div className="flex justify-between">
                        <div className="text-xl font-bold dark:text-white">
                          {productInfo.name}
                        </div>
                        <div className="flex">
                          <div className="flex items-end">
                            <Link
                              href={`/profile/${productInfo.expand.seller?.id}`}
                              className="text-lg font-semibold dark:text-white"
                            >
                              {productInfo.expand.seller?.name} (
                              {productInfo.expand.seller?.studentId < 20000
                              ? "교사"
                              : productInfo.expand.seller?.studentId})
                            </Link>
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
                            <div className="flex">
                              <span className="text-red-500">반려됨{` `}</span>

                              <Link
                                href={`/profile/${productInfo.expand.confirmedBy?.id}`}
                                className="text-slate-500 ml-1"
                              >
                                (검토인: {productInfo.expand.confirmedBy?.name})
                              </Link>
                            </div>
                          ) : (
                            <span className="text-amber-500">승인 대기 중</span>
                          )}
                        </div>
                        <div className="text-lg mt-4 mb-2 border-b-2 dark:text-white">
                          {productInfo.explain}
                        </div>
                        <div className="flex items-center">
                          <div className="dark:text-white">
                            종류: {productInfo.type}
                          </div>
                          <div className="mr-2 ml-auto text-sm text-slate-500">
                            {getUploadedTime(productInfo.created)} 등록
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="px-4 sm:p-2 flex flex-col text-center dark:text-white">
                  {productInfo.rejectedReason ? (
                    <div className="mb-2 font-bold text-red-500">
                      앞선 검토에서 등록이 거절되었던 물건입니다.
                      <div>사유: &quot;{productInfo.rejectedReason}&quot;</div>
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
                            : "bg-white dark:bg-gray-900 stroke-slate-100 border-2 border-slate-300 rounded-xl cursor-pointer"
                        }
                      />
                    </label>
                    <div className="ml-2 ">
                      등록된 물건 정보를 잘 확인했습니다.
                    </div>
                  </div>
                </div>
              </div>

              {checked ? (
                <div className="fixed top-0 right-0 left-0 bottom-0 flex justify-center items-center bg-slate-50 dark:bg-black/50">
                  <div className="relative m-2 p-6 rounded-lg border-2 w-4/5 bg-white dark:bg-black max-w-md">
                    <XCircleIcon
                      onClick={() => setChecked(null)}
                      className="absolute cursor-pointer top-0 right-0 w-8 h-8 text-slate-600"
                    />
                    <div className="text-lg font-bold text-center dark:text-white">
                      물건 검토
                    </div>
                    <div className="text-center text-slate-500 mt-2">
                      <Link href="/autonomy/guideline">검토 기준 보기</Link>
                    </div>
                    <button
                      className="w-full bg-green-500 hover:bg-green-600 transition duration-200  text-white dark:text-black p-2 px-12 rounded-full text-base font-semibold mt-4"
                      onClick={handleConfirm}
                    >
                      승인
                    </button>
                    <form
                      onSubmit={handleSubmit(handleReject)}
                      className="flex flex-col "
                    >
                      <button
                        className="bg-red-500 hover:bg-red-600 transition duration-200  text-white dark:text-black p-2 px-12 rounded-full text-base font-semibold mt-4"
                        type="submit"
                      >
                        반려
                      </button>
                      <div className="text-lg font-semibold mt-4 dark:text-white">
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
              <div className="w-full h-16 sm:h-0 dark:bg-gray-900"></div>
            </div>
          ) : (
            ""
          )}
        </div>
      ) : isLoading ? (
        <div className="text-center mt-12 font-semibold text-slate-500">
          <div>정보를 불러오는 중입니다...</div>
        </div>
      ) : (
        <div className="text-center mt-12 font-semibold text-slate-500">
          <div>정보가 없습니다.</div>
        </div>
      )}

      <BottomBar />
    </>
  )
}
