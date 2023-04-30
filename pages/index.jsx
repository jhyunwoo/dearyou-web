import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import pb from "@/lib/pocketbase";
import ProtectedPage from "@/components/ProtectedPage";
import BottomBar from "@/components/BottomBar";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const page = useRef(1);
  const [ref, inView] = useInView();

  const fetch = useCallback(async () => {
    try {
      const data = await pb
        .collection("products")
        .getList(page.current, 10, { expand: "seller" });
      setProducts((prevPosts) => [...prevPosts, ...data.items]);
      setHasNextPage(data.items.length === 10);
      if (data.items.length) {
        page.current += 1;
      }
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    console.log(inView, hasNextPage);
    if (inView && hasNextPage) {
      fetch();
    }
  }, [fetch, hasNextPage, inView]);

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
                    </div>
                    <div>{data?.expand?.seller?.studentId}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          <div ref={ref} />
        </div>
        <div className="w-full h-16"></div>
      </div>
    </ProtectedPage>
  );
}
