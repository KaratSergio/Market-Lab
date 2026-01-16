import { Metadata } from 'next';
import { CustomerProfileForm } from '@/components/features/auth/forms/customer/CustomerProfileForm';

export const metadata: Metadata = {
  title: 'Complete Profile - Customer | Greenly',
  description: 'Complete your customer profile',
};

export default function CustomerProfilePage() {
  return <CustomerProfileForm />;
}