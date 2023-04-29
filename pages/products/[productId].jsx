import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import Image from "next/image";
import { usePbAuth } from "@/contexts/AuthWrapper";

export const getServerSideProps = async (context) => {
  const { query } = context;
  const { productId } = query;

  return {
    props: {
      productId,
    },
  };
};

export default function ProductDetail({ productId }) {
  const [productInfo, setProductInfo] = useState("");

  function getUploadedTime(time) {
    let uploadedTime = Date.parse(time);
    let currentTime = new Date().getTime();
    let gap = currentTime - uploadedTime;
    if (gap < 1000 * 60) {
      return `${Math.floor(gap / 1000)}초 전`;
    } else if (gap < 1000 * 60 * 10) {
      return `${Math.floor(gap / (1000 * 60))}분 전`;
    } else if (gap < 1000 * 60 * 60) {
      return `${Math.floor(gap / (1000 * 60 * 10))}0분 전`;
    } else if (gap < 1000 * 60 * 60 * 24) {
      return `${Math.floor(gap / (1000 * 60 * 60))}시간 전`;
    } else if (gap < 1000 * 60 * 60 * 24 * 7) {
      return `${Math.floor(gap / (1000 * 60 * 60 * 24))}일 전`;
    } else if (gap < 1000 * 60 * 60 * 24 * 30) {
      return `${Math.floor(gap / (1000 * 60 * 60 * 24 * 7))}주 전`;
    } else if (gap < 1000 * 60 * 60 * 24 * 365) {
      return `${Math.floor(gap / (1000 * 60 * 60 * 24 * 30))}달 전`;
    } else {
      return `${Math.floor(gap < 1000 * 60 * 60 * 24 * 365)}년 전`;
    }
  }

  useEffect(() => {
    async function getProductInfo() {
      const record = await pb.collection("products").getOne(productId, {
        expand: "seller",
      });
      setProductInfo(record);
    }

    getProductInfo();
  }, []);


  //현재 사용자의 wishes에 product를 추가하는 버튼의 함수
  const currentUser = usePbAuth().user;
  async function addToWishlist() {
    try {
      const originWishes = await pb.collection("users").getOne(currentUser.id, {
        expand: "wishes",
      })
      const updatedUser = await pb.collection('users').update(currentUser.id, {
        "wishes": [...originWishes.wishes, productId],
      });
      console.log(updatedUser);
      alert('Product has been added to your wishlist!');
    } catch (error) {
      console.error('Error adding product to wishlist:', error);
      alert('Error adding product to your wishlist. Please try again later.');
    }
  }
  return (
    <div>
      <div>
        {productInfo ? (
          <div>
            <div>
              {productInfo.photos.map((data, key) => (
                <Image
                  key={key}
                  src={`https://dearu-pocket.moveto.kr/api/files/products/${productId}/${data}`}
                  width={500}
                  height={500}
                  priority={true}
                  alt={"Product Image"}
                />
              ))}
            </div>
            <div>{productInfo.name}</div>
            <div>{productInfo.explain}</div>
            <div>
              {productInfo.expand.seller.name}|
              {productInfo.expand.seller.studentId}
            </div>
            <div>종류: {productInfo.type}</div>
            <div>{getUploadedTime(productInfo.updated)}</div>
            <div>{productInfo.soldDate ? "판매됨" : "판매중"}</div>
          </div>
        ) : (
          ""
        )}
        <button onClick={addToWishlist}>
          위시리스트에 넣기
        </button>
      </div>
    </div>
  );
}
