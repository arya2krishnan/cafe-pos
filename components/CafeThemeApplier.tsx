'use client';
import { ReactNode, useEffect } from 'react';
import { useCafe } from './CafeProvider';

/** Darken a #RRGGBB hex color by a 0–1 fraction. */
function darken(hex: string, amount: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.max(0, Math.round(r * (1 - amount)));
  const ng = Math.max(0, Math.round(g * (1 - amount)));
  const nb = Math.max(0, Math.round(b * (1 - amount)));
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

// Sets Joy UI CSS vars on :root so they cascade into portals (modals, drawers, tooltips)
// which render outside the React component tree in document.body.
export function CafeThemeApplier({ children }: { children: ReactNode }) {
  const { cafe } = useCafe();
  const color = cafe?.accentColor;

  useEffect(() => {
    if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return;
    const root = document.documentElement;
    const vars: Record<string, string> = {
      '--joy-palette-primary-50':  `${color}19`,
      '--joy-palette-primary-100': `${color}33`,
      '--joy-palette-primary-200': `${color}55`,
      '--joy-palette-primary-300': `${color}88`,
      '--joy-palette-primary-400': `${color}aa`,
      '--joy-palette-primary-500': color,
      '--joy-palette-primary-600': darken(color, 0.15),
      '--joy-palette-primary-700': darken(color, 0.28),
      '--joy-palette-primary-solidBg':          color,
      '--joy-palette-primary-solidHoverBg':     darken(color, 0.15),
      '--joy-palette-primary-solidActiveBg':    darken(color, 0.28),
      '--joy-palette-primary-softBg':           `${color}28`,
      '--joy-palette-primary-softColor':        color,
      '--joy-palette-primary-softHoverBg':      `${color}3d`,
      '--joy-palette-primary-softActiveBg':     `${color}52`,
      '--joy-palette-primary-outlinedColor':    color,
      '--joy-palette-primary-outlinedBorder':   color,
      '--joy-palette-primary-outlinedHoverBg':  `${color}40`,
      '--joy-palette-primary-outlinedActiveBg': `${color}59`,
      '--joy-palette-primary-plainColor':       color,
      '--joy-palette-primary-plainHoverBg':     `${color}33`,
      '--joy-palette-primary-plainActiveBg':    `${color}4d`,
    };
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    return () => { Object.keys(vars).forEach((k) => root.style.removeProperty(k)); };
  }, [color]);

  return <>{children}</>;
}
