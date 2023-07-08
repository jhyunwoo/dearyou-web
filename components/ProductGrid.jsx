/** 제품 나열 그리드 */
export default function ProductGrid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
      {children}
    </div>
  )
}
