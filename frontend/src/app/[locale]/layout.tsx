import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { locales } from '@/core/constants/locales';
import { ReactQueryProvider } from '@/core/providers/reactQueryProvider';
import { Header } from '@/components/layout/Header'

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;
  if (!locales.includes(locale as any)) notFound();
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Europe/Kiev"
      now={new Date()}
      key={locale}
    >
      <ReactQueryProvider>
        <Header />
        <main>{children}</main>
        {/* <Footer /> */}
      </ReactQueryProvider>
    </NextIntlClientProvider>
  );
}