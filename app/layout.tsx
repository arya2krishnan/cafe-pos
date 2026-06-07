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
  icons: { icon: '/favicon-default.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.className}>
      <head />
      <body>
        {/* MUI Joy dark mode — must be first child of body to prevent flash of unstyled content */}
        <InitColorSchemeScript defaultMode="dark" />
        <Providers>{children}</Providers>
        <footer style={{
          textAlign: 'center',
          padding: '6px 16px',
          borderTop: '1px solid var(--joy-palette-divider)',
          color: 'var(--joy-palette-text-tertiary)',
          fontSize: '0.7rem',
          background: 'var(--joy-palette-background-body)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}>
          <span>© {new Date().getFullYear()} Arya Krishnan</span>
          <span style={{ opacity: 0.3 }}>·</span>
          <a
            href="https://venmo.com/Arya-Krishnan"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-coffee-link"
          >
            Buy me a coffee ☕
          </a>
        </footer>
      </body>
    </html>
  );
}
