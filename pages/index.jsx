import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import pb from "@/lib/pocketbase";
import ProtectedPage from "@/components/ProtectedPage";
import BottomBar from "@/components/BottomBar";
import { PlusIcon } from "@heroicons/react/24/outline";
import HeadBar from "@/components/HeadBar";
import Layout from "@/components/Layout";
import ProductGrid from "@/components/ProductGrid";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const page = useRef(1);
  const [ref, inView] = useInView();

  const fetch = useCallback(async () => {
    try {
      const data = await pb.collection("products").getList(page.current, 40, {
        expand: "seller",
        sort: "-created",
        filter: "isConfirmed=True",
      });
      setProducts((prevPosts) => [...prevPosts, ...data.items]);
      setHasNextPage(data.items.length === 40);
      if (data.items.length) {
        page.current += 1;
      }
    } catch (err) {}
  }, []);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetch();
    }
  }, [fetch, hasNextPage, inView]);

  return (
    <ProtectedPage>
      <BottomBar />
      <Link
        href={"/products/create-product"}
        className="fixed right-6 bottom-20 bg-amber-500 p-2 rounded-full hover:bg-amber-400 transition duration-200 shadow-lg shadow-amber-500 hover:shadow-amber-400"
      >
        <PlusIcon className="w-8 h-8 text-white" />
      </Link>
      <HeadBar title="드려유" />
      <Layout>
        <ProductGrid>
          {products.map((data, key) => (
            <ProductCard data={data} key={key} />
          ))}
          <div
            ref={ref}
            className="h-8 w-full sm:col-span-2 lg:col-span-3 xl:col-span-4"
          />
        </ProductGrid>
      </Layout>
    </ProtectedPage>
  );
}
