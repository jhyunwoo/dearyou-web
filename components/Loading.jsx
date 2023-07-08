import { Cog6ToothIcon } from "@heroicons/react/24/outline"

/** 로딩 컴포넌트 */
export default function Loading() {
  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 w-full h-screen touch-none bg-slate-50 dark:bg-black/30 flex justify-center items-center">
      <Cog6ToothIcon className="w-12 h-12 text-slate-500 animate-spin" />
    </div>
  )
}
