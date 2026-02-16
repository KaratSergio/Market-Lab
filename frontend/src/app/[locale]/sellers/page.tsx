import { Suspense } from 'react';
import { Sellers } from '@/components/sellers/Sellers';
import { Spinner } from '@/components/ui';

export default function SellersPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Sellers />
    </Suspense>
  );
}