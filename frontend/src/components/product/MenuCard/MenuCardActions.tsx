import { MenuItem } from '@/core/mocks/menuData'

interface MenuCardActionsProps {
  item: MenuItem
}

export function MenuCardActions({ item }: MenuCardActionsProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xl font-bold text-green-600">{item.price}</span>
      <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
        Add
      </button>
    </div>
  )
}