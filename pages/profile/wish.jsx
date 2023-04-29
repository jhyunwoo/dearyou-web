import ProtectedPage from "@/components/ProtectedPage";
import PocketBase from 'pocketbase';
import { useEffect, useState } from "react";
import { usePbAuth } from "@/contexts/AuthWrapper";
import pb from "@/lib/pocketbase";
import Link from "next/link";
import Image from "next/image";


export default function WishlistPage() {
  const currentUser = usePbAuth().user;
  if (!currentUser) return;
  const [products, setProducts] = useState([]);

  async function getProductsLists() {
    const resultList = await pb
      .collection("users")
      .getList(1, 50, { expand: "wishes", filter: `id="${currentUser.id}"` });
    const wishesList = resultList.items.flatMap((item) => item.expand.wishes);

    console.log(wishesList);
    setProducts(wishesList);
  }

  useEffect(() => {
    getProductsLists();
  }, []);
  return (
    <ProtectedPage>
      <div className="w-full h-40 flex justify-center items-center text-4xl font-extrabold">
        {currentUser?.name}님의 위시리스트
      </div>
      <div className="grid grid-cols-1">
        {products.map((data, key) => (
          <Link href={`/products/${data.id}`} key={key}>
            <div className="product">
              <div className="bold">{data?.name}</div>
              <div>{data?.explain}</div>
              <div>등록인: {data?.expand?.seller?.name}</div>
              <Image
                src={`https://dearu-pocket.moveto.kr/api/files/products/${data.id}/${data.photos[0]}`}
                width={500}
                height={500}
                alt={data.name}
                priority={true}
              />
            </div>
          </Link>
        ))}
      </div>
    </ProtectedPage >
  );
}
