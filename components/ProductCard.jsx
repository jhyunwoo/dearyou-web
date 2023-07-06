import Link from "next/link"
import Image from "next/image"

/** 제품 표시 컴포넌트 */
export default function ProductCard(props) {
  return (
    <Link
      href={
        props.autonomy
          ? `/autonomy/${props.data.id}`
          : `/products/${props.data.id}`
      }
    >
      <div
        className={`flex rounded-lg p-2  w-full ${
          props.data?.soldDate || props.data?.rejectedReason
            ? "bg-slate-100"
            : "bg-white"
        }`}
      >
        <Image
          src={`https://dearyouapi.moveto.kr/api/files/products/${props.data.id}/${props.data.photos[0]}?thumb=100x100`}
          width={300}
          height={300}
          alt={props.data.name}
          priority={true}
          className=" w-28 h-28  mr-4 rounded-lg"
        />
        <div className="flex justify-between flex-col">
          <div className="font-bold text-lg">{props.data?.name}</div>
          <div className="font-medium text-base flex flex-col">
            <div className="font-semibold">
              {props.data?.expand?.seller?.name}
            </div>
            <div>{props.data?.expand?.seller?.studentId}</div>
            <div className="text-amber-500">
              {props.data?.soldDate ? "나눔 완료" : ""}
            </div>
            <div className="text-red-500">
              {!props.data?.isConfirmed && props.data?.rejectedReason
                ? "반려됨"
                : ""}
            </div>
            <div className="text-amber-500">
              {!props.data?.isConfirmed && !props.data?.rejectedReason
                ? "승인 대기 중"
                : ""}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
