'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CafeConfig } from '@/types';

interface CafeContextValue {
  cafe: CafeConfig | null;
  loading: boolean;
  error: string | null;
  updateCafe: (partial: Partial<CafeConfig>) => void;
}

const CafeContext = createContext<CafeContextValue>({ cafe: null, loading: true, error: null, updateCafe: () => {} });

export function CafeProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [cafe, setCafe] = useState<CafeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/${slug}/config`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setCafe(data);
      })
      .catch(() => setError('Failed to load cafe config'))
      .finally(() => setLoading(false));
  }, [slug]);

  const updateCafe = (partial: Partial<CafeConfig>) =>
    setCafe((prev) => prev ? { ...prev, ...partial } : prev);

  return <CafeContext.Provider value={{ cafe, loading, error, updateCafe }}>{children}</CafeContext.Provider>;
}

export const useCafe = () => useContext(CafeContext);
