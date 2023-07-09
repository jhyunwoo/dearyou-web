import { useCallback, useEffect, useRef, useState } from "react"
import pb from "@/lib/pocketbase"
import BottomBar from "@/components/BottomBar"
import {
  CheckBadgeIcon,
  EyeSlashIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline"
import ProductGrid from "@/components/ProductGrid"
import ProductCard from "@/components/ProductCard"
import AutonomyPage from "@/components/AutonomyPage"
import Loading from "@/components/Loading"
import { useInView } from "react-intersection-observer"
import { usePbAuth } from "@/contexts/AuthWrapper"
import SEO from "@/components/SEO"
import Link from "next/link"
import errorTransmission from "@/lib/errorTransmission"

export default function Autonomy() {
  const [products, setProducts] = useState([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const page = useRef(1)
  const [ref, inView] = useInView()
  const [hideRejected, setHideRejected] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const { user } = usePbAuth()

  const fetch = useCallback(async (hide) => {
    try {
      const data = await pb.collection("products").getList(page.current, 40, {
        expand: "seller",
        sort: "-updated",
        filter: `isConfirmed=False${hide ? ` && rejectedReason=""` : ""}`,
      })
      setProducts((prevPosts) => [...prevPosts, ...data.items])
      setHasNextPage(data.items.length === 40)
      if (data.items.length) {
        page.current += 1
      }
    } catch (e) {
      errorTransmission(e)
    }
  }, [])

  useEffect(() => {
    if (inView && hasNextPage) {
      setIsLoading(true)
      fetch(hideRejected)
      setIsLoading(false)
    }
  }, [fetch, hasNextPage, hideRejected, inView])

  useEffect(() => {
    page.current = 1
    setProducts([])
    setHasNextPage(false)
    setHasNextPage(true)
  }, [hideRejected])

  return (
    <AutonomyPage>
      <SEO title={"물품 승인 관리"} />
      {isLoading ? <Loading /> : ""}
      <div
        href={"/autonomy"}
        className="flex bg-amber-500 text-white p-3 items-center"
      >
        <CheckBadgeIcon className="w-12 h-12" />
        <div className="pl-2">
          <div className="font-bold text-xl">물품 승인 관리 페이지</div>
          <div className="font-bold">
            자율위원 <span className="text-amber-200">{user?.name}</span>님
            반갑습니다.
          </div>
        </div>
      </div>
      <div className="p-2">
        <div className="flex pb-2 items-center">
          <div className="w-20" />
          <div className="ml-auto text-slate-500">반려된 물건 숨기기</div>
          <button
            onClick={() => {
              setHideRejected(!hideRejected)
            }}
          >
            <EyeSlashIcon
              className={`w-8 h-8 mx-2 ${
                hideRejected ? "stroke-orange-400" : "stroke-slate-400"
              }`}
            />
          </button>
        </div>
        {products.length === 0 ? (
          <div className="text-md text-slate-600 font-bold text-center mt-12">
            승인 대기 중인 물건이 없습니다.
          </div>
        ) : null}
        <ProductGrid>
          {products?.map((data, key) => (
            <ProductCard data={data} key={key} autonomy={true} />
          ))}
          <div
            ref={ref}
            className="h-8 w-full sm:col-span-2 lg:col-span-3 xl:col-span-4"
          />
        </ProductGrid>
      </div>
      <div className="w-full h-8"></div>
      <Link
        href={"/autonomy/guideline"}
        className="fixed right-4 sm:right-8 bottom-24 bg-amber-400 p-2 rounded-full transition duration-200 shadow-md ring-2 ring-amber-400 hover:ring-offset-2 dark:ring-offset-black group hover:bg-white hover:dark:bg-black dark:bg-amber-400"
      >
        <QuestionMarkCircleIcon className="w-8 h-8 text-white dark:text-black group-hover:text-amber-400" />
        <div className="absolute -bottom-6 right-0 left-0 text-sm text-center font-semibold dark:text-white">
          도움말
        </div>
      </Link>
      <BottomBar />
    </AutonomyPage>
  )
}
