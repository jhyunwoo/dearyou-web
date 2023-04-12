import ProtectedPage from "@/components/ProtectedPage";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { usePbAuth } from "../../contexts/AuthWrapper";
import Image from "next/image";
import pb from "@/lib/pocketbase";

export default function Chat() {
  const { user, signOut } = usePbAuth();
  const router = useRouter();
  const [chatInfo, setChatInfo] = useState(null); // pb에서 받아온 chat 데이터 저장하는 state

  async function getChatInfo(){ //채팅 관련 정보 pb에서 가져옴
    const chatId = router.query['chatId'];
    const resultList = await pb
      .collection('chats')
      .getFullList({ expand: 'messages,seller,buyer,messages.owner' });

    try{
      for(let i = 0; i < resultList.length; i++){ // chats 리스트에서 id가 일치하는 채팅데이터 찾기
        //console.log('-> ', resultList[i]['id'], ', router query: ', chatId);
        if(resultList[i]['id'] === chatId){
          setChatInfo(resultList[i]);
          //console.log(chatInfo['id']);
          await pb.collection('chats').subscribe( // Real time 채팅 내역 업데이트
            chatInfo['id'], function (e) {
            getChatInfo();
          });
          return;
        }
      }
    }
    catch{ return; }
  }

  function ChatHistory(){ //채팅 창 컴포넌트
    const messages = chatInfo.expand['messages'];
    const buyer = chatInfo.expand['buyer'];
    const seller = chatInfo.expand['seller'];
    const counterpart = (user.id===buyer.id) ? seller.name : buyer.name; // 대화 상대 이름

    //console.log(chatInfo.expand['messages']);
    return (
    <div>
      <h3 className="text-2xl font-bold text-center">{counterpart}님과의 채팅</h3>
      <p className="text-center">대화 시 언어품격을 지켜 주세요...^^</p>
      <div className="grid grid-cols-1 h-[32rem] overflow-y-auto m-5 p-3 border-4 border-slate-100 rounded-2xl">
      {messages?.map((data, key) => (
        <div className="m-2 p-2 border-2 border-gray-500" key={key}>
          <div className="text-blue-800 font-bold">{data?.expand['owner'].name}
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
      </div>
    </div>);
  }

  function ChatInput(){ //채팅 입력
    // 구현 예정

    // 앞으로 구현할 것
    // 1. 입력한 내용 pb에 전송 및 저장
    // 2. ChatHistory 컴포넌트에서 시간순(created)으로 메시지 보여주기
  }

  useEffect(() => {
    if(!router.isReady) return;
    getChatInfo();
  }, [router.isReady]);


  if(chatInfo==null){ // 접속할 수 없는 or 존재하지 않는 chatId일 경우
    return(
      <ProtectedPage>
        <div>Invalid Path</div>
      </ProtectedPage>
    );
  }
  else{
    return (
      <ProtectedPage>
        <div>Chat Id: '{chatInfo['id']}'</div>
        <div>Buyer: '{chatInfo['buyer']}' Seller: '{chatInfo['seller']}'</div>
        <ChatHistory />
      </ProtectedPage>
    );
  }
}
