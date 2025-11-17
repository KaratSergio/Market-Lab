import { MenuItem } from '@/core/mocks/menuData'
import { MenuCardImage } from './MenuCardImage'
import { MenuCardInfo } from './MenuCardInfo'
import { MenuCardActions } from './MenuCardActions'

interface MenuCardProps {
  item: MenuItem
  className?: string
}

export function MenuCard({ item, className = '' }: MenuCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      <MenuCardImage 
        image={item.image} 
        title={item.title}
        isPopular={item.isPopular}
      />
      <div className="p-4">
        <MenuCardInfo item={item} />
        <MenuCardActions item={item} />
      </div>
    </div>
  )
}