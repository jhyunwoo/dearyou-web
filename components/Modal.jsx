import { modalState } from "@/lib/recoil"
import { useRecoilState } from "recoil"

export default function Modal() {
  const [modal, setModalState] = useRecoilState(modalState)

  if (modal) {
    return (
      <div className="z-40 fixed top-0 bottom-0 right-0 left-0 w-full h-screen flex justify-center items-center bg-slate-100 dark:bg-slate-900/50 p-8 touch-none">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 flex flex-col justify-center items-center w-full max-w-lg">
          <div className="text-lg font-semibold dark:text-white">{modal}</div>
          <button
            className="bg-amber-500 text-white dark:text-black font-semibold w-full text-center rounded-lg p-2 mt-4"
            onClick={() => setModalState("")}
          >
            확인
          </button>
        </div>
      </div>
    )
  } else {
    return <></>
  }
}
