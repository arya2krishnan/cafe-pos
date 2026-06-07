'use client';
import { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';

const joyTheme = extendTheme({
  fontFamily: {
    body: "'Talina', Arial, sans-serif",
    display: "'Talina', Arial, sans-serif",
  },
});
import { AuthProvider } from './AuthProvider';

const materialTheme = createTheme();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={materialTheme}>
      <AuthProvider>
        <CssVarsProvider theme={joyTheme} defaultMode="dark">{children}</CssVarsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
