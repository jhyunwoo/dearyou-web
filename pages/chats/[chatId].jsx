import ProtectedPage from "@/components/ProtectedPage";
import { useRouter } from "next/router";
import { useEffect, useState, useRef, useCallback } from "react";
import pb from "@/lib/pocketbase";
import { useForm } from "react-hook-form"
import { ArrowUpIcon, PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function Chat() {
    const router = useRouter();
    const chatId = router.query["chatId"];
    const [chatInfo, setChatInfo] = useState()
    const [messages, setMessages] = useState([])
    const [files, setFiles] = useState()

    const {
        register,
        handleSubmit,
        setValue,
    } = useForm()

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
    /** 메세지 전송 후 스크롤 내리는 기준 */
    const messageEndRef = useRef(null)

    useEffect(() => {
        /** 채팅 정보 가져오기 */
        async function getChatInfo() {
            if (chatId) {
                const info = await pb.collection("chats").getOne(chatId, { expand: 'user1,user2' })
                setChatInfo(info)
            }
        }
        /** 실시간 채팅을 위한 realtime 설정 */
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
        /** 첫 로딩시 채팅 정보 불러오기 */
        async function getMessages() {
            const messageList = await pb.collection("messages").getFullList({
                filter: `chat.id="${chatId}"`,
                sort: "-created",
                expand: "sender"
            })
            setMessages(messageList.reverse())
        }
        getMessages()
        subscribeChat()
        getChatInfo()
    }, [chatId])

    /** 채팅 입력 후 스크롤 아래로 내리기 */
    useEffect(() => {

        messageEndRef?.current?.scrollIntoView({ behavior: 'smooth' });

    }, [messages]);

    async function onLoadImage(e) {
        const file = e.target.files
        console.log(file["0"])
        setFiles(file)
        const formData = new FormData();
        formData.append("image", file["0"])
        formData.append("chat", chatId)
        formData.append("sender", pb.authStore.model.id)
        formData.append("receiver", pb.authStore.model.id === chatInfo.user1 ? chatInfo.user1 : chatInfo.user2)
        try {
            const result = await pb
                .collection("messages")
                .create(formData);
            const updateChat = await pb.collection("chats").update(chatId, { messages: result.id })
            console.log(result)
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <ProtectedPage>
            <div className="bg-slate-50 min-h-screen">
                <div className="fixed top-0 right-0 left-0 p-2 bg-amber-200 flex"><div>Chat</div><button onClick={() => console.log(messages)}>messages</button></div>
                <div className="overflow-auto py-14 pt-20 flex flex-col">
                    {messages?.map((data, key) => <section key={key} className={`${pb.authStore.model.id === data?.sender ? "ml-auto items-end" : "mr-auto items-start"} mb-1 flex flex-col  mx-2`}><div className="text-xs">{pb.authStore.model.id === data?.sender ? pb.authStore.model.name : data?.expand?.sender?.name}</div><div className="bg-white p-1 px-2 rounded-md">{data?.message ? data.message : <Image alt="image" className="rounded-lg" src={`http://127.0.0.1:8090/api/files/messages/${data.id}/${data.image}`} width={300} height={300} />}</div></section>)}

                </div>
                <div ref={messageEndRef} ></div>
                <div className="w-full p-2 fixed bottom-0 right-0 left-0 bg-orange-50 ">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex">
                        <label
                            htmlFor="input-file"
                            onChange={onLoadImage}
                            className="bg-white ring-2 hover:ring-offset-1 hover:bg-sky-400 hover:text-white transition duration-200 ring-sky-400 rounded-xl text-slate-600  p-1 font-semibold flex justify-center items-center w-10 h-10 mx-1"
                        >
                            <PhotoIcon className="w-6 h-6" />
                            <input
                                type="file"
                                id="input-file"
                                className="hidden"
                                accept="image/jpg, image/png, image/jpeg, image/webp, image/heic, image/heic-sequence, image/heif-sequence image/heif"
                            />
                        </label>
                        <input className="basis-10/12 outline-none p-2 rounded-lg" {...register("text", { required: { value: true, message: "메세지를 입력해주세요." } })} />
                        <button className="mx-auto w-10 h-10 p-1 rounded-full flex justify-center items-center bg-amber-500 text-white" type="submit"><ArrowUpIcon className="w-4 h-4" /></button>
                    </form>
                </div>
            </div>
        </ProtectedPage>
    )
}