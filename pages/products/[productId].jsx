import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import Image from "next/image";

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
      console.log("초", Math.floor(gap / 1000));
    } else if (gap < 1000 * 60 * 10) {
      console.log("분(1분)", Math.floor(gap / (1000 * 60)));
    } else if (gap < 1000 * 60 * 60) {
      console.log("분(10분)", Math.floor(gap / (1000 * 60 * 10)));
    } else if (gap < 1000 * 60 * 60 * 24) {
      console.log("시간", Math.floor(gap / (1000 * 60 * 60)));
    } else if (gap < 1000 * 60 * 60 * 24 * 7) {
      console.log("일", Math.floor(gap / (1000 * 60 * 60 * 24)));
    } else if (gap < 1000 * 60 * 60 * 24 * 30) {
      console.log("주", Math.floor(gap / (1000 * 60 * 60 * 24 * 7)));
    }
  }

  useEffect(() => {
    async function getProductInfo() {
      const record = await pb.collection("products").getOne(productId, {
        expand: "seller",
      });
      setProductInfo(record);
      console.log(record);
    }

    getProductInfo();
  }, []);

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
              {productInfo.expand.seller.name} |{" "}
              {productInfo.expand.seller.studentId}
            </div>
            <div>종류: {productInfo.type}</div>
            <div onClick={() => getUploadedTime(productInfo.updated)}>
              check
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
