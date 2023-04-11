import ProtectedPage from "@/components/ProtectedPage";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { usePbAuth } from "../../contexts/AuthWrapper";
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

    console.log(chatInfo.expand['messages']);
    return (
    <div>
      <h3 className="text-2xl font-bold text-center">{counterpart}님과의 채팅</h3>
      <p className="text-center">대화 시 언어품격을 지켜 주세요...^^</p>
      <div className="grid grid-cols-1"></div>
      {messages?.map((data, key) => (
        <div className="m-2 p-2 border-2 border-gray-500" key={key}>
          <div className="text-blue-800 font-bold">{data?.expand['owner'].name}
            <span className="ml-3 text-gray-500 font-light">{data?.created}</span></div>
          <div>{data?.text}</div>
        </div>
      ))}
    </div>);
  }

  async function subChatInfo(){
    await pb.collection('chats').subscribe('*', function (e) {
      console.log(e.record);
    });
  }
  useEffect(() => {
    if(!router.isReady) return;
    getChatInfo();
  }, [router.isReady]);

  useEffect(() => {
    subChatInfo();
  })

  if(chatInfo==null){
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
