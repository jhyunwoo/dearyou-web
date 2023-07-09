import { useEffect, useState } from "react"
import Link from "next/link"
import pb from "@/lib/pocketbase"
import BottomBar from "@/components/BottomBar"
import HeadBar from "@/components/HeadBar"
import Layout from "@/components/Layout"
import ProductGrid from "@/components/ProductGrid"
import ProductCard from "@/components/ProductCard"
import SEO from "@/components/SEO"
import errorTransmission from "@/lib/errorTransmission"

export default function WishPage() {
  const [products, setProducts] = useState(false)

  useEffect(() => {
    async function getWishProducts() {
      try {
        const records = await pb
          .collection("users")
          .getOne(pb.authStore.model?.id, { expand: "wishes.seller" })
        setProducts(records.expand.wishes ? records.expand.wishes : [])
      } catch (e) {
        errorTransmission(e)
      }
    }
    getWishProducts()
  }, [])

  return (
    <Layout>
      <SEO title={"관심 목록"} />

      {products ? (
        <ProductGrid>
          {products?.length === 0 ? (
            <div className="mx-auto mt-24 sm:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col items-center justify-center dark:text-white">
              <div className="font-semibold">
                아직 등록한 관심 물품이 없습니다.
              </div>
              <Link
                href={"/"}
                className="bg-orange-400 p-2 px-4 rounded-full text-white dark:text-black font-semibold mt-4 hover:bg-orange-500 transition duration-200"
              >
                등록된 물품 보러가기
              </Link>
            </div>
          ) : (
            ""
          )}
          {products?.map((data, key) => (
            <ProductCard data={data} key={key} />
          ))}
        </ProductGrid>
      ) : (
        <div className="text-center mt-12 font-semibold text-slate-500">
          <div>정보를 불러오는 중입니다...</div>
        </div>
      )}
      <BottomBar />
      <HeadBar title="관심목록" />
    </Layout>
  )
}
