import { useRef, useState } from "react"
import Image from "next/image"
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline"

/** 제품 이미지 뷰 컴포넌트 */
export default function ProductImageView(props) {
  const [imageScroll, setImageScroll] = useState(1)
  const imageRef = useRef()
  //이미지 넘김 버튼, 현재 이미지 번호가 담긴 UI
  function ImageUI() {
    return (
      <div className="absolute w-full sm:w-80 opacity-60 hover:opacity-100">
        <div className="absolute m-2 p-2 rounded-2xl text-sm bg-slate-700 text-white">
          {imageScroll}/{imageRef?.current?.children.length}
        </div>
        {imageScroll < imageRef?.current?.children.length ? (
          <ChevronRightIcon
            className="absolute m-2 right-0 top-36 white w-8 h-8"
            onClick={() => {
              imageRef.current.scrollTo({
                left: imageScroll * imageRef.current.offsetWidth,
                behavior: "smooth",
              })
            }}
          />
        ) : null}
        {imageScroll > 1 ? (
          <ChevronLeftIcon
            className="absolute m-2 left-0 top-36 white w-8 h-8"
            onClick={() => {
              imageRef.current.scrollTo({
                left: (imageScroll - 2) * imageRef.current.offsetWidth,
                behavior: "smooth",
              })
            }}
          />
        ) : null}
      </div>
    )
  }
  return (
    <div>
      <ImageUI />
      <div
        className="bg-white sm:h-80 sm:w-80 flex overflow-x-auto  scrollbar-hide snap-x"
        ref={imageRef}
        onScroll={() => {
          setImageScroll(
            Math.round(
              imageRef?.current.scrollLeft / imageRef?.current.offsetWidth,
            ) + 1,
          )
        }}
      >
        {props.productInfo.photos.map((data, key) => (
          <div
            className={`w-screen h-80 sm:h-80 sm:w-80 snap-center  flex-shrink-0`}
            key={key}
          >
            <Image
              src={`https://dearyouapi.moveto.kr/api/files/products/${props.productId}/${data}`}
              width={300}
              height={300}
              priority={true}
              alt={"Product Image"}
              className="object-cover w-screen h-80 sm:w-80"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
