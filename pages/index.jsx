import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePbAuth } from "../contexts/AuthWrapper";
import pb from "@/lib/pocketbase";

export default function Home() {
  const { user, signOut } = usePbAuth();
  const [products, setProducts] = useState([]);
  const router = useRouter();

  function checkUserAuth() {
    if (!user) {
      router.replace("/signin");
    }
  }

  async function getProductsLists() {
    const resultList = await pb
      .collection("products")
      .getList(1, 50, { expand: "seller" });
    console.log(resultList.items);
    setProducts(resultList?.items);
  }

  // useEffect(() => checkUserAuth(), [user]);
  useEffect(() => {
    getProductsLists();
  }, []);

  return (
    <div>
      <div className="w-full h-40 flex justify-center items-center text-4xl font-extrabold">
        DEARYOU Home Page
      </div>
      <button onClick={signOut}>Sign Out</button>
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
            ></Image>
          </div>
        ))}
      </div>
    </div>
  );
}
