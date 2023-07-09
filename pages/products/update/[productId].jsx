import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import pb from "@/lib/pocketbase"
import { usePbAuth } from "@/contexts/AuthWrapper"
import ProductImageView from "@/components/ProductImageView"
import ProductInfoForm from "@/components/ProductInfoForm"
import Loading from "@/components/Loading"
import { useSetRecoilState } from "recoil"
import { modalState } from "@/lib/recoil"
import BottomBar from "@/components/BottomBar"
import SEO from "@/components/SEO"
import errorTransmission from "@/lib/errorTransmission"

export const getServerSideProps = async (context) => {
  const { query } = context
  const { productId } = query

  return {
    props: {
      productId,
    },
  }
}

export default function UpdateProduct({ productId }) {
  const { user } = usePbAuth()
  const [productInfo, setProductInfo] = useState("")

  const setModal = useSetRecoilState(modalState)

  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function getProductInfo() {
      try {
        const record = await pb.collection("products").getOne(productId, {
          expand: "seller",
        })
        setProductInfo(record)
      } catch (e) {
        errorTransmission(e)
      }
    }

    getProductInfo()
  }, [productId])

  async function onSubmit(data) {
    try {
      setIsLoading(true)
      let newInfo = productInfo
      newInfo.name = data.name
      newInfo.explain = data.explain
      newInfo.type = data.type
      newInfo.lastupdated = new Date().getTime()

      let result = await pb.collection("products").update(productId, newInfo)
      setIsLoading(false)
      router.replace("/")
    } catch (e) {
      errorTransmission(e)
    }
  }

  async function onDeleteProduct() {
    try {
      if (window.confirm("물품을 정말 삭제할까요? (취소할 수 없습니다!)")) {
        await pb.collection("products").delete(productId)
        setModal("물품이 삭제되었습니다.")
        router.replace("/")
      }
    } catch (e) {
      errorTransmission(e)
    }
  }

  if (productInfo?.expand?.seller?.id === user?.id) {
    return (
      <>
        <SEO title={"정보 수정"} />
        {isLoading ? <Loading /> : ""}
        {productInfo ? (
          <div className="sm:flex sm:flex-row  sm:justify-center">
            <div className="sm:m-4">
              <ProductImageView
                productInfo={productInfo}
                productId={productId}
              />
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg sm:w-1/2">
              {!productInfo.soldDate ? (
                <div>
                  <ProductInfoForm
                    productInfo={productInfo}
                    onSubmit={onSubmit}
                  />
                  <button
                    className="w-full bg-red-400 hover:bg-red-500 transition duration-200  text-white dark:text-black p-2 px-6 rounded-full text-base font-semibold mt-4"
                    onClick={onDeleteProduct}
                  >
                    물품 삭제
                  </button>
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500">
                  이미 나눔이 완료된 물건이므로 수정하거나 삭제할 수 없습니다.
                </div>
              )}
            </div>
          </div>
        ) : null}
        <BottomBar />
      </>
    )
  } else {
    return (
      <div className="p-4 text-center text-slate-500">
        수정할 권한이 없습니다.
      </div>
    )
  }
}
