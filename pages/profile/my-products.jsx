import ProtectedPage from "@/components/ProtectedPage";
import pb from "@/lib/pocketbase";
import { useEffect, useState } from "react";
import Link from "next/link";
import BottomBar from "@/components/BottomBar";
import Layout from "@/components/Layout";
import HeadBar from "@/components/HeadBar";
import ProductGrid from "@/components/ProductGrid";
import ProductCard from "@/components/ProductCard";

export default function MyProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function getProducts() {
      const list = await pb
        .collection("users")
        .getOne(pb.authStore.model?.id, { expand: "products(seller).seller" });
      setProducts(list.expand["products(seller)"]);
    }
    getProducts();
  }, []);

  return (
    <ProtectedPage>
      <BottomBar />
      <HeadBar title="내 상품" />
      <Layout>
        <ProductGrid>
          {products?.length === 0 ? (
            <div className="mx-auto mt-24 sm:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col items-center justify-center">
              <div className="font-semibold">아직 등록한 물품이 없습니다.</div>
              <Link
                href={"/products/create-product"}
                className="bg-orange-400 p-2 px-4 rounded-full text-white font-semibold mt-4 hover:bg-orange-500 transition duration-200"
              >
                물품 등록
              </Link>
            </div>
          ) : (
            ""
          )}
          {products?.map((data, key) => (
            <ProductCard data={data} key={key} />
          ))}
        </ProductGrid>
      </Layout>
    </ProtectedPage>
  );
}
