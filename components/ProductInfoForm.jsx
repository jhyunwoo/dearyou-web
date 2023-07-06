import { useForm } from "react-hook-form"

// 등록 가능한 물품 종류
const typeOptions = ["교과서", "문제집 / 인강 교재", "교양서", "기타"]

/** 제품 정보 입력 컴포넌트 */
export default function ProductInfoForm(props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  return (
    <div className="">
      <form onSubmit={handleSubmit(props.onSubmit)} className="flex flex-col">
        <div className="text-lg font-semibold">물품명</div>
        <input
          {...register("name", { required: true })}
          className="p-2 rounded-lg outline-none ring-2 ring-amber-400 hover:ring-offset-2 transition duration-200 my-2"
          defaultValue={props.productInfo?.name}
          maxLength={50}
        />
        <div className="text-lg font-semibold">
          설명 <span className="text-gray-400 text-sm">(최대 300자)</span>
        </div>
        <textarea
          {...register("explain", { required: true })}
          className="p-2 rounded-lg outline-none ring-2 h-32 ring-amber-400 hover:ring-offset-2 transition duration-300 my-2"
          defaultValue={props.productInfo?.explain}
          maxLength={300}
        />
        {errors.exampleRequired && <span>This field is required</span>}
        <div className="text-lg font-semibold">종류</div>
        <select
          {...register("type", { required: true })}
          className="p-2 rounded-lg outline-none ring-2 ring-amber-400 hover:ring-offset-2 transition duration-200 my-2"
          defaultValue={props.productInfo?.type}
        >
          {typeOptions.map((item, key) => (
            <option key={key} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button
          className="bg-amber-400 hover:bg-amber-500 transition duration-200  text-white p-2 px-6 rounded-full text-base font-semibold mt-4"
          type="submit"
        >
          제출
        </button>
      </form>
    </div>
  )
}
