import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import Image from "next/image";
import { usePbAuth } from "@/contexts/AuthWrapper";
import ProtectedPage from "@/components/ProtectedPage";
import BottomBar from "@/components/BottomBar";
import { useRef } from "react";
import Link from "next/link";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/solid";

export const getServerSideProps = async (context) => {
  const { query } = context;
  const { productId } = query;

  return {
    props: {
      productId,
    },
  };
};

export default function ProductDetail({ productId }) {
  const [productInfo, setProductInfo] = useState("");
  const useWindowSize = () => {
    const isClient = typeof window === "object";

    const getSize = () => {
      return { width: isClient ? window.innerWidth : undefined };
    };

    const [windowSize, setWindowSize] = useState(getSize);

    useEffect(() => {
      if (!isClient) {
        return false;
      }
      const handleResize = () => {
        setWindowSize(getSize());
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    return windowSize;
  };
  function getUploadedTime(time) {
    let uploadedTime = Date.parse(time);
    let currentTime = new Date().getTime();
    let gap = currentTime - uploadedTime;
    if (gap < 1000 * 60) {
      return `${Math.floor(gap / 1000)}초 전`;
    } else if (gap < 1000 * 60 * 10) {
      return `${Math.floor(gap / (1000 * 60))}분 전`;
    } else if (gap < 1000 * 60 * 60) {
      return `${Math.floor(gap / (1000 * 60 * 10))}0분 전`;
    } else if (gap < 1000 * 60 * 60 * 24) {
      return `${Math.floor(gap / (1000 * 60 * 60))}시간 전`;
    } else if (gap < 1000 * 60 * 60 * 24 * 7) {
      return `${Math.floor(gap / (1000 * 60 * 60 * 24))}일 전`;
    } else if (gap < 1000 * 60 * 60 * 24 * 30) {
      return `${Math.floor(gap / (1000 * 60 * 60 * 24 * 7))}주 전`;
    } else if (gap < 1000 * 60 * 60 * 24 * 365) {
      return `${Math.floor(gap / (1000 * 60 * 60 * 24 * 30))}달 전`;
    } else {
      return `${Math.floor(gap < 1000 * 60 * 60 * 24 * 365)}년 전`;
    }
  }
  const windows = useWindowSize();
  useEffect(() => {
    async function getProductInfo() {
      const record = await pb.collection("products").getOne(productId, {
        expand: "seller",
      });
      setProductInfo(record);
    }

    getProductInfo();
  }, []);

  //현재 사용자의 wishes에 product를 추가하는 버튼의 함수
  const currentUser = usePbAuth().user;
  async function addToWishlist() {
    try {
      const originWishes = await pb.collection("users").getOne(currentUser.id, {
        expand: "wishes",
      });
      const updatedUser = await pb.collection("users").update(currentUser.id, {
        wishes: [...originWishes.wishes, productId],
      });
      console.log(updatedUser);
      alert("Product has been added to your wishlist!");
    } catch (error) {
      console.error("Error adding product to wishlist:", error);
      alert("Error adding product to your wishlist. Please try again later.");
    }
  }
  return (
    <ProtectedPage>
      <BottomBar />
      <div className="w-full min-h-screen bg-slate-50">
        {productInfo ? (
          <div>
            <div className="flex overflow-x-auto space-x-8 scrollbar-hide snap-x">
              {productInfo.photos.map((data, key) => (
                <div
                  className={`w-[${windows.width}px] h-[${windows.width}px] snap-center my-auto flex-shrink-0`}
                >
                  <Image
                    key={key}
                    src={`https://dearu-pocket.moveto.kr/api/files/products/${productId}/${data}`}
                    width={300}
                    height={300}
                    priority={true}
                    alt={"Product Image"}
                    className=""
                  />
                </div>
              ))}
            </div>
            <div className="p-4 flex flex-col">
              <div className=" pb-2 border-b-2 flex justify-between items-center">
                <div className="text-xl font-bold">{productInfo.name}</div>
                <div className="flex items-center">
                  <div className="flex mx-1">
                    <div className="mr-2">{productInfo.expand.seller.name}</div>
                    <div>{productInfo.expand.seller.studentId}</div>
                  </div>

                  {currentUser?.id === productInfo?.expand?.seller?.id ? (
                    <Link href={`/products/update/${productId}`}>
                      <PencilSquareIcon className="w-8 h-8 bg-amber-500 hover:bg-amber-600 transition duration-200 p-1 rounded-md text-white" />
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="mt-2 flex flex-col">
                <div className="ml-auto">
                  {getUploadedTime(productInfo.updated)}
                </div>
                <div className="ml-auto">
                  {productInfo.soldDate ? "판매됨" : "판매중"}
                </div>
                <div className="font-medium text-lg my-2">
                  {productInfo.explain}
                </div>
                <div>종류: {productInfo.type}</div>
              </div>
              <button onClick={addToWishlist}>
                <HeartIcon className="w-8 h-8 text-red-100" />
              </button>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </ProtectedPage>
  );
}
