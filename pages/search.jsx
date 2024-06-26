import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import pb from "@/lib/pocketbase"
import BottomBar from "@/components/BottomBar"
import va from "@vercel/analytics"
import { EyeSlashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import Layout from "@/components/Layout"
import HeadBar from "@/components/HeadBar"
import ProductGrid from "@/components/ProductGrid"
import SEO from "@/components/SEO"
import errorTransmission from "@/lib/errorTransmission"

// 등록 가능한 물품 종류
const typeOptions = [
  "모든 종류",
  "교과서",
  "문제집 / 인강 교재",
  "교양서",
  "기타",
]

export default function Search() {
  const [searched, setSearched] = useState([])
  const [searchWord, setSearchWord] = useState("")
  const [searchType, setSearchType] = useState(typeOptions[0])
  const [openOnly, setOpenOnly] = useState(true)
  const searchInput = useRef("")

  async function doSearch(word, isOpenOnly, type) {
    try {
      if (word.length === 0) return

      let searchFilter = `(name~"${word}"||explain~"${word}"||seller.name~"${word}") && isConfirmed=True`
      if (isOpenOnly) {
        searchFilter += " && soldDate=null"
      }
      if (type != typeOptions[0]) {
        searchFilter += ` && type="${type}"`
      }

      console.log(searchFilter)
      const searchResult = await pb.collection("products").getFullList({
        filter: searchFilter,
        expand: "seller",
      })

      // 화면에 표시할 정보만을 담은 'searched' state 설정
      setSearched(searchResult)
    } catch (e) {
      errorTransmission(e)
    }
  }

  async function handleSearch(event) {
    try {
      va.track("Search")
      event.preventDefault()
      let word = searchInput?.current?.value // 검색어
      if (word.length === 0) return
      setSearchWord(word)
      await doSearch(word, openOnly, searchType)
    } catch (e) {
      errorTransmission(e)
    }
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
              placeholder="검색어를 입력하세요..."
              defaultValue={searchWord}
              autoFocus
              className="p-2 rounded-lg w-full focus:outline-4 focus:outline-none ring-2 ring-orange-500 focus:ring-offset-2 dark:bg-gray-800 dark:ring-offset-gray-800	transition duration-200 dark:text-white"
            />
            <button
              type="submit"
              className="text-orange-500 p-1 rounded-full m-1"
            >
              <MagnifyingGlassIcon className="w-8 h-8 hover:scale-105 transition duration-200" />
            </button>
          </form>
        </div>
        <div className="flex items-center">
          <select
            className="p-2 rounded-lg outline-none ring-2 ring-amber-400 hover:ring-offset-2 transition duration-200 my-2 dark:bg-gray-800 dark:ring-offset-gray-800 dark:text-white"
            value={searchType}
            onChange={(e) => {
              setSearchType(e.target?.value)
              doSearch(searchWord, openOnly, e.target?.value)
            }}
          >
            {typeOptions.map((item, key) => (
              <option key={key} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="flex ml-auto pl-2 items-center">
            <div className="ml-auto text-slate-500">
              &apos;나눔 완료&apos; 숨기기
            </div>
            <button
              onClick={() => {
                setOpenOnly(!openOnly)
                doSearch(searchWord, !openOnly, searchType)
              }}
            >
              <EyeSlashIcon
                className={`w-8 h-8 mx-2 ${
                  openOnly ? "stroke-orange-400" : "stroke-slate-400"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 검색 결과 표시하는 Ordered List
  function ItemList(props) {
    if (props.data.length === 0) {
      // props로 전달받은 검색 결과 목록이 비었을 때
      return (
        <div className="text-md text-slate-600 font-bold text-center mt-12">
          검색 결과가 없습니다.
        </div>
      )
    } else {
      // 검색 결과 표시하는 Ordered List
      return (
        <div>
          <ProductGrid>
            {searched.map((data, key) => (
              <Link href={`/products/${data.id}`} key={key}>
                <div
                  className={`flex rounded-lg p-2  w-full ${
                    data?.soldDate
                      ? "bg-slate-100 dark:bg-slate-900"
                      : "bg-white dark:bg-gray-900"
                  }`}
                >
                  <Image
                    src={`https://dearyouapi.moveto.kr/api/files/products/${data.id}/${data.photos[0]}?thumb=100x100`}
                    width={300}
                    height={300}
                    alt={data.name}
                    priority={true}
                    className=" w-28 h-28  mr-4 rounded-lg"
                  />
                  <div className="flex justify-between flex-col">
                    <div className="font-bold text-lg dark:text-white">
                      {data?.name}
                    </div>
                    <div className="font-medium text-base flex flex-col">
                      <div className="font-semibold dark:text-white">
                        {data?.expand?.seller?.name}
                      </div>
                      <div className="dark:text-white">
                        {data?.expand?.seller?.studentId}
                      </div>
                      <div className="text-orange-500">
                        {data?.soldDate ? "나눔 완료" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </ProductGrid>
          <div className="h-8 w-full sm:col-span-2 lg:col-span-3 xl:col-span-4" />
        </div>
      )
    }
  }

  return (
    <Layout>
      <SEO title={"Search"} />
      <SearchBar />
      <ItemList data={searched} />
      <HeadBar title={"검색"} />
      <BottomBar />
    </Layout>
  )
}
