import { useState, useRef } from "react";
import pb from "../lib/pocketbase";

export default function Search() {
  const [itemData, setItemData] = useState([]);
  const searchInput = useRef("");

  async function handleSearch(event) {
    event.preventDefault();
    let searchWord = searchInput.current.value.toLowerCase(); // 검색어
    if(searchWord.length === 0) return;

    // PocketBase에서 products(상품 정보) 컬렉션 가져옴
    let temp = await pb.collection("products").getFullList({
      sort: "-created",
    });

    // 'searchWord'(검색어)가 포함된 상품만 data 리스트에 저장
    let data = [];
    for (let i = 0; i < temp.length; i++) {
      if (
        (temp[i].name).toLowerCase().indexOf(searchWord) >= 0 ||
        (temp[i].explain).toLowerCase().indexOf(searchWord) >= 0
      ) {
        data.push(temp[i]);
      }
    }

    // 화면에 표시할 정보만을 담은 'itemData' state 설정
    setItemData(data);
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
        <button type="submit">Search</button>
      </form>
    );
  }

  // 검색 결과 표시하는 Ordered List
  function ItemList(props) {
    if(props.data.length === 0){ // props로 전달받은 검색 결과 목록이 비었을 때
      return (
        <h3>검색 결과가 없습니다.</h3>
      )
    }
    else{ // 검색 결과 표시하는 Ordered List
      return (
        <div>
          <h3>검색 결과</h3>
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
        </div>
      );
    }
  }

  return (
    <div>
      <div>Search Page</div>
      <SearchBar />
      <ItemList data={itemData} />
    </div>
  );
}
