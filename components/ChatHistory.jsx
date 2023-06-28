import ProtectedPage from "@/components/ProtectedPage";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  CheckIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import getUploadedTime from "@/lib/getUploadedTime";

// 채팅 창(메시지 목록) 컴퓨넌트
export default function ChatHistory({chatRecord, readRecord, userMe, userOther}){
    // 하단 메시지 inView -> 사용자가 채팅창 하단을 보고 있는지 판별
    const [msgRef, msgInView] = useInView();
    const [showDown, setShowDown] = useState(false);

    // ref
    const historyRef = useRef(); // 채팅 내역 컨테이너 ref
    const lastMsgRef = useRef(); // 마지막 메시지 ref (y좌표 가져오는 용도)
    
    const messages = chatRecord?.expand["messages"];
    const lastread = readRecord?.lastread;
    let lastreadidx = -1;
    let lastunread = true;

    // 마지막으로 읽은 채팅이 몇 번째 채팅인지 구하기
    setLastReadIdx();
    function setLastReadIdx(){
        for (let i = 0; i < messages.length; i++) {
            if (
            messages[i].expand["owner"]?.id === userMe?.id &&
            messages[i].created < lastread) 
            {
                lastreadidx = i;
                if (i == messages.length - 1) {
                    lastunread = false;
                }
            }
            else if (messages[i].expand["owner"]?.id !== userMe?.id) {
                lastreadidx = -1;
            }
        }
    }

    // 새로고침 시 스크롤 위치를 최하단으로 설정
    useEffect(() => {
        const history = historyRef.current;
        history.scrollTop = history.scrollHeight;
        localStorage.setItem("chatScroll", history.scrollTop);
    }, [userMe])

    // 페이지를 새로고침하거나 새 메시지가 오면 아래로 자동 스크롤
    useLayoutEffect(() => {
        try {
        const history = historyRef.current;
        const lastMsg = lastMsgRef.current;
        const height = parseInt(localStorage.getItem("chatScroll"));

        if (
            height + history.clientHeight + lastMsg.clientHeight + 5 <
            history.scrollHeight
        ) {
            //사용자가 채팅창 상단을 보고 있는 경우
            history.scrollTop = height;
        } else {
            history.scrollTop = history.scrollHeight;
            localStorage.setItem("chatScroll", history.scrollTop);
        }
        } catch {}
    }, [chatRecord, readRecord]);

    // 하단 메시지가 보이지 않으면 아래로 이동 버튼 표시
    useEffect(() => {
      const history = historyRef.current;
      const height = parseInt(localStorage.getItem("chatScroll"));
      if (msgInView) {
        setShowDown(false);
      } else if (height + history.clientHeight + 2 < history.scrollHeight) {
        setShowDown(true);
      }
    }, [msgInView]);

    
    // 상품 페이지로 이동하는 버튼 컴포넌트
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

    // 리뷰 페이지로 이동하는 버튼 컴포넌트
    function ReviewLink(props) {
        return (
        <div className="mx-3">
            <Link
            href={`/products/buyer-review/${props.link}?sellerId=${userOther?.id}`}
            >
            <div className="text-center rounded-2xl shadow-lg bg-amber-100 hover:bg-amber-200 transition duration-200">
                <Image
                src={`https://dearyouapi.moveto.kr/api/files/products/${props.link}/${props.thumb}`}
                width={255}
                height={255}
                alt="product image"
                className="p-2 rounded-xl"
                />
                <div className="pb-2 font-bold">리뷰 남기러 가기</div>
            </div>
            </Link>
        </div>
        );
    }

    // 읽음, 안읽음 표시 컴포넌트
    function ReadMark({itemKey, offset}){
        return (
            <div>
                {itemKey === lastreadidx ? (
                    <div className={`absolute bottom-0 left-[-${offset}px] flex`}>
                        <CheckIcon className="stroke-slate-400 w-4 h-4" />
                        <div className="text-slate-400 text-xs">읽음</div>
                    </div>
                ) : null}
                {itemKey === messages.length - 1 && lastunread ? (
                    <div className={`absolute bottom-0 left-[-${offset}px] flex`}>
                        <div className="text-slate-400 text-xs">안읽음</div>
                    </div>
                ) : null}
            </div>
        )
    }

    // 채팅 메시지가 내가 보낸 건지 여부
    const isMyMsg = (data) => { return data?.expand["owner"]?.id === userMe?.id; };

    // ChatHistory 컴포넌트 Return
    return (
      <div className="h-screen flex flex-col">
        <div
          className="flex flex-col h-full pt-12 overflow-y-auto border-y-2 scrollbar-hide"
          ref={historyRef}
          onScroll={() => {
            localStorage.setItem("chatScroll", historyRef.current.scrollTop);
          }}
        >
          {messages?.map((data, key) => (
            <div
              className={ isMyMsg(data) ? "flex ml-6" : "flex mr-6" }
              key={key}
            >
              <div
                className={ isMyMsg(data) ? "relative ml-auto" : "mr-auto" }
                key={key}
              >
                <div className={`mx-4 flex items-center mt-2`}>
                  <div className={`text-slate-700 font-semibold`}>
                    {data?.expand["owner"]?.name}
                  </div>
                  <div className=" text-gray-400 text-sm mx-1 font-light">
                    {getUploadedTime(data?.created)}
                  </div>
                </div>

                {data?.pdlink && !data?.text?.includes("리뷰") ? (
                  <ProductLink link={data?.pdlink} thumb={data?.pdthumblink} />
                ) : null}
                {data?.pdlink && data?.text?.includes("리뷰") ? (
                  <ReviewLink link={data?.pdlink} thumb={data?.pdthumblink} />
                ) : null}

                {data.image.length > 0 ?
                    (<div>
                        <Image
                            src={`https://dearyouapi.moveto.kr/api/files/messages/${data.id}/${data.image}`}
                            width={300}
                            height={300}
                            alt={data.id}
                            className="mx-3 relative rounded-lg shadow-lg"
                        />
                        <ReadMark itemKey={key} offset={35}/>
                    </div>) : 
                    (<div className="flex">
                        <div className={data?.expand["owner"]?.id === userMe?.id 
                            ? "relative ml-auto" : "mr-auto"}>
                            <div className="mx-3 my-1 px-3 py-2 bg-white shadow-lg rounded-xl break-words max-w-[230px]">
                                {data?.text}
                                <ReadMark itemKey={key} offset={30}/>
                            </div>
                        </div>
                    </div>)
                }
              </div>
              <div ref={lastMsgRef} />
            </div>
          ))}
          <div ref={msgRef} className="p-1" />
        </div>

        {showDown ? (
          <ArrowDownIcon
            onClick={() => {
              lastMsgRef.current.scrollIntoView({ behavior: "smooth" });
            }}
            className="absolute p-2 w-10 h-10 bg-amber-200 self-center bottom-20 rounded-full stroke-white"
          />
        ) : null}

        <div className="flex p-2 px-4 items-center fixed top-0 right-0 left-0 bg-white">
          <Link href={"/chats"}>
            <ArrowLeftIcon className=" w-8 h-8 bg-amber-400 text-white p-2 rounded-full" />
          </Link>
          <h3 className="text-xl font-semibold ml-4">{userOther?.name}</h3>
        </div>
        <div className="w-full h-16"></div>
      </div>
    );
}