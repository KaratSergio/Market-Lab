import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/features/auth/forms/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | Greenly',
  description: 'Reset your password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ForgotPasswordForm />
    </div>
  );
}