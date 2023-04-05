import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePbAuth } from "../contexts/AuthWrapper";
import pb from "@/lib/pocketbase";
import ProtectedPage from "@/components/ProtectedPage";

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
    console.log(user);
  }, []);

  return (
    <ProtectedPage>
      <div>
        <div className="w-full h-40 flex justify-center items-center text-4xl font-extrabold">
          DEARYOU Home Page
        </div>
        <Link href={"/signin"}>로그인</Link>
        <button onClick={signOut}>Sign Out</button>
        <button onClick={() => console.log(user)}>사용자 정보</button>
        <div className="flex p-4 justify-around">
          <Link href={"/chats"}>chats</Link>
          <Link href={"/search"}>search</Link>
          <Link href={"/profile"}>profile</Link>
        </div>
        <div>
          {products.map((data, key) => (
            <div key={key}>
              <div>{data?.name}</div>
              <div>{data?.explain}</div>
              <div>{data?.expand?.seller?.name}</div>
              <Image
                src={`https://dearu-pocket.moveto.kr/api/files/products/${data.id}/${data.photos[0]}`}
                width={500}
                height={500}
                alt={data.name}
              />
            </div>
          ))}
        </div>
      </div>
    </ProtectedPage>
  );
}
