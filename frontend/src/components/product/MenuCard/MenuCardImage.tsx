interface MenuCardImageProps {
  image: string
  title: string
  isPopular?: boolean
}

export function MenuCardImage({ image, title, isPopular }: MenuCardImageProps) {
  return (
    <div className="relative aspect-[4/3] bg-gray-200">
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
        <span className="text-gray-600 text-sm">Picture: {title}</span>
      </div>
      
      {isPopular && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          Popular
        </div>
      )}
    </div>
  )
}