import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { usePbAuth } from "../contexts/AuthWrapper";
import pb from "@/lib/pocketbase";

export default function Search() {
  const { user, signOut } = usePbAuth();
  const [products, setProducts] = useState([]);
  const [searched, setSearched] = useState([]);
  const searchInput = useRef("");
  const router = useRouter();

  function checkUserAuth() {
    if (!user) {
      router.replace("/signin");
    }
  }

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
    if(searchWord.length === 0) return;

    // 'searchWord'(검색어)가 포함된 상품만 data 리스트에 저장
    let data = [];
    for (let i = 0; i < products.length; i++) {
      if (
        (products[i]?.name).toLowerCase().indexOf(searchWord) >= 0 ||
        (products[i]?.explain).toLowerCase().indexOf(searchWord) >= 0 ||
        (products[i]?.expand?.seller?.name).toLowerCase().indexOf(searchWord) >= 0
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
      <form onSubmit={handleSearch}>
        <input
          ref={searchInput}
          type="text"
          placeholder="검색어를 입력하세요..."
        />
        <button type="submit">검색</button>
      </form>
    );
  }

  // 검색 결과 표시하는 Ordered List
  function ItemList(props) {
    if(props.data.length === 0){ // props로 전달받은 검색 결과 목록이 비었을 때
      return (
        <h3 className="text-2xl font-bold">검색 결과가 없습니다.</h3>
      )
    }
    else{ // 검색 결과 표시하는 Ordered List
      return (
        <div>
          <h3 className="text-2xl font-bold">검색 결과</h3>
          <ul>
            {searched.map((data, key) => (
              <li key={key}>
                <hr/>
                <div>{data?.name}</div>
                <div>{data?.explain}</div>
                <div>등록인: {data?.expand?.seller?.name}</div>
                <Image
                  src={`https://dearu-pocket.moveto.kr/api/files/products/${data.id}/${data.photos[0]}`}
                  width={500}
                  height={500}
                ></Image>
              </li>
            ))}
          </ul>
        </div>
      );
    }
  }

  useEffect(() => checkUserAuth(), [user]);
  useEffect(() => {
    getProductsLists();
  }, []);

  return (
    <ProtectedPage>
      <h1>Search Page</h1>
      <SearchBar />
      <ItemList data={searched} />
    </ProtectedPage>
  );
}
