'use client';
import dynamic from 'next/dynamic';
import { ReactNode, useState, useEffect } from 'react';

// Load the full client provider tree (MUI Joy + Firebase Auth) only in the browser.
// This avoids SSR issues with MUI Joy's CssVarsProvider and Firebase.
const ClientProviders = dynamic(() => import('./ClientProviders'), { ssr: false });

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render a bare shell during SSR / before hydration
    return <>{children}</>;
  }

  return <ClientProviders>{children}</ClientProviders>;
}
