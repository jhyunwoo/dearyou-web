import { useCallback, useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"
import pb from "@/lib/pocketbase"
import BottomBar from "@/components/BottomBar"
import HeadBar from "@/components/HeadBar"
import Layout from "@/components/Layout"
import ProductGrid from "@/components/ProductGrid"
import ProductCard from "@/components/ProductCard"
import FloattingBar from "@/components/FloattingBar"
import SEO from "@/components/SEO"
import errorTransmission from "@/lib/errorTransmission"

export default function Home() {
  const [products, setProducts] = useState([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const page = useRef(1)
  const [ref, inView] = useInView()

  const fetch = useCallback(async () => {
    try {
      const data = await pb.collection("products").getList(page.current, 40, {
        expand: "seller",
        sort: "-created",
        filter: "isConfirmed=True",
      })
      setProducts((prevPosts) => [...prevPosts, ...data.items])
      setHasNextPage(data.items.length === 40)
      if (data.items.length) {
        page.current += 1
      }
    } catch (err) {
      errorTransmission(err)
    }
  }, [])

  useEffect(() => {
    if (inView && hasNextPage) {
      fetch()
    }
  }, [fetch, hasNextPage, inView])

  return (
    <Layout>
      <SEO title={"Home"} />
      <ProductGrid>
        {products.map((data, key) => (
          <ProductCard data={data} key={key} />
        ))}
        <div
          ref={ref}
          className="h-8 w-full sm:col-span-2 lg:col-span-3 xl:col-span-4"
        />
      </ProductGrid>
      <HeadBar title="드려유" />
      <BottomBar />
      <FloattingBar />
    </Layout>
  )
}
