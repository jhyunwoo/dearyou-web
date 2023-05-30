import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import pb from "@/lib/pocketbase";
import Image from "next/image";
import { useRouter } from "next/router";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { usePbAuth } from "../../../contexts/AuthWrapper";
import ProtectedPage from "@/components/ProtectedPage";
import ProductImageView from "@/components/ProductImageView";
import ProductInfoForm from "@/components/ProductInfoForm";
import Loading from "@/components/Loading";

export const getServerSideProps = async (context) => {
  const { query } = context;
  const { productId } = query;

  return {
    props: {
      productId,
    },
  };
};

export default function UpdateProduct({ productId }) {
  const { user, signOut } = usePbAuth();
  const [productInfo, setProductInfo] = useState("");
  const useWindowSize = () => {
    const isClient = typeof window === "object";

    const getSize = () => {
      return { width: isClient ? window.innerWidth : undefined };
    };
    const [windowSize, setWindowSize] = useState(getSize);
    useEffect(() => {
      if (!isClient) {
        return false;
      }
      const handleResize = () => {
        setWindowSize(getSize());
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    return windowSize;
  };
  const windows = useWindowSize();

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function getProductInfo() {
      const record = await pb.collection("products").getOne(productId, {
        expand: "seller",
      });
      setProductInfo(record);
    }

    getProductInfo();
  }, []);

  async function onSubmit(data) {
    setIsLoading(true);
    let newInfo = productInfo;
    newInfo.name = data.name;
    newInfo.explain = data.explain;
    newInfo.type = data.type;
    newInfo.lastupdated = new Date().getTime();

    let result = await pb.collection("products").update(productId, newInfo);
    setIsLoading(false);
    router.replace("/");
  }

  if (productInfo?.expand?.seller?.id === user?.id) {
    return (
      <ProtectedPage>
        {isLoading ? <Loading /> : ""}
          <div className="text-xl font-bold mx-4 mb-4 pt-4">정보 수정</div>
          {productInfo ? (
            <div className="sm:flex sm:flex-row  sm:justify-center">
              <div className="sm:m-4">
                <ProductImageView productInfo={productInfo} productId={productId} />
              </div>
              <ProductInfoForm productInfo={productInfo} onSubmit={onSubmit} />
            </div>
          ) : null}
      </ProtectedPage>
    );
  } else {
    return <div>Unauthorized</div>;
  }
}
