/** title props로 페이지 이름을 받고 헤더 표시 */
export default function HeadBar(props) {
  return (
    <div className="w-full bg-slate-50 dark:bg-black p-3  flex justify-start fixed top-0 right-0 left-0">
      <div className="font-bold text-xl dark:text-white">{props.title}</div>
    </div>
  )
}
