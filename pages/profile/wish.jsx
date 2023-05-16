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
      try {
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
      } catch (error) {
        console.error(error);
      }
    }
    getWishProducts();
  }, []);

  return (
    <ProtectedPage>
      <BottomBar />
      <div className="p-4 bg-slate-50 w-full min-h-screen">
        <div className="text-xl font-bold">관심목록</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4 gap-2">
          {productList?.length === 0 ? (
            <div className="flex flex-col sm:col-span-2 lg:col-span-3 xl:col-span-4 justify-center items-center mt-24">
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
              <div
                className={`flex rounded-lg p-2  w-full ${
                  data?.soldDate ? "bg-slate-100" : "bg-white"
                }`}
              >
                <Image
                  src={`https://dearyouapi.moveto.kr/api/files/products/${data.id}/${data.photos[0]}?thumb=100x100`}
                  width={300}
                  height={300}
                  alt={data.name}
                  priority={true}
                  className=" w-28 h-28  mr-4 rounded-lg"
                />
                <div className="flex justify-between flex-col">
                  <div className="font-bold text-lg">{data?.name}</div>
                  <div className="font-medium text-base flex flex-col">
                    <div className="font-semibold">
                      {data?.expand?.seller?.name}
                    </div>
                    <div>{data?.expand?.seller?.studentId}</div>
                    <div>{data?.soldDate ? "나눔 완료" : ""}</div>
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
