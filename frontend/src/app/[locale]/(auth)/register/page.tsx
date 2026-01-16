import { Metadata } from 'next';
import { RegisterForm } from '@/components/features/auth/forms/RegisterForm';

export const metadata: Metadata = {
  title: 'Register | Greenly',
  description: 'Create your account',
};

export default function RegisterPage() {
  return <RegisterForm />;
}