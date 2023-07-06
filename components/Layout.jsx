/** 기본 레이아웃 (최소 높이 스크린, flex, flex-col, bg-slate-50) */
export default function Layout({ children }) {
  return (
    <div className="w-full min-h-screen py-12 p-4 flex flex-col bg-slate-50">
      {children}
    </div>
  )
}
