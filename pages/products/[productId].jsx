import { useEffect, useRef, useState } from "react";
import pb from "@/lib/pocketbase";
import Image from "next/image";
import Link from "next/link";
import { PencilSquareIcon, ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import getUploadedTime from "@/lib/getUploadedTime";
import { usePbAuth } from "@/contexts/AuthWrapper";
import ProtectedPage from "@/components/ProtectedPage";
import BottomBar from "@/components/BottomBar";
import Layout from "@/components/Layout";

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
  const [imageScroll, setImageScroll] = useState(1);
  const imageRef = useRef();
  const router = useRouter();

  useEffect(() => {
    async function getProductInfo() {
      const record = await pb.collection("products").getOne(productId, {
        expand: "seller",
      });
      if (record.isConfirmed) {
        setProductInfo(record);
      } else {
        setProductInfo(false);
      }
    }
    async function getUserWish() {
      const userInfo = await pb
        .collection("users")
        .getOne(pb.authStore.model.id);
      setUserWish(userInfo.wishes);
    }

    getProductInfo();
    getUserWish();
  }, []);

  //현재 사용자의 wishes에 product를 추가하는 버튼의 함수
  const currentUser = usePbAuth().user;

  async function controlWish() {
    try {
      if (userWish.includes(productId)) {
        const originWishes = userWish;
        const updatedWishes = originWishes.filter((wish) => wish !== productId);
        setUserWish(updatedWishes);
        const updatedUser = await pb
          .collection("users")
          .update(pb.authStore.model?.id, {
            wishes: updatedWishes,
          });
      } else {
        setUserWish([...userWish, productId]);
        const originWishes = userWish;
        const updatedUser = await pb
          .collection("users")
          .update(currentUser.id, {
            wishes: [...originWishes, productId],
          });
      }
    } catch (error) {
      console.error("Error adding product to wishlist:", error);
    }
  }

  /** 판매자와 채팅 버튼 누를 때 호출 */
  async function goToChat() {
    const checkChat = await pb.collection("chats").getFullList({
      // 해당 판매자, 구매자의 채팅 기록이 있는지 확인
      filter: `(buyer.id="${pb.authStore.model.id}"&&seller.id="${productInfo.expand.seller.id}")||
              (seller.id="${pb.authStore.model.id}"&&buyer.id="${productInfo.expand.seller.id}")`,
      expand: "read",
    });

    let newChat = null; // 새로운 채팅 콜렉션 데이터 저장
    if (checkChat.length > 0) {
      // 처음 대화하는 상대가 아닐 경우 -> checkChat에서 가져오기
      const newChatRead = await pb
        .collection("chats_read")
        .update(checkChat[0].read, {
          unreaduser: productInfo.expand.seller.id,
          unreadcount: checkChat[0].expand.read.unreadcount + 1,
        });
      newChat = checkChat[0];
    } else {
      // 처음 대화하는 상대일 경우 -> 콜렉션 create해 가져오기
      let newChatRead = await pb.collection("chats_read").create({
        unreaduser: productInfo.expand.seller.id,
        unreadcount: 1,
      });
      newChat = await pb.collection("chats").create({
        seller: productInfo.expand.seller.id,
        buyer: pb.authStore.model.id,
        read: newChatRead.id,
      });
      newChatRead.chat = newChat.id;
      await pb.collection("chats_read").update(newChatRead.id, newChatRead);
    }

    // 메시지 데이터 create
    const defaultMessage = {
      text: `안녕하세요. "${productInfo.name}"에 대해 문의하고 싶어요!`,
      pdlink: productId,
      pdthumblink: productInfo.photos[0],
      owner: pb.authStore.model.id,
    };
    const createDefaultMessage = await pb
      .collection("messages")
      .create(defaultMessage);

    // 채팅 데이터 update
    newChat.messages.push(createDefaultMessage.id);
    const updateChat = await pb.collection("chats").update(newChat.id, newChat);

    router.push(`/chats/${newChat.id}`);
  }

  /** 나눔(판매) 마감 버튼 클릭 시 실행 */
  async function closeProduct() {
    try {
      let newProductInfo = productInfo;
      newProductInfo.soldDate = new Date();
      await pb.collection("products").update(productId, newProductInfo);
      setProductInfo(newProductInfo);
      router.push(`/products/${productId}`);
    } catch (error) {
      console.error("Error closing the product:", error);
    }
  }
    
  //이미지 넘김 버튼, 현재 이미지 번호가 담긴 UI
  function ImageUI() {
    return (
      <div className="absolute w-full sm:w-80 opacity-60 hover:opacity-100">
        <div className="absolute m-2 p-2 rounded-2xl text-sm bg-slate-700 text-white">
          {imageScroll}/{imageRef?.current?.children.length}</div>
          {imageScroll < imageRef?.current?.children.length ? 
          (<ChevronRightIcon className="absolute m-2 right-0 top-36 white w-8 h-8" onClick={() => {
            imageRef.current.scrollTo({
              left: (imageScroll) * imageRef.current.offsetWidth,
              behavior: 'smooth',
            });
            }}/>) : null}
          {imageScroll > 1 ?
          (<ChevronLeftIcon className="absolute m-2 left-0 top-36 white w-8 h-8"onClick={() => {
            imageRef.current.scrollTo({
              left: (imageScroll-2) * imageRef.current.offsetWidth,
              behavior: 'smooth',
            });      
            }}/>) : null}
      </div>
    )
  }
  return (
    <ProtectedPage>
      {productInfo ? (
      <div className="w-full min-h-screen bg-slate-50 sm:flex sm:flex-col sm:justify-center sm:items-center sm:pb-24">
        {productInfo ? (
          <div className="relative sm:flex sm:bg-white sm:p-4 md:p-8 sm:rounded-xl sm:shadow-xl">
            <ImageUI/>
            <div className="bg-white sm:h-80 sm:w-80 flex overflow-x-auto  scrollbar-hide snap-x" ref={imageRef} 
              onScroll={() => {
                setImageScroll(Math.round(imageRef?.current.scrollLeft / imageRef?.current.offsetWidth) + 1);
              }}>
              {productInfo.photos.map((data, key) => (
                <div
                  className={`w-screen h-80 sm:h-80 sm:w-80 snap-center  flex-shrink-0`}
                  key={key}
                >
                  <Image
                    src={`https://dearyouapi.moveto.kr/api/files/products/${productId}/${data}`}
                    width={300}
                    height={300}
                    priority={true}
                    alt={"Product Image"}
                    className="object-cover w-screen h-80 sm:w-80"
                  />
                </div>
              ))}
            </div>
            <div className="sm:flex sm:flex-col sm:w-52 sm:pl-4 md:w-80 lg:w-96">
              <div className="p-4 sm:p-2 flex flex-col ">
                <div className=" pb-2 border-b-2 flex justify-between items-center">
                  <div className="text-xl font-bold">{productInfo.name}</div>
                  <div className="flex items-center">
                    <div className="flex flex-col mr-2">
                      <div className="text-sm">
                        {productInfo.expand.seller.name}
                      </div>
                      <div className="text-sm">
                        {productInfo.expand.seller.studentId}
                      </div>
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
                      {getUploadedTime(productInfo.created)}
                    </div>
                    <div className="ml-auto">
                      {productInfo.soldDate
                        ? `${getUploadedTime(productInfo.soldDate)}에 나눔 완료`
                        : "나눔 중"}
                    </div>
                    <div className="font-medium text-lg my-2">
                      {productInfo.explain}
                    </div>
                    <div>종류: {productInfo.type}</div>
                  </div>
                  <button onClick={controlWish}>
                    {userWish?.includes(productId) ? (
                      <HeartIcon className="w-8 h-8 text-red-500" />
                    ) : (
                      <HeartIcon className="w-8 h-8 text-red-100" />
                    )}
                  </button>
                </div>
                {currentUser?.id === productInfo?.expand?.seller?.id ? (
                  <div className="w-full  p-2 text-white font-bold flex justify-center items-center">
                    <button
                      onClick={() =>
                        router.push(`/products/review/${productInfo.id}`)
                      }
                      className={`p-2 px-6 rounded-full ${
                        productInfo?.soldDate
                          ? "bg-gray-400"
                          : "bg-blue-400 hover:bg-blue-500 transition duration-200"
                      }`}
                      disabled={productInfo.soldDate ? true : false}
                    >
                      나눔 완료
                    </button>
                  </div>
                ) : (
                  <div className="w-full  p-2 text-white font-bold flex justify-center items-center">
                    <button
                      onClick={goToChat}
                      className={`p-2 px-6 rounded-full ${
                        productInfo?.soldDate
                          ? "bg-gray-400"
                          : "bg-amber-400 hover:bg-amber-500 transition duration-200"
                      }`}
                      disabled={productInfo.soldDate ? true : false}
                    >
                      판매자와 채팅
                    </button>
                  </div>
                )}
                <div className="w-full h-16 sm:h-0"></div>
              </div>
            </div>
          ) : ""}
        </div>
      ) : (
        <Layout>
          <div className="flex justify-center items-center m-auto text-xl font-semibold text-slate-500">
            <div>정보가 없습니다.</div>
          </div>
        </Layout>
      )}
      <BottomBar />
    </ProtectedPage>
  );
}
