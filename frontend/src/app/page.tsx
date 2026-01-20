import { redirect } from 'next/navigation';
import { defaultLocale } from '@/core/constants/locales';

export default function RootRedirectPage() {
  redirect(`/${defaultLocale}`);
}