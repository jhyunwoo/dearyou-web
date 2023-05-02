import ProtectedPage from "@/components/ProtectedPage";
import pb from "@/lib/pocketbase";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BottomBar from "@/components/BottomBar";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    async function getProducts() {
      const records = await pb.collection("products").getFullList({
        filter: `seller.id="${pb.authStore.model.id}"`,
      });
      setProducts(records);
    }
    getProducts();
  }, []);
  return (
    <ProtectedPage>
      <BottomBar />
      <div className="w-full min-h-screen bg-slate-50 p-4">
        <div className="text-xl font-bold">내 상품</div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
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
