import ProtectedPage from "@/components/ProtectedPage";
import { useRouter } from "next/router";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { usePbAuth } from "../../contexts/AuthWrapper";
import Link from "next/link";
import Image from "next/image";
import pb from "@/lib/pocketbase";
import {
  ArrowLeftIcon,
  PhotoIcon,
  ArrowSmallUpIcon,
} from "@heroicons/react/24/outline";

export default function Chat() {
  const { user, signOut } = usePbAuth();
  const router = useRouter();
  const [chatRecord, setChatRecord] = useState(null); // pb에서 받아온 chat 데이터 저장하는 state
  const [isLoading, setIsLoading] = useState(false);

  const chatInput = useRef(null); // 채팅 텍스트 input을 ref
  const imgRef = useRef(); // 이미지 input을 ref
  const bottomRef = useRef(null); // 채팅 메시지 Grid의 자동 스크롤 구현에 쓰는 Ref
  const historyRef = useRef(); // 채팅 내역 컨테이너를 ref

  async function getChatRecord() {
    //채팅 관련 정보 pb에서 가져오는 function
    setIsLoading(true);

    const chatId = router.query["chatId"];

    const resultList = await pb
      .collection("chats")
      .getFullList({ expand: "seller,buyer,messages,messages.owner" });

    try {
      for (let i = 0; i < resultList.length; i++) {
        // chats 리스트에서 id가 일치하는 채팅데이터 찾기
        if (resultList[i]["id"] === chatId) {
          console.log("getChatInfo: 업데이트된 Record 불러옴");
          //console.log(resultList[i]);
          setChatRecord(resultList[i]);

          setIsLoading(false);
          return;
        }
      }
    } catch {
      setIsLoading(false);
      return;
    }
  }

  async function subChatRecord() {
    //채팅 관련 정보 subscribe하는 function
    setIsLoading(true);

    const chatId = router.query["chatId"];

    const resultList = await pb
      .collection("chats")
      .getFullList({ expand: "seller,buyer,messages,messages.owner" });

    try {
      for (let i = 0; i < resultList.length; i++) {
        // chats 리스트에서 id가 일치하는 채팅데이터 찾기
        if (resultList[i]["id"] === chatId) {
          console.log("subChatInfo: 처음으로 Record 불러옴");
          //console.log(resultList[i])
          setChatRecord(resultList[i]);

          await pb.collection("chats").subscribe(
            // Real time 채팅 내역 업데이트
            resultList[i]["id"],
            async function (e) {
              console.log("chats collection is updated");
              await getChatRecord();
            },
          );

          console.log("subChatInfo: pb subscribe 완료");

          setIsLoading(false);

          return;
        }
      }
    } catch {
      setIsLoading(false);
      return;
    }
  }

  function getMsgTime(time) {
    // 메시지 보낸 시각을 ~분 전과 같은 형태로 처리
    const dateThen = new Date(time);
    const dateNow = new Date();

    let seconds = (dateNow.valueOf() - dateThen.valueOf()) / 1000;
    if (seconds <= 5) {
      return "방금 전";
    } else if (seconds <= 60) {
      return Math.floor(seconds) + "초 전";
    } else if (seconds <= 3600) {
      return Math.floor(seconds / 60) + "분 전";
    } else if (seconds <= 86400) {
      return Math.floor(seconds / 3600) + "시간 전";
    } else if (seconds <= 31536000) {
      return Math.floor(seconds / 86400) + "일 전";
    } else {
      return Math.floor(seconds / 31536000) + "년 전";
    }
  }

  function ChatHistory() {
    //채팅 창 컴포넌트
    const messages = chatRecord.expand["messages"];
    const buyer = chatRecord.expand["buyer"];
    const seller = chatRecord.expand["seller"];
    const user_me = user.id === buyer.id ? buyer.name : seller.name; // '내' 이름
    const user_other = user.id === buyer.id ? seller.name : buyer.name; // 대화 상대 이름

    //console.log(chatInfo.expand['messages']);
    return (
      <div className=" h-screen flex flex-col">
        <div className="flex p-4 items-center ">
          <Link href={"/chats"}>
            <ArrowLeftIcon className=" w-8 h-8 bg-amber-400 text-white p-2 rounded-full" />
          </Link>
          <h3 className="text-xl font-semibold ml-4">{user_other}</h3>
        </div>
        <div
          className="flex flex-col h-full overflow-y-auto border-y-2 scrollbar-hide"
          ref={historyRef}
        >
          {messages?.map((data, key) => (
            <div
              className={
                data?.expand["owner"]?.id === user.id
                  ? "flex ml-6"
                  : "flex mr-6"
              }
              key={key}
            >
              <div
                className={
                  data?.expand["owner"]?.id === user.id ? "ml-auto" : "mr-auto"
                }
                key={key}
              >
                <div className="ml-4 flex items-center mt-4">
                  <div className="text-slate-700 font-semibold">
                    {data?.expand["owner"]?.name}
                  </div>
                  <div className=" text-gray-400 text-sm mx-1 font-light">
                    {getMsgTime(data?.created)}
                  </div>
                </div>
                {data.image.length > 0 ? (
                  <Image
                    src={`https://dearu-pocket.moveto.kr/api/files/messages/${data.id}/${data.image}`}
                    width={300}
                    height={300}
                    alt={data.id}
                    className=" rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="mx-3 my-1 px-3 py-2 bg-white shadow-lg rounded-xl break-words max-w-[230px]">
                    <div>{data?.text}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="w-full h-16"></div>
      </div>
    );
  }

  async function handleChatInput() {
    // 메시지 보내기 버튼 눌렀을 때 처리
    console.log("handleChatInput: 메시지 입력됨");
    setIsLoading(true);

    if (chatInput.current.value.length === 0) {
      alert("메시지를 입력하세요.");
      return;
    }

    const msgData = new FormData();
    msgData.append("text", chatInput.current.value);
    msgData.append("owner", pb.authStore.model.id);
    try {
      const msgRelation = await pb.collection("messages").create(msgData);
      let newRecord = chatRecord;
      newRecord.messages.push(msgRelation.id);
      await pb.collection("chats").update(chatRecord.id, newRecord);
    } catch {
      console.error("Message Upload Failed");
    }
    setIsLoading(false);
  }

  async function handleImageInput() {
    //이미지 보내기 버튼 눌렀을 때 처리
    console.log("handleImageInput: 메시지 입력됨");
    setIsLoading(true);

    const msgData = new FormData();
    msgData.append("text", chatInput.current.value);
    msgData.append("owner", pb.authStore.model.id);
    msgData.append("image", imgRef.current.files[0]);
    try {
      const msgRelation = await pb.collection("messages").create(msgData);

      let newRecord = chatRecord;
      newRecord.messages.push(msgRelation.id);
      await pb.collection("chats").update(chatRecord.id, newRecord);

      console.log("debug3");
    } catch {
      console.error("Message Upload Failed");
    }
    setIsLoading(false);
  }

  function ChatInput() {
    //채팅 입력 컴포넌트
    return (
      <div className="fixed bottom-0 right-0 left-0 p-2 backdrop-blur-sm  w-full">
        <div className="text-center flex w-full">
          <label
            htmlFor="input-file"
            onChange={handleImageInput}
            className="my-auto m-1 bg-amber-500 hover:bg-amber-600 rounded-lg p-1"
          >
            <PhotoIcon className="w-7 h-7 text-white" />
            <input
              type="file"
              id="input-file"
              className="hidden"
              accept="image/jpg, image/png, image/jpeg, image/gif, image/webp, image/heic, image/heic-sequence, image/heif-sequence image/heif"
              ref={imgRef}
            />
          </label>
          <input
            className="w-full rounded-full p-2 px-3 outline-none"
            ref={chatInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleChatInput();
            }}
            type="text"
            placeholder="메시지를 입력하세요. . ."
            autoFocus
          />
          <div className=" bg-amber-300 hover:bg-amber-400 transition duration-200 rounded-full my-auto mx-1 flex justify-center items-center p-1">
            <ArrowSmallUpIcon
              onClick={handleChatInput}
              className="w-7 h-7 text-white"
            />
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!router.isReady) return;
    subChatRecord(); // pb에서 Chat Record 실시간으로 가져오도록 subscribe
  }, [router.isReady]);

  useLayoutEffect(() => {
    try {
      const history = historyRef.current;
      history.scrollTop = history.scrollHeight; // 페이지를 새로고침하거나 새 메시지가 오면 아래로 자동 스크롤
    } catch {}
  }, [chatRecord, isLoading]);

  if (chatRecord == null) {
    // 접속할 수 없는 or 존재하지 않는 chatId일 경우
    return (
      <ProtectedPage>
        <div>Invalid Path</div>
      </ProtectedPage>
    );
  } else {
    return (
      <ProtectedPage>
        <div className="w-full h-screen bg-slate-50">
          <ChatHistory />
          <ChatInput />
        </div>
      </ProtectedPage>
    );
  }

  /*
          <div>Chat Id: '{chatRecord['id']}'</div>
          <div>Buyer: '{chatRecord['buyer']}' Seller: '{chatRecord['seller']}'</div>
  */
}
