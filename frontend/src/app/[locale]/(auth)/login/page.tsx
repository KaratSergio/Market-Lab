import { Metadata } from 'next';
import { LoginForm } from '@/components/features/auth/forms/LoginForm';

import { QuickLoginButtons } from '@/shared/dev/QuickLoginButtons'; //! for development only 

export const metadata: Metadata = {
  title: 'Login | Greenly',
  description: 'Enter to your account',
};

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <QuickLoginButtons className="mt-8" />
    </>
  )
}