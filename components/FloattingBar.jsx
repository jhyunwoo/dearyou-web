import Link from "next/link"
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline"

/** 우측 하단 검색 및 제품 생성 버튼 */
export default function FloattingBar() {
  return (
    <div>
      <Link
        href={"/products/create-product"}
        className="fixed right-4 bottom-20 bg-amber-400 p-2 rounded-full transition duration-200 shadow-md ring-2 ring-amber-400 hover:ring-offset-2 group hover:bg-white"
      >
        <PlusIcon className="w-8 h-8 text-white group-hover:text-amber-400" />
        <div className="absolute -bottom-6 right-0 left-0 text-sm text-center font-semibold">
          나눔
        </div>
      </Link>

      <Link
        href="/search"
        className=" fixed right-4 bottom-40 bg-white ring-2 ring-amber-600 p-2 rounded-full transition duration-200 hover:ring-offset-2 hover:bg-amber-600 group"
      >
        <MagnifyingGlassIcon className="w-8 h-8 text-amber-600 group-hover:text-white transition duration-200" />
        <div className="absolute -bottom-6 right-0 left-0 text-sm text-center font-semibold">
          검색
        </div>
      </Link>
    </div>
  )
}
