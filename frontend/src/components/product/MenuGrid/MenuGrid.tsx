import { MenuItem } from '@/core/mocks/menuData'
import { MenuCard } from '../MenuCard/MenuCard'

interface MenuGridProps {
  items: MenuItem[]
  className?: string
}

export function MenuGrid({ items, className = '' }: MenuGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {items.map((item) => (
        <MenuCard key={item.id} item={item} />
      ))}
    </div>
  )
}