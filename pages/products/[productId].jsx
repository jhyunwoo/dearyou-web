import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import Image from "next/image";
import { usePbAuth } from "@/contexts/AuthWrapper";
import ProtectedPage from "@/components/ProtectedPage";
import BottomBar from "@/components/BottomBar";
import Link from "next/link";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";

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
  const [userWish, setUserWish] = useState([]);
  const [addWish, setAddWish] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    async function getProductInfo() {
      const record = await pb.collection("products").getOne(productId, {
        expand: "seller",
      });
      setProductInfo(record);
    }
    async function getUserWish() {
      const userInfo = await pb
        .collection("users")
        .getOne(pb.authStore.model.id);
      console.log(userInfo.wishes);
      setUserWish(userInfo.wishes);
    }

    getProductInfo();
    getUserWish();
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
      setAddWish(true);
    } catch (error) {
      console.error("Error adding product to wishlist:", error);
    }
  }
  async function goToChat() {
    const checkChat = await pb.collection("chats").getFullList({
      filter: `buyer.id="${pb.authStore.model.id}"&&product.id="${productId}"`,
    });
    if (checkChat.length > 0) {
      router.push(`/chats/${checkChat[0].id}`);
    } else {
      const data = {
        seller: productInfo.expand.seller.id,
        buyer: pb.authStore.model.id,
        product: productInfo.id,
      };

      const createNewChat = await pb.collection("chats").create(data);
      const defaultMessage = {
        text: `"${productInfo.name}"에 대해 문의하고 싶어요!`,
        owner: pb.authStore.model.id,
      };
      const createDefaultMessage = await pb
        .collection("messages")
        .create(defaultMessage);
      const updateChat = await pb
        .collection("chats")
        .update(createNewChat.id, { messages: [createDefaultMessage.id] });
      router.push(`/chats/${createNewChat.id}`);
    }
  }

  return (
    <ProtectedPage>
      <BottomBar />
      <div className="w-full min-h-screen bg-slate-50">
        {productInfo ? (
          <div>
            <div className="flex overflow-x-auto scrollbar-hide snap-x">
              {productInfo.photos.map((data, key) => (
                <div className={`w-screen h-72  snap-center  flex-shrink-0`}>
                  <Image
                    key={key}
                    src={`https://dearu-pocket.moveto.kr/api/files/products/${productId}/${data}`}
                    width={300}
                    height={300}
                    priority={true}
                    alt={"Product Image"}
                    className="object-cover w-screen h-72"
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
                {userWish?.includes(productId) || addWish ? (
                  <HeartIcon className="w-8 h-8 text-red-500" />
                ) : (
                  <HeartIcon className="w-8 h-8 text-red-100" />
                )}
              </button>
            </div>
            {currentUser?.id === productInfo?.expand?.seller?.id ? (
              ""
            ) : (
              <div className="w-full  p-2 text-white font-bold flex justify-center items-center">
                <button
                  onClick={goToChat}
                  className="bg-amber-400 p-2 px-6 rounded-full hover:bg-amber-500 transition duration-200"
                >
                  채팅
                </button>
              </div>
            )}
          </div>
        ) : (
          ""
        )}
      </div>
    </ProtectedPage>
  );
}
