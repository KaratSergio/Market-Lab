import { MenuItem } from '@/core/mocks/menuData'

interface MenuCardInfoProps {
  item: MenuItem
}

export function MenuCardInfo({ item }: MenuCardInfoProps) {
  return (
    <div className="mb-4">
      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
      
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <span>🕒 {item.cookingTime}</span>
        <span>🔥 {item.calories}</span>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">⭐</span>
          <span className="font-medium">{item.rating}</span>
          <span className="text-gray-500">({item.reviewsCount})</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span 
            key={tag}
            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}