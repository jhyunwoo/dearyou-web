import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import pb from "@/lib/pocketbase";
import Link from "next/link";
import { CheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import getUploadedTime from "@/lib/getUploadedTime";
import { usePbAuth } from "@/contexts/AuthWrapper";
import ProtectedPage from "@/components/ProtectedPage";
import BottomBar from "@/components/BottomBar";
import Layout from "@/components/Layout";
import ProductImageView from "@/components/ProductImageView";
import HeadBar from "@/components/HeadBar";

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
  const [checked, setChecked] = useState(false);

  const router = useRouter();
  const currentUser = usePbAuth().user;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    async function getProductInfo() {
      const record = await pb.collection("products").getOne(productId, {
        expand: "seller, confirmedBy",
      });
      if (!record.isConfirmed) {
        setProductInfo(record);
      } else {
        setProductInfo(false);
      }
    }

    getProductInfo();
  }, []);

  // 승인 버튼
  async function handleConfirm() {
    let newInfo = productInfo;
    newInfo.isConfirmed = true;
    newInfo.confirmedBy = currentUser.id;
    newInfo.rejectedReason = null;

    await pb.collection("products").update(productInfo.id, newInfo);
    alert(`승인되었습니다.`);

    router.push("/autonomy");
  }

  const rejectOptions = [
    "* 반려 사유를 선택하세요 *",
    "제목 또는 설명이 불충분해요.",
    "올라온 사진만으로 물건의 상태를 확인하기 어려워요.",
    "물건의 종류가 잘못 설정되었어요.",
    "학교에서 거래되기에 부적절한 물건이에요.",
  ];
  //거절 버튼
  async function handleReject(data) {
    if (data.type === "* 반려 사유를 선택하세요 *") {
      alert("반려 사유를 아래 목록에서 선택해 주세요!");
      return;
    }
    let newInfo = productInfo;
    newInfo.rejectedReason = data.type;
    newInfo.confirmedBy = currentUser.id;

    await pb.collection("products").update(productInfo.id, newInfo);
    alert(`반려 처리되었습니다. 사유: "${data.type}"`);

    router.push("/autonomy");
  }

  return (
    <ProtectedPage>
      {productInfo ? (
        <div className="w-full min-h-screen bg-slate-50 sm:flex sm:flex-col sm:justify-center sm:items-center sm:pt-6 sm:pb-24">
          {productInfo ? (
            <div className="sm:bg-white sm:p-4 md:p-8 sm:rounded-xl sm:shadow-xl">
              <div className="relative sm:flex ">
                <ProductImageView
                  productInfo={productInfo}
                  productId={productId}
                />
                <div className="sm:flex sm:flex-col sm:w-52 md:w-80 lg:w-96">
                  <div className="p-4 sm:p-2 flex flex-col ">
                    <div className=" pb-2 border-b-2 flex flex-col ">
                      <div className="flex justify-between">
                        <div className="text-xl font-bold">
                          {productInfo.name}
                        </div>
                        <div className="flex">
                          <div className="flex flex-col items-end mr-2">
                            <div className="text-sm">
                              {productInfo.expand.seller.name}
                            </div>
                            <div className="text-sm">
                              {productInfo.expand.seller.studentId}
                            </div>

                            {currentUser?.id ===
                            productInfo?.expand?.seller?.id ? (
                              <Link href={`/products/update/${productId}`}>
                                <PencilSquareIcon className="w-8 h-8 bg-amber-500 hover:bg-amber-600 transition duration-200 p-1 rounded-md text-white" />
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-col">
                        <div className="ml-auto">
                          {getUploadedTime(productInfo.created)}에 등록
                        </div>

                        <div className="ml-auto font-bold text-slate-500">
                          {productInfo.rejectedReason
                            ? `반려됨 (검토인: ${productInfo.expand.confirmedBy?.name})`
                            : "승인 대기 중"}
                        </div>

                        <div className="font-medium text-lg my-2">
                          {productInfo.explain}
                        </div>
                        <div>종류: {productInfo.type}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="px-4 sm:p-2 flex flex-col text-center">
                  {productInfo.rejectedReason ? (
                    <div className="font-bold text-red-500">
                      앞선 검토에서 "{productInfo.rejectedReason}" 사유로 등록이
                      거절된 물건입니다.
                    </div>
                  ) : null}
                  <div className="pb-2 font-bold ">
                    물건을 {productInfo.rejectedReason ? "재" : null}검토하려면
                    아래 상자에 체크하세요.
                  </div>
                  <div className="pb-4 flex items-center mx-auto">
                    <input
                      className="w-0 h-0"
                      type="checkbox"
                      id="check"
                      onChange={({ target: { checked } }) => {
                        setChecked(checked);
                      }}
                    />
                    <label for="check" className="w-8 h-8">
                      <CheckIcon
                        className={
                          checked
                            ? "bg-amber-500 stroke-white border-2 border-transparent rounded-xl"
                            : "bg-white stroke-slate-100 border-2 border-slate-300 rounded-xl"
                        }
                      />
                    </label>
                    <div className="ml-2">
                      등록된 물건 정보를 잘 확인했습니다.
                    </div>
                  </div>
                </div>
              </div>

              {checked ? (
                <div className="fixed top-0 right-0 left-0 bottom-0 flex justify-center items-center bg-slate-50/50">
                  <div className="m-2 p-6 rounded-lg border-2 w-4/5 bg-white">
                    <div className="text-lg font-bold text-center">
                      물건 검토
                    </div>
                    <button
                      className="w-full bg-lime-400 hover:bg-lime-500 transition duration-200  text-white p-2 px-12 rounded-full text-base font-semibold mt-4"
                      onClick={handleConfirm}
                    >
                      승인
                    </button>
                    <form
                      onSubmit={handleSubmit(handleReject)}
                      className="flex flex-col"
                    >
                      <button
                        className="bg-red-400 hover:bg-red-500 transition duration-200  text-white p-2 px-12 rounded-full text-base font-semibold mt-4"
                        type="submit"
                      >
                        반려
                      </button>
                      <div className="text-lg font-semibold mt-4">
                        반려 사유
                      </div>
                      <select
                        {...register("type", { required: true })}
                        className="p-2 rounded-lg outline-none ring-2 ring-amber-400 hover:ring-offset-2 transition duration-200 my-2"
                      >
                        {rejectOptions.map((item, key) => (
                          <option key={key} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </form>
                  </div>
                </div>
              ) : null}
              <div className="w-full h-16 sm:h-0"></div>
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        <Layout>
          <div className="flex justify-center items-center m-auto text-xl font-semibold text-slate-500">
            <div>정보가 없습니다.</div>
          </div>
        </Layout>
      )}

      <BottomBar />
    </ProtectedPage>
  );
}
