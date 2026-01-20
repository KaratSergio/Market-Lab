import type { Metadata } from "next";
import { geistSans, geistMono } from "@/shared/assets/fonts/fonts";
import "../shared/styles/globals.css";

export const metadata: Metadata = {
  title: "Greenly",
  description: "Fresh products from farmers",
};

export default function GlobalRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}