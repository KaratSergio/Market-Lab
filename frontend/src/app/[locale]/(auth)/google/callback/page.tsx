import { Metadata } from 'next';
import { GoogleCallbackHandler } from '@/components/features/auth/GoogleCallbackHandler';

export const metadata: Metadata = {
  title: 'Google Authentication | Greenly',
  description: 'Completing Google authentication process',
};

interface PageProps {
  searchParams: Promise<{ code?: string; error?: string }>;
}

export default async function GoogleCallbackPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { code, error } = params;

  return <GoogleCallbackHandler code={code} error={error} />;
}