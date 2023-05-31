import { useState, useEffect } from "react";
import pb from "@/lib/pocketbase";
import { useRouter } from "next/router";
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

  async function onDeleteProduct() {
    if(window.confirm("물품을 정말 삭제할까요? (취소할 수 없습니다!)")){
      await pb.collection("products").delete(productId);
      alert("물품이 삭제되었습니다.");
      router.replace("/");
    }
  }

  if (productInfo?.expand?.seller?.id === user?.id) {
    return (
      <ProtectedPage>
        {isLoading ? <Loading /> : ""}
        <div className="text-xl font-bold mx-4 mb-4 pt-4">정보 수정</div>
        {productInfo ? (
          <div className="sm:flex sm:flex-row  sm:justify-center">
            <div className="sm:m-4">
              <ProductImageView
                productInfo={productInfo}
                productId={productId}
              />
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg sm:w-1/2">
              { !productInfo.soldDate ? 
              (<div>
                <ProductInfoForm productInfo={productInfo} onSubmit={onSubmit} />
                <button
                    className="w-full bg-red-400 hover:bg-red-500 transition duration-200  text-white p-2 px-6 rounded-full text-base font-semibold mt-4"
                    onClick={onDeleteProduct}
                  >
                    물품 삭제
                </button>
              </div>) :
              (<div className="p-4 text-center text-slate-500">
                거래가 완료된 물건이므로 수정하거나 삭제할 수 없습니다.
              </div>)
              }
            </div>
          </div>
        ) : null}
      </ProtectedPage>
    );
  } else {
    return (
      <div className="p-4 text-center text-slate-500">
        수정할 권한이 없습니다.
      </div>
    );
  }
}
