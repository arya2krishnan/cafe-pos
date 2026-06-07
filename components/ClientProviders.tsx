'use client';
import { CssVarsProvider } from '@mui/joy/styles';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from './AuthProvider';
import { ReactNode } from 'react';

// @mui/icons-material uses @mui/material's ThemeProvider internally to resolve
// breakpoints. Without it, rendering any icon throws "Cannot read properties of
// undefined (reading 'length')". Joy's CssVarsProvider is separate and unaffected.
const materialTheme = createTheme();

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={materialTheme}>
      <AuthProvider>
        <CssVarsProvider>{children}</CssVarsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
