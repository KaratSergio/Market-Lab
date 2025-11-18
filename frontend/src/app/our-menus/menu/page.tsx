import { MenuGrid } from '@/components/product'
import { menuItems } from '@/core/mocks/menuData'

export default function MenuPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Menu</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover a variety of delicious and easy-to-prepare dishes.
          All ingredients are delivered fresh right to your door.
        </p>
      </div>

      <div className="mb-6">
        {/* <MenuFilters /> */}
      </div>

      <MenuGrid items={menuItems} />
    </div>
  )
}