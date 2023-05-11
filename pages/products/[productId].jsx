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
      console.log(checkChat[0]);
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
      console.log(newChatRead);
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

    /**
    
    
    
    if (checkChat.length > 0) { 
      let newChat = checkChat[0];
      
      // Chats_read 데이터 업데이트
      let newChatRead = newChat.expand.read;
      newChatRead.unreadcount += 1;
      newChatRead.unreaduser = productInfo.expand.seller.id;
      const updateChatRead = await pb
        .collection("chats_read")
        .update(newChatRead.id, newChatRead);
      router.push(`/chats/${checkChat[0].id}`);

      // Chats 데이터 업데이트
      newChat.messages.push(createDefaultMessage.id);
      const updateChat = await pb
        .collection("chats")
        .update(checkChat[0].id, newChat);
    }
    else { 
      // Chats_read (Chat별로 읽은 메시지 관리하는 Collection) 생성
      const chatReadData = {
        unreaduser: productInfo.expand.seller.id,
        unreadcount: 1
      };
      const createNewChatRead = await pb.collection("chats_read").create(chatReadData);

      // Chats 데이터 생성
      const chatData = {
        seller: productInfo.expand.seller.id,
        buyer: pb.authStore.model.id,
        messages: createDefaultMessage.id,
        read: createNewChatRead.id
      };
      const createNewChat = await pb.collection("chats").create(chatData);

    }
    */
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
  console.log(productInfo.photos);
  return (
    <ProtectedPage>
      <BottomBar />
      <div className="w-full min-h-screen bg-slate-50 sm:flex sm:flex-col sm:justify-center sm:items-center">
        {productInfo ? (
          <div className="sm:flex sm:bg-white sm:p-4 md:p-8 sm:rounded-xl sm:shadow-xl">
            <div className="sm:h-96 sm:w-96 flex overflow-x-auto  scrollbar-hide snap-x">
              {productInfo.photos.map((data, key) => (
                <div
                  className={`w-screen h-96 sm:h-96 sm:w-96 snap-center  flex-shrink-0`}
                >
                  <Image
                    key={key}
                    src={`https://dearu-pocket.moveto.kr/api/files/products/${productId}/${data}`}
                    width={300}
                    priority={true}
                    height={300}
                    alt={"Product Image"}
                    className="object-cover w-screen h-96  sm:w-96"
                  />
                </div>
              ))}
            </div>
            <div className="sm:flex sm:flex-col sm:w-52 md:w-80 lg:w-96">
              <div className="p-4 flex flex-col ">
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
                <button onClick={addToWishlist}>
                  {userWish?.includes(productId) || addWish ? (
                    <HeartIcon className="w-8 h-8 text-red-500" />
                  ) : (
                    <HeartIcon className="w-8 h-8 text-red-100" />
                  )}
                </button>
              </div>
              {currentUser?.id === productInfo?.expand?.seller?.id ? (
                <div className="w-full  p-2 text-white font-bold flex justify-center items-center">
                  <button
                    onClick={closeProduct}
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
              <div className="w-full h-16"></div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </ProtectedPage>
  );
}
