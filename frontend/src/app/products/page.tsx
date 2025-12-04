import { ProductList } from '@/components/product'
import { products } from '@/core/mocks/productsData'

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Eco-Friendly Products</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover a variety of fresh, organic, and locally sourced products.
          All items are delivered directly from farmers to your doorstep.
        </p>
      </div>

      <div className="mb-6">
        {/* <ProductFilters /> */}

        <div className="text-sm text-gray-500 text-center mb-4">
          Showing {products.length} products
        </div>
      </div>

      <ProductList products={products} />
    </div>
  )
}