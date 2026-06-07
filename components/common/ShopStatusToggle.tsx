'use client';
import { useEffect, useState, useCallback } from 'react';
import { Button, CircularProgress } from '@mui/joy';
import StoreIcon from '@mui/icons-material/Store';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import { createApiService } from '@/lib/api-client';
import { useAuth } from '../AuthProvider';

interface ShopStatusToggleProps {
  slug: string;
  onStatusChange?: (isOpen: boolean) => void;
}

export default function ShopStatusToggle({ slug, onStatusChange }: ShopStatusToggleProps) {
  const { getIdToken } = useAuth();
  const api = createApiService(slug, getIdToken);

  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchShopStatus = useCallback(async () => {
    try {
      const res = await api.getShopStatus();
      if (res.success && res.data) {
        setIsOpen(res.data.isOpen);
        onStatusChange?.(res.data.isOpen);
      }
    } catch { /* silently ignore — parent shows errors */ }
  }, [slug]);

  useEffect(() => { fetchShopStatus(); }, [fetchShopStatus]);

  const handleToggle = async () => {
    if (isOpen === null) return;
    const newStatus = !isOpen;
    setIsOpen(newStatus);
    setIsLoading(true);
    try {
      const res = await api.toggleShopStatus(newStatus);
      if (res.success) {
        onStatusChange?.(newStatus);
      } else {
        setIsOpen(!newStatus); // revert on failure
      }
    } catch {
      setIsOpen(!newStatus);
    } finally {
      setIsLoading(false);
    }
  };

  if (isOpen === null) {
    return <Button variant="outlined" color="neutral" disabled size="sm"><CircularProgress size="sm" /></Button>;
  }

  return (
    <Button
      variant="solid"
      color={isOpen ? 'success' : 'danger'}
      startDecorator={isLoading ? <CircularProgress size="sm" /> : isOpen ? <StoreIcon /> : <DoNotDisturbAltIcon />}
      onClick={handleToggle}
      disabled={isLoading}
      sx={{ fontWeight: 'bold', minWidth: 160 }}
    >
      {isOpen ? 'Store Open' : 'Store Closed'}
    </Button>
  );
}
