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
import getUploadedTime from "@/lib/getUploadedTime";

export default function Chat() {
  const { user } = usePbAuth();
  const router = useRouter();
  const chatId = router.query["chatId"];

  // pb에서 실시간 업데이트하는 chat 관련 데이터 저장하는 state
  const [chatRecord, setChatRecord] = useState(null);
  const [readRecord, setReadRecord] = useState(null);

  // pb에서 받아온 chat 관련 데이터 저장하는 state
  const [userMe, setUserMe] = useState(); // 나 ID, 이름 저장
  const [userOther, setUserOther] = useState(); // 상대방 ID, 이름 저장

  // 로딩 중 상태 여부 저장하는 state
  const [isLoading, setIsLoading] = useState(false);

  const chatInput = useRef(); // 채팅 텍스트 input을 ref
  const imgRef = useRef(); // 이미지 input을 ref
  const historyRef = useRef(); // 채팅 내역 컨테이너를 ref

  async function handleRead() {
    setIsLoading(true);

    let record = chatRecord.expand.read;
    if (record.unreaduser === userMe?.id && record.unreadcount > 0) {
      record.unreadcount = 0;
      record.lastread = new Date();
      await pb
        .collection("chats_read")
        .update(chatRecord.expand.read.id, record);
    }
    setReadRecord(record);
    setIsLoading(false);
  }

  useEffect(() => {
    if (!chatRecord) return;
    handleRead();
  }, [chatRecord]);

  /* 'Chats' 콜렉션에서 Record 가져오는 function (subscribe로 호출) */
  async function getChatRecord() {
    setIsLoading(true);

    if (!chatId) return;
    let record = await pb
      .collection("chats")
      .getOne(chatId, { expand: "seller,buyer,messages,messages.owner,read" });

    setChatRecord(record);
    setIsLoading(false);
    return record;
  }

  async function getReadRecord(id) {
    setIsLoading(true);

    let record = await pb.collection("chats_read").getOne(id);

    setReadRecord(record);
    setIsLoading(false);
    return record;
  }

  /* 채팅 관련 정보 subscribe하는 function (useEffect로 처음에 호출) */
  async function subChatRecord() {
    setIsLoading(true);
    await pb.collection("chats").subscribe(chatId, getChatRecord);
    const record = await getChatRecord();
    await pb.collection("chats_read").subscribe(record.read, () => {
      getReadRecord(record.read);
    });

    // UserMe, UserOther 저장
    const buyer = record.expand.buyer;
    const seller = record.expand.seller;
    setUserMe(buyer.id === user.id ? buyer : seller);
    setUserOther(buyer.id === user.id ? seller : buyer);
    setIsLoading(false);
    return;
  }

  /** 상품 페이지로 이동하는 버튼 컴포넌트 */
  function ProductLink(props) {
    return (
      <div className="mx-3">
        <Link href={`/products/${props.link}`}>
          <div className="text-center rounded-2xl shadow-lg bg-amber-100 hover:bg-amber-200 transition duration-200">
            <Image
              src={`https://dearyouapi.moveto.kr/api/files/products/${props.link}/${props.thumb}`}
              width={255}
              height={255}
              alt="product image"
              className="p-2 rounded-xl"
            />
            <div className="pb-2 font-bold">상품 정보로 이동</div>
          </div>
        </Link>
      </div>
    );
  }

  function ChatHistory() {
    //채팅 창 컴포넌트
    const messages = chatRecord?.expand["messages"];

    return (
      <div className="h-screen flex flex-col">
        <div className="flex p-2 px-4 items-center fixed top-0 right-0 left-0 bg-white">
          <Link href={"/chats"}>
            <ArrowLeftIcon className=" w-8 h-8 bg-amber-400 text-white p-2 rounded-full" />
          </Link>
          <h3 className="text-xl font-semibold ml-4">{userOther?.name}</h3>
        </div>
        <div
          className="flex flex-col h-full pt-12 overflow-y-auto border-y-2 scrollbar-hide"
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
                    {getUploadedTime(data?.created)}
                  </div>
                </div>

                {data?.pdlink ? (
                  <ProductLink link={data?.pdlink} thumb={data?.pdthumblink} />
                ) : null}
                {data.image.length > 0 ? (
                  <Image
                    src={`https://dearyouapi.moveto.kr/api/files/messages/${data.id}/${data.image}`}
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
        </div>
        <div className="w-full h-20"></div>
      </div>
    );
  }

  async function uploadNewChat(msgData) {
    try {
      const msgRelation = await pb.collection("messages").create(msgData);

      let newChatRecord = chatRecord;
      let newReadRecord = readRecord;

      newReadRecord.unreaduser = userOther.id;
      newReadRecord.unreadcount += 1;
      newChatRecord.messages.push(msgRelation.id);

      await pb.collection("chats_read").update(readRecord.id, newReadRecord);
      await pb.collection("chats").update(chatRecord.id, newChatRecord);
    } catch {
      console.error("Message Upload Failed");
    }
    clearDraft();
    return;
  }

  async function handleChatInput() {
    // 메시지 보내기 버튼 눌렀을 때 처리
    setIsLoading(true);

    if (chatInput.current.value.length === 0) {
      alert("메시지를 입력하세요.");
      return;
    }

    const msgData = new FormData();
    msgData.append("text", chatInput.current.value);
    msgData.append("owner", pb.authStore.model.id);

    uploadNewChat(msgData);

    setIsLoading(false);
  }

  async function handleImageInput() {
    //이미지 보내기 버튼 눌렀을 때 처리
    setIsLoading(true);

    const msgData = new FormData();
    msgData.append("text", chatInput.current.value);
    msgData.append("owner", pb.authStore.model.id);
    msgData.append("image", imgRef.current.files[0]);

    uploadNewChat(msgData);

    setIsLoading(false);
  }

  function saveDraft() {
    localStorage.setItem(
      `${user.id}-${chatRecord.id}`,
      chatInput.current.value,
    );
  }
  function clearDraft() {
    localStorage.setItem(`${user.id}-${chatRecord.id}`, "");
  }
  function ChatInput() {
    //채팅 입력 컴포넌트
    return (
      <div className="fixed bottom-0 right-0 left-0 p-2 bg-white w-full">
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
              if (e.key === "Enter") {
                handleChatInput();
              }
            }}
            onChange={saveDraft}
            type="text"
            placeholder="메시지를 입력하세요. . ."
            defaultValue={localStorage.getItem(`${user?.id}-${chatRecord?.id}`)}
            autoFocus
          />
          <div className=" bg-amber-300 hover:bg-amber-400 transition duration-200 rounded-full my-auto mx-1 flex justify-center items-center p-1">
            <ArrowSmallUpIcon
              onClick={handleChatInput}
              className="w-7 h-7 text-white"
            />
          </div>
          <div>{readRecord?.unreadcount}</div>
        </div>
      </div>
    );
  }

  /** 처음 페이지 로딩할 때 subChatRecord 호출 */
  useEffect(() => {
    if (!router.isReady) return;
    subChatRecord(); // pb에서 Chat Record 실시간으로 가져오도록 subscribe
  }, [router.isReady]);

  /** subChatRecord 호출 후 처음으로 Chat, ChatRead 데이터 가져오기 */
  useEffect(() => {
    if (!userOther) return;
    getChatRecord();
  }, [userOther]);

  /** 페이지를 새로고침하거나 새 메시지가 오면 아래로 자동 스크롤 */
  useLayoutEffect(() => {
    try {
      const history = historyRef.current;
      history.scrollTop = history.scrollHeight;
    } catch {}
  }, [chatRecord, readRecord, isLoading]);

  if (chatRecord == null) {
    // 접속할 수 없는 or 존재하지 않는 chatId일 경우
    return (
      <ProtectedPage>
        <div className="w-full min-h-screen bg-slate-50 flex justify-center items-center">
          <div className="text-base">잘못된 채팅입니다.</div>
        </div>
      </ProtectedPage>
    );
  } else {
    return (
      <ProtectedPage>
        <div className="w-full min-h-screen bg-slate-50">
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
