import { SellerDetail } from "@/components/sellers/SellerDetail";

export default async function SellerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <SellerDetail supplierId={id} />;
}