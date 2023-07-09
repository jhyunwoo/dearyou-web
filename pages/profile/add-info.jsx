import { useState } from "react"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import pb from "@/lib/pocketbase"
import { useSetRecoilState } from "recoil"
import { modalState } from "@/lib/recoil"
import SEO from "@/components/SEO"

export default function AddInfo() {
  const [validStudentId, setValidStudentId] = useState(false)

  const setModal = useSetRecoilState(modalState)

  const router = useRouter()

  // React Hook Form 에서 기능 가져오기
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm()

  /** 사용자가 입력한 이름과 학번을 사용자 계정에 업데이트 */
  async function onSubmit(data) {
    const userUpdate = {
      name: data.userName,
      studentId: data.studentId,
    }
    if (validStudentId) {
      try {
        await pb.collection("users").update(pb.authStore.model.id, userUpdate)
        // 데이터 업데이트 완료 후 사용자를 메인 페이지로 이동
        await router.replace("/profile/guideline")
        router.reload()
      } catch {
        console.error("error")
      }
    } else {
      setModal("학번을 확인해야 합니다.")
    }
  }

  /** 사용자가 입력한 학번이 등록된 학번인지 확인 */
  async function checkStudentId() {
    if (watch("studentId")) {
      const records = await pb.collection("users").getFullList({
        filter: `studentId = ${getValues("studentId")}`,
      })

      if (
        records.length > 0 &&
        records[0]?.studentId !== pb?.authStore?.model?.studentId
      ) {
        setModal("이미 등록된 학번입니다.")
      } else if (Number(watch("studentId")) > 210101) {
        setModal("등록 가능한 학번입니다.")
        setValidStudentId(true)
      } else {
        setModal("올바른 학번을 입력하세요.")
      }
    } else {
      setModal("학번을 입력하세요.")
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-black p-4 flex flex-col sm:justify-center sm:items-center dark:text-white">
      <SEO title={"사용자 정보 변경"} />
      <div className="text-xl p-4 font-bold sm:fixed sm:top-0 sm:right-0 sm:left-0">
        사용자 정보 변경
      </div>
      <div className="my-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="text-lg font-semibold">이름</div>
          <input
            className="my-2 p-2 rounded-lg outline-none ring-2 ring-amber-300 focus:ring-offset-1 transition duration-200 dark:bg-gray-800 dark:ring-offset-black"
            {...register("userName", {
              required: true,
              minLength: { value: 2, message: "올바른 이름을 입력해주세요" },
              maxLength: { value: 4, message: "올바른 이름을 입력해주세요" },
            })}
            defaultValue={pb?.authStore?.model?.name}
          />
          {errors.userName && <span>{errors.userName.message}</span>}
          <div className="text-lg font-semibold">학번 (6자리)</div>
          <div className="flex justify-between">
            <input
              className="my-2 w-2/3 p-2 rounded-lg outline-none ring-2 ring-amber-300 focus:ring-offset-1 transition duration-200 dark:bg-gray-800 dark:ring-offset-black"
              {...register("studentId", {
                required: true,
                min: { value: 200101, message: "올바른 학번을 입력해주세요" },
                max: { value: 999999, message: "올바른 학번을 입력해주세요" },
              })}
              defaultValue={pb?.authStore?.model?.studentId}
            />
            <button
              className="bg-amber-500 w-1/4 text-white dark:text-black p-2 m-2  rounded-full hover:bg-amber-600 transition duration-200"
              type="button"
              onClick={checkStudentId}
            >
              확인
            </button>
          </div>
          {errors.studentId && <span>{errors.studentId.message}</span>}

          <button
            className="bg-amber-400 mt-12 text-lg font-bold text-white dark:text-black p-2 px-12 rounded-full mx-auto hover:bg-amber-500 transition duration-200"
            type="submit"
          >
            확인
          </button>
        </form>
      </div>
    </div>
  )
}
