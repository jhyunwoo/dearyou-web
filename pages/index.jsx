import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import ProtectedPage from "@/components/ProtectedPage";
import BottomBar from "@/components/BottomBar";
import { PlusIcon } from "@heroicons/react/24/outline";
import { usePbAuth } from "../contexts/AuthWrapper";

export default function Home() {
  const { user, signOut } = usePbAuth();
  const [products, setProducts] = useState([]);

  /** 처음부터 50개의 물품 리스트를 가져오는 함수 */
  async function getProductsLists() {
    const resultList = await pb
      .collection("products")
      .getList(1, 50, { expand: "seller" });
    setProducts(resultList?.items);
  }

  useEffect(() => {
    getProductsLists();
  }, []);

  return (
    <ProtectedPage>
      <BottomBar />
      <Link
        href={"/products/create-product"}
        className="fixed right-6 bottom-20 bg-amber-500 p-2 rounded-full hover:bg-amber-600 transition duration-200"
      >
        <PlusIcon className="w-8 h-8 text-white" />
      </Link>
      <div className="w-full min-h-screen bg-slate-50 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 p-4">
          {products.map((data, key) => (
            <Link href={`/products/${data.id}`} key={key}>
              <div className="flex flex-row w-full border-b py-3 border-slate-300">
                <Image
                  src={`https://dearu-pocket.moveto.kr/api/files/products/${data.id}/${data.photos[0]}?thumb=100x100`}
                  width={300}
                  height={300}
                  alt={data.name}
                  priority={true}
                  className="basis-1/4 w-24 h-24 rounded-lg mr-4"
                />
                <div>
                  <div className="font-bold text-lg">{data?.name}</div>
                  <div className="font-medium text-base flex flex-col">
                    <div className="font-semibold">
                      {data?.expand?.seller?.name}
                      <span className="text-blue-600">{(data?.expand?.seller?.id === user?.id) ? " (나)" : ""}</span>
                    </div>
                    <div>{data?.expand?.seller?.studentId}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="w-full h-16"></div>
      </div>
    </ProtectedPage>
  );
}
