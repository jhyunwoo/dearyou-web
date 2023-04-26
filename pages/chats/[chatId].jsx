import ProtectedPage from "@/components/ProtectedPage";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { usePbAuth } from "../../contexts/AuthWrapper";
import Image from "next/image";
import pb from "@/lib/pocketbase";

export default function Chat() {
  const { user, signOut } = usePbAuth();
  const router = useRouter();
  const [chatRecord, setChatRecord] = useState(null); // pb에서 받아온 chat 데이터 저장하는 state
  const chatInput = useRef(null);
  const bottomRef = useRef(null); // 채팅 메시지 Grid의 자동 스크롤 구현에 쓰는 Ref

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
          console.log("subChatInfo: 처음으로 Record 불러옴")
          //console.log(resultList[i])
          setChatRecord(resultList[i]);
          
          await pb.collection('chats').subscribe( // Real time 채팅 내역 업데이트
            resultList[i]['id'], async function (e) {
            console.log("chats collection is updated")
            await getChatRecord()
          });

          console.log("subChatInfo: pb subscribe 완료")
          return;
        }
      }
    }
    catch{ return; }
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
        <h3 className="text-2xl font-bold text-center">{user_other}님과의 채팅</h3>
        <p className="text-center">대화 시 언어품격을 지켜 주세요...^^</p>
        <div className="grid grid-cols-1 h-[32rem] overflow-y-auto m-5 p-3 border-4 border-slate-100 rounded-2xl">
          {messages?.map((data, key) => (
          <div className="m-2 p-2 border-2 border-gray-500" key={key}>
            <div className="text-blue-800 font-bold">{data?.expand['owner']?.name}
              <span className="ml-3 text-gray-500 font-light">{data?.created}</span></div>
              {data.image.length > 0 ? 
                <Image
                src={`https://dearu-pocket.moveto.kr/api/files/messages/${data.id}/${data.image}`}
                width={300}
                height={300}
                alt={data.id}/>:null}
              <div>{data?.text}</div>
            </div>
          ))}
        <div ref={bottomRef} />
        </div>
      </div>);
    
    // 이미지 표시하기 (나중에  구현)
    /*<span className="ml-3 text-gray-500 font-light">{data?.created}</span>
          {data.image.length > 0 ? 
            <Image
            src={`https://dearu-pocket.moveto.kr/api/files/messages/${data.id}/${data.image}`}
            width={300}
            height={300}
            alt={data.id}/>:null}*/
  }

  async function handleChatInput(){
    console.log('handleChatInput: 메시지 입력됨')
    //console.log(chatRecord)
    //console.log(chatInput.current.value)

    const msgData = {
      "text": chatInput.current.value,
      "owner": user.id
    };
    const msgRelation= await pb.collection('messages').create(msgData);
    
    let newRecord = chatRecord
    newRecord.messages.push(msgRelation.id)
    await pb.collection('chats').update(chatRecord.id, newRecord);
  }

  function ChatInput(){ //채팅 입력 컴포넌트
    return (
      <div className="text-center flex mx-10">
        <input className="w-full border-2"
          ref={chatInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleChatInput()
          }}
          type="text"
          placeholder="메시지를 입력하세요. . ."
        />
        <button onClick={handleChatInput} className="border-2 w-10">전송</button>
      </div>
    );

    // 앞으로 구현할 것
    // 1. ChatHistory 컴포넌트에서 시간순(created)으로 메시지 보여주기
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
        <div>Chat Id: '{chatRecord['id']}'</div>
        <div>Buyer: '{chatRecord['buyer']}' Seller: '{chatRecord['seller']}'</div>
        <ChatHistory />
        <ChatInput />
      </ProtectedPage>
    );
  }
}
