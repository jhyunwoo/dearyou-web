import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import pb from "@/lib/pocketbase";
import Image from "next/image";
import { useRouter } from "next/router";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { usePbAuth } from "../../../contexts/AuthWrapper";


export const getServerSideProps = async (context) => {
    const { query } = context;
    const { productId } = query;
  
    return {
      props: {
        productId,
      },
    };
};

export default function UpdateProduct( {productId} ) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { user, signOut } = usePbAuth();
  const [productInfo, setProductInfo] = useState("");  const useWindowSize = () => {
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
    console.log(newInfo);

    let result = await pb
        .collection("Products")
        .update(productId, newInfo);
    //console.log(result);

    setIsLoading(false);
    router.replace('/');
  }

  if(productInfo?.expand?.seller?.id === user?.id){
    return (
        <div>
        <div>Update information on Product {productId}</div>
        {productInfo ? (
        <div>
            <div className="bg-slate-50  p-4 flex flex-col">
            <div className="flex overflow-x-auto space-x-8 scrollbar-hide">
              {productInfo.photos.map((data, key) => (
                <div
                  className={`w-[${windows.width}px] h-[${windows.width}px] bg-slate-300 flex-shrink-0`}
                >
                  <Image
                    key={key}
                    src={`https://dearu-pocket.moveto.kr/api/files/products/${productId}/${data}`}
                    width={300}
                    height={300}
                    priority={true}
                    alt={"Product Image"}
                    className=""
                  />
                </div>
              ))}
            </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
            <div>제품명</div>
            <input {...register("name", { required: true})} defaultValue={productInfo?.name} readOnly={true} className="bg-gray-300"/>
            <div>설명</div>
            <input {...register("explain", { required: true })} defaultValue={productInfo?.explain}/>
            {errors.exampleRequired && <span>This field is required</span>}
            <div>종류</div>
            <input {...register("type", { required: true })} defaultValue={productInfo?.type}/>

            <button type="submit">제출</button>
            </form>
        </div>) : null}
        </div>
    );
  }
  else{
    return (<div>Unauthorized</div>)
  }
}