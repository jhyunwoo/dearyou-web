import { useState, useRef } from "react"
import Link from "next/link"
import pb from "@/lib/pocketbase"
import {
  ArrowLeftCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import BottomBar from "@/components/BottomBar"
import Layout from "@/components/Layout"
import ProtectAdmin from "@/components/ProtectAdmin"
import SEO from "@/components/SEO"

export default function ChatLogPage() {
  const [searched, setSearched] = useState([])
  const [searchWord, setSearchWord] = useState("")
  const searchInput = useRef("")

  async function doSearch(word) {
    if (word.length === 0) return

    const searchResult = await pb.collection("chats").getFullList({
      filter: `user1.name~"${word}"||user2.name~"${word}"`,
      expand: "user1,user2",
    })

    // 화면에 표시할 정보만을 담은 'searched' state 설정
    setSearched(searchResult)
  }

  async function handleSearch(event) {
    event.preventDefault()
    let word = searchInput?.current?.value // 검색어
    if (word.length === 0) return

    setSearchWord(word)
    await doSearch(word)
  }

  // SearchBar -> 'searchQuery' state에 검색어 저장
  function SearchBar() {
    return (
      <div>
        <div className="w-full h-16  flex justify-center items-center ">
          <form onSubmit={handleSearch} className="w-full flex">
            <input
              ref={searchInput}
              type="text"
              placeholder="채팅에 참여한 사용자 이름으로 채팅 검색"
              autoFocus
              className="p-2 rounded-lg dark:bg-slate-800 dark:text-white w-full focus:outline-4 focus:outline-none ring-2 ring-orange-500 focus:ring-offset-2 dark:ring-offset-black	transition duration-200"
            />
            <button
              type="submit"
              className="text-orange-500 p-1 rounded-full m-1"
            >
              <MagnifyingGlassIcon className="w-8 h-8 hover:scale-105 transition duration-200" />
            </button>
          </form>
        </div>
        <div className="flex pb-2 items-center">
          <button
            onClick={() => {
              doSearch(searchWord)
            }}
          ></button>
        </div>
      </div>
    )
  }

  // 검색 결과 표시하는 Ordered List
  function ItemList(props) {
    if (props.data.length === 0) {
      // props로 전달받은 검색 결과 목록이 비었을 때
      return (
        <h3 className="text-md text-slate-600 font-bold text-center mt-12">
          검색 결과가 없습니다.
        </h3>
      )
    } else {
      // 검색 결과 표시하는 Ordered List
      return (
        <div>
          {searched.map((data, key) => (
            <Link href={`/devpage/chats-log/${data.id}`} key={key}>
              <div
                className={`flex rounded-lg p-2 border-2 my-1  w-full ${
                  data?.soldDate
                    ? "bg-slate-100 dark:bg-slate-900"
                    : "bg-white dark:bg-gray-900"
                }`}
              >
                <div className="flex justify-between flex-col">
                  <div className="font-bold text-lg dark:text-white">
                    {data?.name}
                  </div>
                  <div className="font-medium text-base flex flex-col">
                    <div className="flex">
                      <div className="font-semibold dark:text-white">
                        {data?.expand?.user1?.name}
                        <span className="text-sm text-slate-400 ">
                          ({data?.expand?.user1?.studentId})
                        </span>
                      </div>
                      <div className="mx-1 dark:text-white">-</div>
                      <div className="font-semibold dark:text-white">
                        {data?.expand?.user2?.name}
                        <span className="text-sm text-slate-400">
                          ({data?.expand?.user2?.studentId})
                        </span>
                      </div>
                    </div>
                    <div className="text-orange-500">
                      {data?.soldDate ? "나눔 완료" : ""}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          <div className="h-8 w-full sm:col-span-2 lg:col-span-3 xl:col-span-4" />
        </div>
      )
    }
  }

  return (
    <ProtectAdmin>
      <SEO title={"채팅 로그 조회"} />
      <div className="w-full bg-slate-50 dark:bg-black p-3  flex items-center justify-start fixed top-0 right-0 left-0">
        <Link href={"/devpage"}>
          <ArrowLeftCircleIcon className="w-8 h-8 dark:text-white" />
        </Link>
        <div className="font-bold text-xl ml-2 dark:text-white">
          채팅 로그 조회
        </div>
      </div>
      <Layout>
        <div className="p-2">
          <div className="font-semibold text-red-500">
            이 기능은 개발자 권한을 가진 사용자만 접근이 가능함.
          </div>
          <div className="font-semibold text-red-500">
            테스트 용도 혹은 불가피한 경우를 제외하고는 사용하지 말 것
          </div>
        </div>
        <SearchBar />
        <ItemList data={searched} />
      </Layout>
      <BottomBar />
    </ProtectAdmin>
  )
}
