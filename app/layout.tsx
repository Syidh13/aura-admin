import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Aura Admin',
  description: 'Super admin dashboard untuk Aura',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 font-sans">
        {children}
      </body>
    </html>
  );
}
