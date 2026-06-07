'use client';
import { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssVarsProvider } from '@mui/joy/styles';
import { AuthProvider } from './AuthProvider';

// Material ThemeProvider gives @mui/icons-material the breakpoints context it needs.
// Joy CssVarsProvider provides the Joy theme. Both coexist via separate React contexts.
const materialTheme = createTheme();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={materialTheme}>
      <AuthProvider>
        <CssVarsProvider>{children}</CssVarsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
