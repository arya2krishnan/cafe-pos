import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import InitColorSchemeScript from '@mui/joy/InitColorSchemeScript';

export const metadata: Metadata = {
  title: 'Home Cafe POS',
  description: 'Point of sale for home cafes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <InitColorSchemeScript defaultMode="system" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
