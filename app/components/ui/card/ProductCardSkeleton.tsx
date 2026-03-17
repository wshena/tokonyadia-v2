export const ProductCardSkeleton = () => {
  return (
    <div className="w-33 md:w-40 lg:w-45 items-start bg-white space-y-2 animate-pulse">
      {/* Image placeholder */}
      <div className="w-full h-35 md:h-45 bg-gray-200 rounded-md" />

      {/* Content placeholder */}
      <div className="space-y-1 p-1">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-1" />
        <div className="flex gap-2 mt-1">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  )
}