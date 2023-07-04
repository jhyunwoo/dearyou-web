import ProtectedPage from "@/components/ProtectedPage";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import pb from "@/lib/pocketbase";
import { useForm } from "react-hook-form"
import { ArrowUpIcon } from "@heroicons/react/24/outline";

export default function Chat() {
    const router = useRouter();
    const chatId = router.query["chatId"];
    const [chatInfo, setChatInfo] = useState()
    const [messages, setMessages] = useState([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false); //로딩 성공, 실패를 담을 state

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm()
    const messageEndRef = useRef(null);
    /** 채팅 입력시 message 생성 후 chat 업데이트 */
    const onSubmit = async (data) => {
        const message = {
            "chat": chatId,
            "sender": pb.authStore.model.id,
            "receiver": pb.authStore.model.id === chatInfo.user1 ? chatInfo.user2 : chatInfo.user1,
            "message": data.text,
            "isRead": false
        };
        const record = await pb.collection('messages').create(message);

        const update = {
            "messages": record.id
        };

        const updateChat = await pb.collection('chats').update(chatId, update);
        setValue("text", "")
    }

    const loadMore = () => {
        setPage(prev => prev + 1);
    }
    const pageEnd = useRef();

    useEffect(() => {
        async function getChatInfo() {
            if (chatId) {
                const info = await pb.collection("chats").getOne(chatId, { expand: 'user1,user2' })
                setChatInfo(info)
            }
        }
        async function subscribeChat() {
            if (chatId) {
                console.log("subscribed")
                pb.collection('chats').subscribe(chatId, async function (e) {
                    const newMessage = await pb.collection("messages").getOne(e?.record?.messages)
                    console.log(newMessage)
                    setMessages(prev => [...prev, newMessage])
                });
            }
        }
        async function getMessages() {
            const messageList = await pb.collection("messages").getList(1, 20, {
                filter: `chat.id="${chatId}"`,
                sort: "-created",
                expand: "sender"
            })
            setMessages(messageList.items.reverse())
            setLoading(true);
        }
        getMessages()
        subscribeChat()
        getChatInfo()
    }, [chatId])

    useEffect(() => {
        messageEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (loading) {
            //로딩되었을 때만 실행
            const observer = new IntersectionObserver(
                entries => {
                    if (entries[0].isIntersecting) {
                        loadMore();
                    }
                },
                { threshold: 1 }
            );
            //옵져버 탐색 시작
            observer.observe(pageEnd.current);
        }
    }, [loading]);


    return (
        <ProtectedPage>
            <div className="bg-slate-50 min-h-screen">
                <div className="fixed top-0 right-0 left-0 p-2 bg-amber-200"><div>Chat</div><button onClick={() => console.log(messages)}>messages</button></div>
                <div className="overflow-auto py-14 flex flex-col">
                    <div ref={pageEnd}></div>
                    {messages?.map((data, key) => <section key={key} className={`${pb.authStore.model.id === data?.sender ? "ml-auto items-end" : "mr-auto items-start"} mb-1 flex flex-col  mx-2`}><div className="text-xs">{pb.authStore.model.id === data?.sender ? pb.authStore.model.name : data?.expand?.sender?.name}</div><div className="bg-white p-1 px-2 rounded-md">{data?.message}</div></section>)}
                    <div ref={messageEndRef}></div>
                </div>
                <div className="w-full p-2 fixed bottom-0 right-0 left-0 bg-orange-50 ">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex">
                        <input className="basis-10/12 outline-none p-2 rounded-lg" {...register("text", { required: { value: true, message: "메세지를 입력해주세요." } })} />
                        <button className="mx-auto w-10 h-10 p-1 rounded-full flex justify-center items-center bg-amber-500 text-white" type="submit"><ArrowUpIcon className="w-4 h-4" /></button>
                    </form>
                </div>
            </div>
        </ProtectedPage>
    )
}