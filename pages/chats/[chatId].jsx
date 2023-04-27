import ProtectedPage from "@/components/ProtectedPage";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { usePbAuth } from "../../contexts/AuthWrapper";
import Link from "next/link";
import Image from "next/image";
import pb from "@/lib/pocketbase";
import { ArrowLeftIcon, PhotoIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

export default function Chat() {
  const { user, signOut } = usePbAuth();
  const router = useRouter();
  const [chatRecord, setChatRecord] = useState(null); // pb에서 받아온 chat 데이터 저장하는 state
  const [isLoading, setIsLoading] = useState(false);
  const chatInput = useRef(null);
  const bottomRef = useRef(null); // 채팅 메시지 Grid의 자동 스크롤 구현에 쓰는 Ref

  const imgRef = useRef();

  async function getChatRecord(){ //채팅 관련 정보 pb에서 가져오는 function
    const chatId = router.query['chatId'];
    const resultList = await pb
      .collection('chats')
      .getFullList({ expand: 'seller,buyer,messages,messages.owner' });

    try{
      for(let i = 0; i < resultList.length; i++){ // chats 리스트에서 id가 일치하는 채팅데이터 찾기
        if(resultList[i]['id'] === chatId){
          console.log("getChatInfo: 업데이트된 Record 불러옴")
          //console.log(resultList[i]);
          setChatRecord(resultList[i]);

          return;
        }
      }
    }
    catch{ return; }
  }

  async function subChatRecord(){ //채팅 관련 정보 subscribe하는 function
    const chatId = router.query['chatId'];
    const resultList = await pb
      .collection('chats')
      .getFullList({ expand: 'seller,buyer,messages,messages.owner' });

    try{
      for(let i = 0; i < resultList.length; i++){ // chats 리스트에서 id가 일치하는 채팅데이터 찾기
        if(resultList[i]['id'] === chatId){
          console.log("subChatInfo: 처음으로 Record 불러옴");
          //console.log(resultList[i])
          setChatRecord(resultList[i]);
          
          await pb.collection('chats').subscribe( // Real time 채팅 내역 업데이트
            resultList[i]['id'], async function (e) {
            console.log("chats collection is updated");
            await getChatRecord();
          });

          console.log("subChatInfo: pb subscribe 완료");
          bottomRef.current?.scrollIntoView({ 'behavior':'smooth' })
          return;
        }
      }
    }
    catch{ return; }
  }

  function getMsgTime(time){ // 메시지 보낸 시각을 ~분 전과 같은 형태로 처리
    const dateThen = new Date(time);
    const dateNow = new Date();
    let seconds = ( dateNow.valueOf() - dateThen.valueOf() ) / 1000;
    if(seconds <= 60){
      return (Math.floor(seconds) + '초 전')
    }
    else if(seconds <= 3600){
      return (Math.floor(seconds/60) + '분 전')
    }
    else if(seconds <= 86400){
      return (Math.floor(seconds/3600) + '시간 전')
    }
    else if(seconds <= 31536000){
      return (Math.floor(seconds/86400) + '일 전')
    }
    else{
      return (Math.floor(seconds/31536000) + '년 전')
    }
  }

  function ChatHistory(){ //채팅 창 컴포넌트
    const messages = chatRecord.expand['messages'];
    const buyer = chatRecord.expand['buyer'];
    const seller = chatRecord.expand['seller'];
    const user_me = (user.id===buyer.id) ? buyer.name : seller.name; // '내' 이름
    const user_other = (user.id===buyer.id) ? seller.name : buyer.name; // 대화 상대 이름
    
    //console.log(chatInfo.expand['messages']);
    return (
      <div>
        <div className="flex pt-5">
          <Link href={'/chats/'}><ArrowLeftIcon className="ml-4 w-8 h-8"/></Link>
          <h3 className="text-2xl font-bold text-center mx-auto">{user_other}님과의 채팅</h3>
        </div>
        <p className="text-center">대화 시 언어품격을 지켜 주세요...^^</p>
        <div className="grid grid-cols-1 h-[34rem] overflow-y-auto mt-3 border-y-2">
          {messages?.map((data, key) => (
          <div className={data?.expand['owner']?.id === user.id ? "ml-auto" : "mr-auto"} key={key}>
            <div className="mx-3 my-1 p-3 border-2 border-gray-300 rounded-2xl">
              <div className="text-blue-800 font-bold">{data?.expand['owner']?.name}
              <span className="ml-2 text-gray-300 font-light">{getMsgTime(data?.created)}</span></div>
              {data.image.length > 0 ? 
                <Image
                src={`https://dearu-pocket.moveto.kr/api/files/messages/${data.id}/${data.image}`}
                width={300}
                height={300}
                alt={data.id}/>:null}
              <div>{data?.text}</div>
              </div>
            </div>
          ))}
        <div ref={bottomRef} />
        </div>
      </div>)
  }

  async function handleChatInput(){ // 메시지 보내기 버튼 눌렀을 때 처리
    console.log('handleChatInput: 메시지 입력됨')
    setIsLoading(true);

    if(chatInput.current.value.length === 0){
      alert("메시지를 입력하세요.");
      bottomRef.current?.scrollIntoView();
      return;
    }

    const msgData = new FormData();
    msgData.append("text", chatInput.current.value);
    msgData.append("owner", pb.authStore.model.id);
    try {
      const msgRelation = await pb
        .collection('messages')
        .create(msgData);
      let newRecord = chatRecord;
      newRecord.messages.push(msgRelation.id);
      await pb
        .collection('chats')
        .update(chatRecord.id, newRecord);
    } catch {
      console.error("Message Upload Failed");
    }
    setIsLoading(false);
  }

  async function handleImageInput(){ //이미지 보내기 버튼 눌렀을 때 처리
    console.log('handleImageInput: 메시지 입력됨')
    setIsLoading(true);

    const msgData = new FormData();
    msgData.append("text", chatInput.current.value);
    msgData.append("owner", pb.authStore.model.id);
    msgData.append("image", imgRef.current.files[0]);
    try {
      const msgRelation = await pb
        .collection('messages')
        .create(msgData);
      
      let newRecord = chatRecord;
      newRecord.messages.push(msgRelation.id);
      await pb
        .collection('chats')
        .update(chatRecord.id, newRecord);
        
      console.log("debug3");
    } catch {
      console.error("Message Upload Failed");
    }
    setIsLoading(false);
  }

  function ChatInput(){ //채팅 입력 컴포넌트
    return (
      <div>
        <div className="text-center flex mx-10 pt-5">
          <input className="w-full border-2 border-gray-300 rounded-xl mr-2 px-2"
            ref={chatInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleChatInput()
            }}
            type="text"
            placeholder="메시지를 입력하세요. . ."
            autoFocus
          />
          <label
              htmlFor="input-file"
              onChange={handleImageInput}
              ><PhotoIcon className="w-10 h-10"/>
              <input
                type="file"
                id="input-file"
                className="hidden"
                ref={imgRef}
              />
          </label>
          <PaperAirplaneIcon onClick={handleChatInput} className="w-10 h-10" />
        </div>
            
  
      </div>
    );
  }

  useEffect(() => {
    if(!router.isReady) return;
    subChatRecord(); // pb에서 Chat Record 실시간으로 가져오도록 subscribe
  }, [router.isReady]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView() // 페이지를 새로고침하거나 새 메시지가 오면 아래로 자동 스크롤
  }, [chatRecord])


  if(chatRecord==null){ // 접속할 수 없는 or 존재하지 않는 chatId일 경우
    return(
      <ProtectedPage>
        <div>Invalid Path</div>
      </ProtectedPage>
    );
  }
  else{
    return (
      <ProtectedPage>
        <div className="shadow-2xl w-[32rem] mx-auto h-screen">
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
