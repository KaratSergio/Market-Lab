import { Metadata } from 'next';
import { LoginForm } from '@/components/features/auth/forms/LoginForm';

export const metadata: Metadata = {
  title: 'Login | Greenly',
  description: 'Enter to your account',
};

export default function LoginPage() {
  return <LoginForm />;
}