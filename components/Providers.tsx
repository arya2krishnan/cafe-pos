'use client';
import { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssVarsProvider } from '@mui/joy/styles';
import { AuthProvider } from './AuthProvider';

const materialTheme = createTheme();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={materialTheme}>
      <AuthProvider>
        <CssVarsProvider defaultMode="dark">{children}</CssVarsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
