import { useState, useRef } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import pb from "@/lib/pocketbase"
import Loading from "@/components/Loading"
import ProductInfoForm from "@/components/ProductInfoForm"
import BottomBar from "@/components/BottomBar"
import { useSetRecoilState } from "recoil"
import { modalState } from "@/lib/recoil"
import SEO from "@/components/SEO"
import errorTransmission from "@/lib/errorTransmission"
import va from "@vercel/analytics"

export default function CreateProduct() {
  const imgRef = useRef()
  const [showImages, setShowImages] = useState([])
  const [refImages, setRefImages] = useState([])

  const setModal = useSetRecoilState(modalState)

  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)

  // 이미지 상대경로 저장
  const handleAddImages = (event) => {
    try {
      const imageLists = event.target.files
      let imageUrlLists = [...showImages]

      if (showImages.length + imageLists.length > 10) {
        setModal("이미지는 최대 10개까지 업로드할 수 있습니다!")
        return
      }

      for (let i = 0; i < imageLists.length; i++) {
        const currentImageUrl = URL.createObjectURL(imageLists[i])
        imageUrlLists.push({ id: i + refImages.length, file: currentImageUrl })
      }

      setShowImages(imageUrlLists)
      setRefImages([...refImages, ...imgRef.current.files])
      // imgRef에서 새로 들어온 이미지들을 refImage state에 저장함
    } catch (e) {
      errorTransmission(e)
    }
  }

  // X버튼 클릭 시 이미지 삭제
  const handleDeleteImage = (id) => {
    try {
      setShowImages(showImages.filter((_, index) => index !== id))
    } catch (e) {
      errorTransmission(e)
    }
  }

  async function onSubmit(data) {
    try {
      if (showImages.length < 1) {
        setModal("이미지를 업로드해주세요")
        return
      } else {
        va.track("UploadProduct")
        setIsLoading(true)
        const formData = new FormData()
        showImages.map(async (data) => {
          const file = refImages[data.id]
          formData.append("photos", file)
        })
        formData.append("seller", pb.authStore.model.id)
        formData.append("name", data.name)
        formData.append("explain", data.explain)
        formData.append("type", data.type)
        try {
          let result = await pb
            .collection("products")
            .create(formData, { $autoCancel: true })
        } catch {}

        setModal(
          "물건이 등록되었습니다. 자율위원의 승인을 받으면 다른 사용자에게 물건이 보입니다.",
        )
        await router.replace("/")
      }
      setIsLoading(false)
    } catch (e) {
      errorTransmission(e)
    }
  }

  return (
    <div className="w-full min-h-screen sm:flex sm:flex-col bg-slate-50 dark:bg-black p-4">
      <SEO title={"물품 등록"} />
      {isLoading ? <Loading /> : ""}
      <div className="text-xl font-bold dark:text-white">물품 등록</div>
      <div className="sm:flex sm:justify-center sm:items-start">
        <div className="bg-slate-50 dark:bg-black sm:w-1/2  p-4 flex flex-col">
          <div className="">
            {showImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 w-full ">
                {showImages.map((image, id) => (
                  <div key={id} className="mx-auto flex flex-col items-end ">
                    <Image
                      src={image.file}
                      alt={`${image.file}-${id}`}
                      width={300}
                      height={300}
                      className="rounded-sm"
                    />
                    <button
                      className="bg-red-500 hover:bg-red-600 duration-200 transition mt-1 text-white dark:text-black py-1 px-2 rounded-lg"
                      onClick={() => handleDeleteImage(id)}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              ""
            )}
          </div>
          <div className="m-4 flex justify-center ">
            <label
              htmlFor="input-file"
              onChange={handleAddImages}
              className="bg-white dark:bg-gray-900 ring-2 hover:ring-offset-2 hover:bg-sky-400 hover:text-white dark:text-white dark:ring-offset-black transition duration-200 ring-sky-400 rounded-xl mx-2 text-slate-600 px-4 py-2 font-semibold"
            >
              사진 가져오기
              <input
                type="file"
                id="input-file"
                className="hidden"
                accept="image/jpg, image/png, image/jpeg, image/webp, image/heic, image/heic-sequence, image/heif-sequence image/heif"
                multiple
                ref={imgRef}
              />
            </label>
          </div>
        </div>
        <ProductInfoForm onSubmit={onSubmit} />
        <div className="w-full h-16" />
      </div>
      <BottomBar />
    </div>
  )
}
