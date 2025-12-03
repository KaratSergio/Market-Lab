import { Metadata } from 'next';
import { RoleSelectionForm } from '@/components/features/auth/forms/RoleSelectionForm';

export const metadata: Metadata = {
  title: 'Select Role | Greenly',
  description: 'Choose your role',
};

export default function RoleSelectionPage() {
  return (
    <div>
      <RoleSelectionForm />
    </div>
  );
}