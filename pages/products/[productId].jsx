import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";

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
  useEffect(() => {
    async function getProductInfo() {
      const record = await pb.collection("products").getOne(productId, {
        expand: "seller",
      });
      setProductInfo(record);
    }

    getProductInfo();
  });
  return (
    <div>
      <div>Product Detail</div>
      <div>
        {productInfo ? (
          <div>
            <div>{productInfo.name}</div>
            <div>{productInfo.explain}</div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
