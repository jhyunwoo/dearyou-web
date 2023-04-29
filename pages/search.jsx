import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { usePbAuth } from "../contexts/AuthWrapper";
import pb from "@/lib/pocketbase";
import BottomBar from "@/components/BottomBar";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Search() {
  const { user, signOut } = usePbAuth();
  const [products, setProducts] = useState([]);
  const [searched, setSearched] = useState([]);
  const searchInput = useRef("");

  // PocketBase에서 products(상품 정보) 컬렉션 가져옴
  async function getProductsLists() {
    const resultList = await pb
      .collection("products")
      .getList(1, 50, { expand: "seller" });
    console.log(resultList.items);
    setProducts(resultList?.items);
  }

  async function handleSearch(event) {
    event.preventDefault();
    let searchWord = searchInput.current.value.toLowerCase(); // 검색어
    if (searchWord.length === 0) return;

    // 'searchWord'(검색어)가 포함된 상품만 data 리스트에 저장
    let data = [];
    for (let i = 0; i < products.length; i++) {
      if (
        (products[i]?.name).toLowerCase().indexOf(searchWord) >= 0 ||
        (products[i]?.explain).toLowerCase().indexOf(searchWord) >= 0 ||
        (products[i]?.expand?.seller?.name).toLowerCase().indexOf(searchWord) >=
          0
      ) {
        data.push(products[i]);
      }
    }

    // 화면에 표시할 정보만을 담은 'searched' state 설정
    setSearched(data);
  }

  // SearchBar -> 'searchQuery' state에 검색어 저장
  function SearchBar() {
    return (
      <div className="w-full h-16  flex justify-center items-center ">
        <form onSubmit={handleSearch} className="w-full flex m-4">
          <input
            ref={searchInput}
            type="text"
            placeholder="검색어를 입력하세요..."
            autoFocus
            className="p-2 rounded-lg w-full focus:outline-4 focus:outline-none ring-2 ring-amber-700 focus:ring-offset-2	transition duration-200"
          />
          <button type="submit" className="m-1 ">
            <MagnifyingGlassIcon className="w-8 h-8 hover:scale-105 transition duration-200" />
          </button>
        </form>
      </div>
    );
  }

  // 검색 결과 표시하는 Ordered List
  function ItemList(props) {
    if (props.data.length === 0) {
      // props로 전달받은 검색 결과 목록이 비었을 때
      return (
        <h3 className="text-md text-slate-600 font-bold text-center mt-12">
          <BottomBar />
          검색 결과가 없습니다.
        </h3>
      );
    } else {
      // 검색 결과 표시하는 Ordered List
      return (
        <div>
          <BottomBar />
          <div className="grid grid-cols-1 sm:grid-cols-2 p-4">
            {searched.map((data, key) => (
              <Link href={`/products/${data.id}`} key={key}>
                <div className="flex flex-row w-full border-b py-3 border-slate-300">
                  <Image
                    src={`https://dearu-pocket.moveto.kr/api/files/products/${data.id}/${data.photos[0]}?thumb=100x100`}
                    width={300}
                    height={300}
                    alt={data.name}
                    priority={true}
                    className="basis-1/4 w-24 h-24 rounded-lg mr-4"
                  />
                  <div>
                    <div className="font-bold text-lg">{data?.name}</div>
                    <div className="font-medium text-base flex flex-col">
                      <div className="font-semibold">
                        {data?.expand?.seller?.name}
                        <span className="text-blue-600">{(data?.expand?.seller?.id === user?.id) ? " (나)" : ""}</span>
                      </div>
                      <div>{data?.expand?.seller?.studentId}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="w-full h-16"></div>
        </div>
      );
    }
  }

  useEffect(() => {
    getProductsLists();
  }, []);

  return (
    <ProtectedPage>
      <SearchBar />
      <ItemList data={searched} />
    </ProtectedPage>
  );
}
