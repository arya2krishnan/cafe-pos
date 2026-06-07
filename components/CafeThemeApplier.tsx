'use client';
import { ReactNode } from 'react';
import { useCafe } from './CafeProvider';

export function CafeThemeApplier({ children }: { children: ReactNode }) {
  const { cafe } = useCafe();
  const color = cafe?.accentColor;

  if (!color) return <>{children}</>;

  // Inline style on a real div guarantees CSS custom properties cascade to all children.
  // MUI Joy buttons/chips/links read these vars directly, so they switch color instantly.
  const style = {
    '--joy-palette-primary-50':  `${color}19`,
    '--joy-palette-primary-100': `${color}33`,
    '--joy-palette-primary-200': `${color}55`,
    '--joy-palette-primary-300': `${color}88`,
    '--joy-palette-primary-400': `${color}aa`,
    '--joy-palette-primary-500': color,
    '--joy-palette-primary-600': color,
    '--joy-palette-primary-700': color,
    '--joy-palette-primary-solidBg':        color,
    '--joy-palette-primary-solidHoverBg':   color,
    '--joy-palette-primary-solidActiveBg':  color,
    '--joy-palette-primary-softBg':         `${color}28`,
    '--joy-palette-primary-softColor':      color,
    '--joy-palette-primary-softHoverBg':    `${color}33`,
    '--joy-palette-primary-softActiveBg':   `${color}44`,
    '--joy-palette-primary-outlinedColor':  color,
    '--joy-palette-primary-outlinedBorder': color,
    '--joy-palette-primary-plainColor':     color,
  } as React.CSSProperties;

  return <div style={style}>{children}</div>;
}
