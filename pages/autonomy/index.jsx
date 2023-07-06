import { useCallback, useEffect, useRef, useState } from "react";
import pb from "@/lib/pocketbase";
import ProtectedPage from "@/components/ProtectedPage";
import BottomBar from "@/components/BottomBar";
import { CheckBadgeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import ProductGrid from "@/components/ProductGrid";
import ProductCard from "@/components/ProductCard";
import AutonomyPage from "@/components/AutonomyPage";
import Loading from "@/components/Loading";
import { useInView } from "react-intersection-observer";

export default function Autonomy() {
  const [products, setProducts] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const page = useRef(1);
  const [ref, inView] = useInView();
  const [hideRejected, setHideRejected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async (hide) => {
    try {
      const data = await pb.collection("products").getList(page.current, 40, {
        expand: "seller",
        sort: "-created",
        filter: `isConfirmed=False${hide ? ` && rejectedReason=""` : ""}`,
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
      fetch(hideRejected);
    }
  }, [fetch, hasNextPage, inView]);

  useEffect(() => {
    page.current = 1;
    setProducts([]);
    setHasNextPage(false);
    setHasNextPage(true);
  }, [hideRejected]);

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
          <div className="flex pb-2 items-center">
            <div className="w-20"/>
            <div className="ml-auto text-slate-500">
            반려된 물건 숨기기
            </div>
            <button
              onClick={() => {
                setHideRejected(!hideRejected);
              }}
            >
              <EyeSlashIcon className={`w-8 h-8 mx-2 ${hideRejected ? "stroke-orange-400" : "stroke-slate-400"}`}/>
            </button> 
          </div>
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
        <BottomBar />
      </AutonomyPage>
    </ProtectedPage>
  );
}
