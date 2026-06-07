'use client';
import { CssVarsProvider } from '@mui/joy/styles';
import { AuthProvider } from './AuthProvider';
import { ReactNode } from 'react';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CssVarsProvider>{children}</CssVarsProvider>
    </AuthProvider>
  );
}
