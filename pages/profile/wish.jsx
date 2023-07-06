import ProtectedPage from "@/components/ProtectedPage";
import pb from "@/lib/pocketbase";
import { useEffect, useState } from "react";
import Link from "next/link";
import BottomBar from "@/components/BottomBar";
import HeadBar from "@/components/HeadBar";
import Layout from "@/components/Layout";
import ProductGrid from "@/components/ProductGrid";
import ProductCard from "@/components/ProductCard";

export default function WishPage() {
  const [productList, setProductList] = useState([]);
  useEffect(() => {
    async function getWishProducts() {
      try {
        const records = await pb
          .collection("users")
          .getOne(pb.authStore.model?.id, { expand: "wishes.seller" });
        setProductList(records.expand.wishes);
      } catch (e) {
        console.error(e);
      }
    }
    getWishProducts();
  }, []);

  return (
    <ProtectedPage>
      <Layout>
        <ProductGrid>
          {productList?.length === 0 ? (
            <div className="flex flex-col sm:col-span-2 lg:col-span-3 xl:col-span-4 justify-center items-center mt-24">
              <div>아직 등록한 관심 물품이 없습니다.</div>
              <Link
                href={"/"}
                className="bg-orange-400 p-2 px-4 rounded-full text-white font-semibold mt-4 hover:bg-orange-500 transition duration-200"
              >
                등록된 물품 보러가기
              </Link>
            </div>
          ) : (
            ""
          )}
          {productList?.map((data, key) => (
            <ProductCard data={data} key={key} />
          ))}
        </ProductGrid>
      </Layout>
      <HeadBar title="관심목록" />
      <BottomBar />
    </ProtectedPage>
  );
}
