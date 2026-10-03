import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'CLIMPS — Cooperative Savings, Investment & Loan Platform',
  description:
    'CLIMPS by Changing Lives Multipurpose Ventures helps cooperative members save, invest, and borrow — all in one secure platform.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} dark`}>
      <body className={`${plusJakartaSans.className} bg-[#0a0f1e] text-white min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-200`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="bottom-right" richColors closeButton theme="dark" />
      </body>
    </html>
  );
}