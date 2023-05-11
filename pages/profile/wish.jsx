import ProtectedPage from "@/components/ProtectedPage";
import pb from "@/lib/pocketbase";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BottomBar from "@/components/BottomBar";

export default function WishPage() {
  const [productList, setProductList] = useState([]);
  useEffect(() => {
    async function getWishProducts() {
      const userInfo = await pb
        .collection("users")
        .getOne(pb.authStore.model.id);
      let wishList = userInfo.wishes;
      let products = [];
      for (let i = 0; i < wishList.length; i++) {
        const productInfo = await pb
          .collection("products")
          .getOne(wishList[i], { expand: "seller" });
        products.push(productInfo);
      }
      setProductList(products);
    }
    getWishProducts();
  }, []);

  return (
    <ProtectedPage>
      <BottomBar />
      <div className="p-4 bg-slate-50 w-full min-h-screen">
        <div className="text-xl font-bold">관심목록</div>
        <div className="grid grid-cols-1 gap-4">
          {productList?.length === 0 ? (
            <div className="flex flex-col justify-center items-center mt-24">
              <div>아직 등록한 관심 상품이 없습니다.</div>
              <Link
                href={"/"}
                className="bg-orange-400 p-2 px-4 rounded-full text-white font-semibold mt-4 hover:bg-orange-500 transition duration-200"
              >
                상품 보러가기
              </Link>
            </div>
          ) : (
            ""
          )}
          {productList.map((data, key) => (
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
