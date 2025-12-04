import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductDetails } from '@/components/product'
import { products } from '@/core/mocks/productsData'

export default async function ProductPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const product = products.find(item => item.id === id)

  if (!product) notFound()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          href="/products"
          className="text-green-600 hover:text-green-700 hover:underline inline-flex items-center gap-2"
        >
          ← Back to Products
        </Link>
      </div>

      <ProductDetails product={product} />

      {/* Other products from this farmer */}
      <div className="mt-12 pt-8 border-t">
        <h3 className="text-2xl font-bold mb-6">
          Other products from {product.farmerName}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products
            .filter(p => p.farmerName === product.farmerName && p.id !== id)
            .slice(0, 4)
            .map(relatedProduct => (
              <Link
                key={relatedProduct.id}
                href={`/products/${relatedProduct.id}`}
                className="block p-4 border rounded-lg hover:shadow-md transition"
              >
                <div className="font-medium mb-1">{relatedProduct.title}</div>
                <div className="text-green-600 font-bold">{relatedProduct.price}</div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}