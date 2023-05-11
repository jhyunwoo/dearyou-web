import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import pb from "@/lib/pocketbase";
import Image from "next/image";
import { useRouter } from "next/router";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { usePbAuth } from "../../../contexts/AuthWrapper";
import ProtectedPage from "@/components/ProtectedPage";

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
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

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
    newInfo.explain = data.explain;
    newInfo.type = data.type;
    newInfo.lastupdated = new Date().getTime();

    let result = await pb.collection("Products").update(productId, newInfo);
    setIsLoading(false);
    router.replace("/");
  }

  if (productInfo?.expand?.seller?.id === user?.id) {
    return (
      <ProtectedPage>
        <div className="w-full min-h-screen bg-slate-50">
          <div className="text-xl font-bold mx-4 mb-4 pt-4">정보 수정</div>
          {productInfo ? (
            <div>
              <div className="flex flex-col">
                <div className="flex overflow-x-auto space-x-8 scrollbar-hide snap-x">
                  {productInfo.photos.map((data, key) => (
                    <div
                      className={`w-[${windows.width}px] h-[${windows.width}px] snap-center my-auto flex-shrink-0`}
                    >
                      <Image
                        key={key}
                        src={`https://dearu-pocket.moveto.kr/api/files/products/${productId}/${data}`}
                        width={300}
                        height={300}
                        priority={true}
                        alt={"Product Image"}
                        className="w-screen"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-4 flex flex-col"
              >
                <div className="text-lg font-semibold">제품명</div>
                <input
                  {...register("name", { required: true })}
                  defaultValue={productInfo?.name}
                  readOnly={true}
                  className="p-2 rounded-lg outline-none bg-white ring-2 ring-amber-300 my-2"
                  maxLength={50}
                />
                <div className="text-lg font-semibold">
                  설명{" "}
                  <span className="text-gray-400 text-sm">(최대 300자)</span>
                </div>
                <textarea
                  {...register("explain", { required: true })}
                  defaultValue={productInfo?.explain}
                  className="p-2 rounded-lg outline-none bg-white ring-2 ring-amber-300 my-2"
                  maxLength={300}
                />
                {errors.exampleRequired && <span>This field is required</span>}
                <div className="text-lg font-semibold">종류</div>
                <input
                  {...register("type", { required: true })}
                  defaultValue={productInfo?.type}
                  className="p-2 rounded-lg outline-none bg-white ring-2 ring-amber-300 my-2"
                  maxLength={50}
                />

                <button
                  className="bg-amber-400 font-bold mt-4 p-2 px-6 rounded-full text-white"
                  type="submit"
                >
                  확인
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </ProtectedPage>
    );
  } else {
    return <div>Unauthorized</div>;
  }
}
