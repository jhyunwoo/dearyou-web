import { useState } from "react";
import pb from "../lib/pocketbase";

export default function Search() {
  const [itemData, setItemData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  async function handleSearch(event) {
    event.preventDefault();

    // PocketBase에서 products(상품 정보) 컬렉션 가져옴
    let temp = await pb.collection("products").getFullList({
      sort: "-created",
    });

    // 'searchQuery' state를 이용해 검색어 일치하는 상품만 data 리스트에 저장
    let data = [];
    for (let i = 0; i < temp.length; i++) {
      if (
        temp[i].name.indexOf(searchQuery) >= 0 ||
        temp[i].explain.indexOf(searchQuery) >= 0
      ) {
        data.push(temp[i]);
      }
    }

    // 화면에 표시할 정보만을 담은 'itemData' state 설정
    setItemData(data);
  }

  // *********************************************************
  // * 이슈 -> 검색어 편집 시 포커스? 가 다른데로 넘어감 (3.29) *
  // *********************************************************
  // SearchBar -> 'searchQuery' state에 검색어 저장
  function SearchBar() {
    return (
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)} // onChange를 사용하면 입력 값이 바뀔 때 마다 함수가 실행돼서 입력이 한 글짜식 되는 것 같음
        />
        <button type="submit">Search</button>
      </form>
    );
  }

  // 검색 결과 표시하는 Ordered List
  function ItemList(props) {
    return (
      <ol>
        {props.data.map((item) => (
          <li key={item.id}>
            <hr />
            <div>{item.name}</div>
            <div>{item.explain}</div>
            <div>{item.created}</div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div>
      <div>Search Page</div>
      <SearchBar />
      <ItemList data={itemData} />
    </div>
  );
}
