import BottomBar from "@/components/BottomBar";
import HeadBar from "@/components/HeadBar";
import Layout from "@/components/Layout";
import ProtectedPage from "@/components/ProtectedPage";
import pb from "@/lib/pocketbase";
import { useEffect, useState } from "react";
import { usePbAuth } from "@/contexts/AuthWrapper";
import Link from "next/link";

export default function ChatList() {
    const { user } = usePbAuth();
    const [chats, setChats] = useState([])
    useEffect(() => {
        async function getChatList() {
            const list = await pb.collection('chats').getFullList({ expand: "user1,user2" })
            console.log(list)
            setChats(list)
        }
        getChatList()
    }, [])
    return (
        <Layout>
            <BottomBar />
            <HeadBar title={"채팅"} />
            <ProtectedPage>
                <div >
                    {chats.map((data, key) => <section key={key} className="grid grid-cols-1 gap-2">
                        <Link href={`/chats/${data.id}`} className="bg-white p-4 rounded-lg">{user.id !== data.expand.user1.id ? data.expand.user1.name : data.expand.user2.name}</Link>
                    </section>)}
                </div>
            </ProtectedPage>
        </Layout>
    )
}