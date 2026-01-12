import { Metadata } from 'next';
import { SupplierProfileForm } from '@/components/features/auth/forms/supplier/SupplierProfileForm';

export const metadata: Metadata = {
  title: 'Complete Profile - Supplier | Greenly',
  description: 'Complete your supplier profile',
};

export default function SupplierProfilePage() {
  return <SupplierProfileForm />;
}