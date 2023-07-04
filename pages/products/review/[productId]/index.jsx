import Layout from "@/components/Layout";
import ProtectedPage from "@/components/ProtectedPage";
import HeadBar from "@/components/HeadBar";
import BottomBar from "@/components/BottomBar";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import { StarIcon } from "@heroicons/react/24/outline";

export default function MyReviews() {
  const router = useRouter();
  const { productId } = router.query;
  const [rating, setRating] = useState(0);
  const [chatedUsers, setChatedUsers] = useState([]);
  const [selectedUser, setSelectedUset] = useState();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function onSubmit(data) {
    if (selectedUser && rating) {
      const reviewData = {
        product: productId,
        from: pb.authStore.model?.id,
        to: selectedUser.id,
        comment: data.review,
        rate: rating,
      };

      const record = await pb.collection("reviews").create(reviewData);
      const buyerInfo = await pb.collection("users").getOne(selectedUser.id);
      const updatedBuyer = await pb
        .collection("users")
        .update(selectedUser.id, { dignity: buyerInfo.dignity + rating });
      const closeProduct = await pb
        .collection("products")
        .update(productId, { soldDate: new Date(), buyer: selectedUser.id });

      const productInfo = await pb
        .collection("products")
        .getOne(productId, { expand: "seller, buyer" });

      const checkChat = await pb.collection("chats").getFullList({
        // 해당 판매자, 구매자의 채팅 기록이 있는지 확인
        filter: `(buyer.id="${pb.authStore.model.id}"&&seller.id="${productInfo.expand.buyer.id}")||
                (seller.id="${pb.authStore.model.id}"&&buyer.id="${productInfo.expand.buyer.id}")`,
      });

      let newChat = null; // 새로운 채팅 콜렉션 데이터 저장

      if (checkChat.length > 0) {
        // 처음 대화하는 상대가 아닐 경우 -> checkChat에서 가져오기
        newChat = await pb
          .collection("chats")
          .update(checkChat[0].id, {
            unreaduser: selectedUser?.id,
            unreadcount: checkChat[0].unreadcount + 1,
          });
      } else {
        // 처음 대화하는 상대일 경우 -> 콜렉션 create해 가져오기
        newChat = await pb.collection("chats").create({
          seller: productInfo.expand.seller?.id,
          buyer: pb.authStore.model.id,
          unreaduser: selectedUser.id,
          unreadcount: 1,
        });
        newChatRead.chat = newChat.id;
      }

      // 메시지 데이터 create
      const defaultMessage = {
        text: `리뷰를 남겨주세요.`,
        pdlink: closeProduct.id,
        pdthumblink: closeProduct.photos[0],
        owner: pb.authStore.model.id,
      };

      const createDefaultMessage = await pb
        .collection("messages")
        .create(defaultMessage);

      // 채팅 데이터 update
      newChat.messages.push(createDefaultMessage.id);
      const updateChat = await pb
        .collection("chats")
        .update(newChat.id, newChat);

      router.push("/");
    } else {
      alert("후기를 입력해주세요.");
    }
  }

  useEffect(() => {
    async function getChatedUsers() {
      let userList = [];
      const record = await pb
        .collection("users")
        .getOne(pb.authStore.model?.id, {
          expand: "chats(buyer).seller, chats(seller).buyer",
        });

      if (record.expand["chats(buyer)"]) {
        for (let i = 0; i < record.expand["chats(buyer)"].length; i++) {
          userList.push(record.expand["chats(buyer)"][i].expand.seller);
        }
      }
      if (record.expand["chats(seller)"]) {
        for (let i = 0; i < record.expand["chats(seller)"].length; i++) {
          userList.push(record.expand["chats(seller)"][i].expand.buyer);
        }
      }
      userList = userList.slice(0, 10);
      setChatedUsers(userList);
    }
    getChatedUsers();
  }, []);

  function Star({idx}){
    return (
      <StarIcon
      type="button"
      onClick={() => setRating(idx)}
      className={`p-1 px-4 w-full rounded-lg h-20 ${
        rating >= idx
          ? "stroke-amber-500 fill-amber-500"
          : "stroke-amber-500"
      }  transition duration-200`}
    />
    )
  }

  return (
    <ProtectedPage>
      <HeadBar title="거래 후기 남기기" />
      <BottomBar />
      <Layout>
        <div>
          <div className="text-lg font-semibold my-2">거래한 사람</div>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-auto scrollbar-hide">
            {chatedUsers?.map((data, key) => (
              <button
                key={key}
                onClick={() => setSelectedUset(data)}
                className={`${
                  selectedUser === data
                    ? "bg-amber-500 text-white"
                    : "bg-white hover:bg-amber-100 "
                } p-2 px-4 rounded-lg transition duration-200`}
              >
                <div>{data.name}</div>
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col mt-4">
          <div className="text-lg font-semibold my-2">거래 만족도</div>
          <div className="flex w-full justify-around space-x-1">
            <Star idx={1}/>
            <Star idx={2}/>
            <Star idx={3}/>
            <Star idx={4}/>
            <Star idx={5}/>
          </div>
          <div className="mt-4 text-lg font-semibold my-2">후기</div>
          <textarea
            className="p-2 px-4 h-48 rounded-lg outline-none w-full"
            {...register("review", {
              required: { value: true, message: "후기를 입력해주세요." },
            })}
          />
          {errors.review && <div>{errors.review.message}</div>}
          <button
            type="submit"
            className="bg-amber-400 p-2 rounded-full hover:bg-amber-500 transition duration-200 text-white font-semibold mt-4 text-lg"
          >
            제출
          </button>
        </form>
      </Layout>
    </ProtectedPage>
  );
}
