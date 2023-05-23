import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import pb from "@/lib/pocketbase";
import ProtectedPage from "@/components/ProtectedPage";
import BottomBar from "@/components/BottomBar";
import { CheckBadgeIcon, PlusIcon } from "@heroicons/react/24/outline";
import HeadBar from "@/components/HeadBar";
import Layout from "@/components/Layout";
import ProductGrid from "@/components/ProductGrid";
import ProductCard from "@/components/ProductCard";
import AutonomyPage from "@/components/AutonomyPage";



export default function Autonomy() {
  const [products, setProducts] = useState([]);

  const fetch = useCallback(async () => {
    try {
      const data = await pb.collection("products").getFullList({
        expand: "seller",
        sort: "-created",
        filter: "isConfirmed=False",
      });
      setProducts(data);
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetch();
  }, []);

  return (
    <ProtectedPage>
    <AutonomyPage>
      <div
          href={"/autonomy"}
          className="flex bg-amber-500 text-white px-4 py-6 items-center"  
        >
          <CheckBadgeIcon className="w-16 h-16"/>
          <div className="pl-2">
            <div className="font-bold text-2xl">상품 승인 관리 페이지</div>
            <div className="font-bold">
                자율위원 <span className="text-amber-200">{pb.authStore?.model?.name}</span>
                님 반갑습니다.</div>
          </div>
      </div>
      <div className="p-2">
        <div className="font-bold text-lg pb-2">
          {products?.length}개의 상품이 검토를 기다리고 있어요!
        </div>
        <ProductGrid>
          {products?.map((data, key) => (
            <ProductCard data={data} key={key} autonomy={true} />
          ))}
          <div
            className="h-8 w-full sm:col-span-2 lg:col-span-3 xl:col-span-4"
          />
        </ProductGrid>
      </div>
      <BottomBar/>
    </AutonomyPage>
    </ProtectedPage>
  );
}
