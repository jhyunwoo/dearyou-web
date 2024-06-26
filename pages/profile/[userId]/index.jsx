import BottomBar from "@/components/BottomBar"
import HeadBar from "@/components/HeadBar"
import Layout from "@/components/Layout"
import ProductCard from "@/components/ProductCard"
import ProductGrid from "@/components/ProductGrid"
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import Link from "next/link"
import pb from "@/lib/pocketbase"
import { useInView } from "react-intersection-observer"
import {
  CheckBadgeIcon,
  Cog6ToothIcon,
  FireIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline"
import SEO from "@/components/SEO"
import errorTransmission from "@/lib/errorTransmission"

export default function Profile() {
  const router = useRouter()

  // profile 보일 user
  const userId = router.query["userId"]
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function getUserRecord() {
      try {
        const record = await pb.collection("users")?.getOne(userId)
        setUser(record)
      } catch (e) {
        errorTransmission(e)
      }
    }
    try {
      if (!router.isReady) return
      getUserRecord()
    } catch (e) {
      errorTransmission(e)
    }
  }, [router.isReady, userId])

  // user가 등록한 물품 조회
  const [products, setProducts] = useState([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const page = useRef(1)
  const [ref, inView] = useInView()

  const fetch = useCallback(async () => {
    try {
      const data = await pb.collection("products").getList(page.current, 40, {
        expand: "seller",
        sort: "-created",
        filter: `isConfirmed=True&&seller.id="${userId}"`,
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
      fetch()
    }
  }, [fetch, hasNextPage, inView])

  return (
    <Layout>
      <SEO title={"Profile"} />
      <BottomBar />
      <HeadBar title="프로필" />
      <div className="bg-white dark:bg-gray-900 w-full  p-4 flex flex-col hover:shadow-lg transidion duration-200">
        <div className="flex">
          {user?.avatar ? (
            <Image
              width={100}
              height={100}
              alt={"user avatar"}
              className="rounded-full w-24 h-24"
              src={`https://dearyouapi.moveto.kr/api/files/users/${user?.id}/${user?.avatar}?thumb=100x100`}
            />
          ) : (
            <div className="w-24 h-24 bg-slate-400 rounded-full"></div>
          )}
          <div className="ml-auto text-center">
            <div className="relative w-28 font-bold dark:text-white">
              품격 온도
              <FireIcon className="mx-auto w-20 h-20 stroke-amber-200 dark:stroke-amber-800" />
              <div className="absolute w-full bottom-3">
                <div className="mx-auto text-4xl font-bold text-amber-500">
                  {user?.dignity}ºC
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center">
            <div>
              <div className="flex items-center text-xl font-bold dark:text-white">
                {user?.name}
                {user?.logPermission ? (
                  <Cog6ToothIcon className="w-6 h-6 ml-1 stroke-slate-600" />
                ) : user?.autonomy ? (
                  <CheckBadgeIcon className="w-6 h-6 ml-1 stroke-slate-600" />
                ) : null}
              </div>
              <div className="dark:text-white">
                {user?.studentId < 20000
                 ? "교사용 계정" : user?.studentId}
              </div>
            </div>
            <Link href={`/profile/${userId}/report`} className="ml-auto mr-2 ">
              <MegaphoneIcon className="w-8 h-8 stroke-red-400" />
            </Link>
          </div>
        </div>
      </div>
      <div className="p-4 font-bold">{user?.name}님이 등록한 물건들</div>
      <ProductGrid>
        {products.map((data, key) => (
          <ProductCard data={data} key={key} />
        ))}
        <div
          ref={ref}
          className="h-6 w-full sm:col-span-2 lg:col-span-3 xl:col-span-4"
        />
      </ProductGrid>
    </Layout>
  )
}
