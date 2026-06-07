'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CafeConfig } from '@/types';

interface CafeContextValue {
  cafe: CafeConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CafeContext = createContext<CafeContextValue>({ cafe: null, loading: true, error: null, refetch: () => {} });

export function CafeProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [cafe, setCafe] = useState<CafeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    fetch(`/api/${slug}/config`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setCafe(data);
      })
      .catch(() => setError('Failed to load cafe config'))
      .finally(() => setLoading(false));
  }, [slug, tick]);

  const refetch = () => setTick((t) => t + 1);

  return <CafeContext.Provider value={{ cafe, loading, error, refetch }}>{children}</CafeContext.Provider>;
}

export const useCafe = () => useContext(CafeContext);
