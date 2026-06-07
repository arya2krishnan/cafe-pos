import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import InitColorSchemeScript from '@mui/joy/InitColorSchemeScript';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Home Cafe POS',
  description: 'Point of sale for home cafes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.className}>
      <head>
        <InitColorSchemeScript defaultMode="dark" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
