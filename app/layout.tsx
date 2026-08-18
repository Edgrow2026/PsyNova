import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'PsyNova | Digital Psychiatry & Mental Health Platform',
  description: 'Sri Lanka’s premier tele-psychiatry platform with PayHere payments and Notify.lk notifications.',
  openGraph: {
    title: 'PsyNova Psychiatry Platform',
    description: 'Digital Psychiatry & Mental Health Platform for Sri Lanka.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PsyNova Psychiatry Platform',
    description: 'Digital Psychiatry & Mental Health Platform for Sri Lanka.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://sandbox.payhere.lk/lib/payhere.js"
          strategy="lazyOnload"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
