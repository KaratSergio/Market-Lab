import { ProductDetails } from '@/components/product/ProductDetails';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ProductDetails productId={id} />;
}