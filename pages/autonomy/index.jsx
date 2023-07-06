import { useCallback, useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import ProtectedPage from "@/components/ProtectedPage";
import BottomBar from "@/components/BottomBar";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import ProductGrid from "@/components/ProductGrid";
import ProductCard from "@/components/ProductCard";
import AutonomyPage from "@/components/AutonomyPage";
import Loading from "@/components/Loading";

export default function Autonomy() {
  const [products, setProducts] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const data = await pb.collection("products").getFullList({
        expand: "seller",
        sort: "-created",
        filter: "isConfirmed=False",
      });
      setProducts(data);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    async function effect() {
      setIsLoading(true);
      await fetch();
      setIsLoading(false);
    }
    effect();
  }, [fetch]);

  return (
    <ProtectedPage>
      <AutonomyPage>
        {isLoading ? <Loading /> : ""}
        <div
          href={"/autonomy"}
          className="flex bg-amber-500 text-white p-3 items-center"
        >
          <CheckBadgeIcon className="w-12 h-12" />
          <div className="pl-2">
            <div className="font-bold text-xl">물품 승인 관리 페이지</div>
            <div className="font-bold">
              자율위원{" "}
              <span className="text-amber-200">
                {pb.authStore?.model?.name}
              </span>
              님 반갑습니다.
            </div>
          </div>
        </div>
        <div className="p-2">
          <div className="font-bold text-base text-center pb-2">
            {products?.length}개의 물품이 검토를 기다리고 있어요!
          </div>
          <ProductGrid>
            {products?.map((data, key) => (
              <ProductCard data={data} key={key} autonomy={true} />
            ))}
            <div className="h-8 w-full sm:col-span-2 lg:col-span-3 xl:col-span-4" />
          </ProductGrid>
        </div>
        <div className="w-full h-8"></div>
        <BottomBar />
      </AutonomyPage>
    </ProtectedPage>
  );
}
