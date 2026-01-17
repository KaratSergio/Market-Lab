import { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/features/auth/forms/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | Greenly',
  description: 'Create a new password',
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ResetPasswordForm token={token} />
    </div>
  );
}