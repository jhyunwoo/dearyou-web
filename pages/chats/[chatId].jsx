import ProtectedPage from "@/components/ProtectedPage";
import { useRouter } from "next/router";
import { useEffect } from "react";
import pb from "@/lib/pocketbase";

export default function Chat() {
    const router = useRouter();

    // profile 보일 user
    const chatId = router.query["chatId"];

    useEffect(() => {
        async function subscribeChat() {
            if (chatId) {
                console.log("subscribed")
                pb.collection('chats').subscribe(chatId, function (e) {
                    console.log(e);
                });
            }
        }
        subscribeChat()
    }, [chatId])

    return (
        <ProtectedPage>
            <div>Chat</div>
        </ProtectedPage>
    )
}