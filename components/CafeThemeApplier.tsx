'use client';
import { ReactNode } from 'react';
import { Box } from '@mui/joy';
import { useCafe } from './CafeProvider';

// Overrides MUI Joy's primary color CSS variables with the cafe's accent color.
// All primary-colored buttons, chips, and links in child routes inherit this.
export function CafeThemeApplier({ children }: { children: ReactNode }) {
  const { cafe } = useCafe();
  const color = cafe?.accentColor;

  if (!color) return <>{children}</>;

  return (
    <Box
      sx={{
        '--joy-palette-primary-500': color,
        '--joy-palette-primary-600': color,
        '--joy-palette-primary-solidBg': color,
        '--joy-palette-primary-solidHoverBg': color,
        '--joy-palette-primary-solidActiveBg': color,
        '--joy-palette-primary-plainColor': color,
        '--joy-palette-primary-outlinedColor': color,
        '--joy-palette-primary-outlinedBorder': color,
        '--joy-palette-primary-softColor': color,
        '--joy-palette-primary-softBg': `${color}28`,
        minHeight: '100%',
        display: 'contents',
      }}
    >
      {children}
    </Box>
  );
}
