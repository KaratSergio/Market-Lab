import { ProductItem } from '@/core/mocks/productsData'
import { ProductCard } from './card/ProductCard'
import Link from 'next/link'

interface ProductGridProps {
  products: ProductItem[]
  className?: string
}

export function ProductList({ products, className = '' }: ProductGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="block hover:no-underline"
        >
          <ProductCard product={product} />
        </Link>
      ))}
    </div>
  )
}