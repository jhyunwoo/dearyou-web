import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import Image from "next/image";
import { useState, useRef } from "react";
import pb from "@/lib/pocketbase";
import BottomBar from "@/components/BottomBar";

import { EyeSlashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";
import HeadBar from "@/components/HeadBar";
import ProductGrid from "@/components/ProductGrid";

export default function Search() {
  const [searched, setSearched] = useState([]);
  const [searchWord, setSearchWord] = useState("");
  const [openOnly, setOpenOnly] = useState(true);
  const searchInput = useRef("");

  async function doSearch(word, isOpenOnly) {
    if (word.length === 0) return;

    const searchResult = await pb.collection("products").getFullList({
      filter: `(name~"${word}"||explain~"${word}"||seller.name~"${word}")&&isConfirmed=True 
      ${isOpenOnly ? `&&soldDate=null` : ""}`,
      expand: "seller",
    });

    // 화면에 표시할 정보만을 담은 'searched' state 설정
    setSearched(searchResult);
  }

  async function handleSearch(event) {
    event.preventDefault();
    let word = searchInput?.current?.value; // 검색어
    if (word.length === 0) return;

    setSearchWord(word);
    await doSearch(word, openOnly);
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
              autoFocus
              className="p-2 rounded-lg w-full focus:outline-4 focus:outline-none ring-2 ring-orange-500 focus:ring-offset-2	transition duration-200"
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
          <div className="ml-auto text-slate-500">나눔 완료된 물건 숨기기</div>
          <button
            onClick={() => {
              doSearch(searchWord, !openOnly);
              setOpenOnly(!openOnly);
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
    );
  }

  // 검색 결과 표시하는 Ordered List
  function ItemList(props) {
    if (props.data.length === 0) {
      // props로 전달받은 검색 결과 목록이 비었을 때
      return (
        <h3 className="text-md text-slate-600 font-bold text-center mt-12">
          검색 결과가 없습니다.
        </h3>
      );
    } else {
      // 검색 결과 표시하는 Ordered List
      return (
        <div>
          <ProductGrid>
            {searched.map((data, key) => (
              <Link href={`/products/${data.id}`} key={key}>
                <div
                  className={`flex rounded-lg p-2  w-full ${
                    data?.soldDate ? "bg-slate-100" : "bg-white"
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
                    <div className="font-bold text-lg">{data?.name}</div>
                    <div className="font-medium text-base flex flex-col">
                      <div className="font-semibold">
                        {data?.expand?.seller?.name}
                      </div>
                      <div>{data?.expand?.seller?.studentId}</div>
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
      );
    }
  }

  return (
    <ProtectedPage>
      <Layout>
        <HeadBar title={"검색"} />
        <SearchBar />
        <ItemList data={searched} />
        <BottomBar />
      </Layout>
    </ProtectedPage>
  );
}
