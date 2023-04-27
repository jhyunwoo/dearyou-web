import { useForm } from "react-hook-form";
import { useState, useRef } from "react";
import pb from "@/lib/pocketbase";
import Image from "next/image";
import { useRouter } from "next/router";
import { PhotoIcon } from "@heroicons/react/24/outline";

export default function CreateProduct() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const imgRef = useRef();
  const [showImages, setShowImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 이미지 상대경로 저장
  const handleAddImages = (event) => {
    const imageLists = event.target.files;
    let imageUrlLists = [...showImages];

    for (let i = 0; i < imageLists.length; i++) {
      const currentImageUrl = URL.createObjectURL(imageLists[i]);
      imageUrlLists.push({ id: i, file: currentImageUrl });
    }

    setShowImages(imageUrlLists);
  };

  // X버튼 클릭 시 이미지 삭제
  const handleDeleteImage = (id) => {
    setShowImages(showImages.filter((_, index) => index !== id));
  };

  async function onSubmit(data) {
    if (showImages.length < 1) {
      alert("이미지를 업로드해주세요");
      return;
    } else {
      setIsLoading(true);

      const formData = new FormData();
      showImages.map(async (data) => {
        const file = imgRef.current.files[data.id];
        formData.append("photo", file);
      });
      formData.append("seller", pb.authStore.model.id);
      formData.append("name", data.name);
      formData.append("explain", data.explain);
      formData.append("type", data.type);
      try {
        let result = await pb
          .collection("photos")
          .create(formData, { $autoCancel: true });
        console.log(result);
      } catch {
        console.error("Image Upload Failed");
      }
      setIsLoading(false);
      router.replace("/");
    }
  }

  return (
    <div>
      <div>Create Product</div>
      <div>
        <div className="bg-slate-50  p-4 flex flex-col">
          <div className=" ">
            {showImages.length > 0 ? (
              <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 w-full ">
                {showImages.map((image, id) => (
                  <div key={id} className="mx-auto flex flex-col items-end ">
                    <Image
                      src={image.file}
                      alt={`${image.file}-${id}`}
                      width={1000}
                      height={1000}
                      className="rounded-sm"
                    />
                    <button
                      className="bg-red-500 hover:bg-red-600 duration-200 transition mt-1 text-white py-1 px-2 rounded-lg"
                      onClick={() => handleDeleteImage(id)}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-80 flex justify-center items-center flex-col bg-slate-100 rounded-2xl shadow-xl">
                <div className="flex justify-center items-center flex-col">
                  <PhotoIcon className="w-12 h-12 text-slate-600" />
                  <div className="text-sm p-3">
                    사진을 추가하여 추억을 나눠보세요.
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="m-4 flex justify-center ">
            <label
              htmlFor="input-file"
              onChange={handleAddImages}
              className="bg-white ring-2 hover:ring-offset-2 hover:bg-sky-400 hover:text-white transition duration-200 ring-sky-400 rounded-xl mx-2 text-slate-600 px-4 py-2 font-semibold"
            >
              사진 가져오기
              <input
                type="file"
                id="input-file"
                className="hidden"
                multiple
                ref={imgRef}
              />
            </label>
            {/* <button
              onClick={uploadImage}
              className="bg-sky-400 hover:ring-2 ring-sky-300 hover:ring-offset-2 hover:bg-white hover:text-black transition duration-200 mx-2 text-white px-4 py-2 rounded-xl font-semibold"
            >
              사진 업로드
            </button> */}
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>제품명</div>
          <input {...register("name", { required: true })} />
          <div>설명</div>
          <input {...register("explain", { required: true })} />
          {errors.exampleRequired && <span>This field is required</span>}
          <div>종류</div>
          <input {...register("type", { required: true })} />

          <button type="submit">제출</button>
        </form>
      </div>
    </div>
  );
}
