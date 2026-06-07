'use client';
import { useEffect, useState, useCallback } from 'react';
import { Button, Box, CircularProgress, Typography, Alert, IconButton, Tooltip } from '@mui/joy';
import StoreIcon from '@mui/icons-material/Store';
import NoStoreIcon from '@mui/icons-material/DoNotDisturbAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import { createApiService } from '@/lib/api-client';
import { useAuth } from '../AuthProvider';

interface ShopStatusToggleProps {
  slug: string;
}

export default function ShopStatusToggle({ slug }: ShopStatusToggleProps) {
  const { getIdToken } = useAuth();
  const api = createApiService(slug, getIdToken);

  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchShopStatus = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const response = await api.getShopStatus();
      if (response.success && response.data) {
        setIsOpen(response.data.isOpen === true);
        setLastUpdated(new Date());
      } else {
        setError(response.error || 'Failed to fetch shop status');
        setIsOpen(false);
      }
    } catch {
      setError('Unexpected error fetching shop status');
      setIsOpen(false);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchShopStatus(); }, [fetchShopStatus]);

  const handleToggle = async () => {
    if (isOpen === null) return;
    setIsLoading(true);
    setError(null);
    const newStatus = !isOpen;
    setIsOpen(newStatus);
    try {
      const response = await api.toggleShopStatus(newStatus);
      if (!response.success) {
        setError(response.error || 'Failed to toggle shop status');
        setIsOpen(!newStatus);
      } else {
        await fetchShopStatus(false);
      }
    } catch {
      setError('Unexpected error toggling shop status');
      setIsOpen(!newStatus);
    } finally {
      setIsLoading(false);
    }
  };

  if (isOpen === null && !error) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size="sm" />
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {error && (
        <Alert color="danger" sx={{ mb: 1 }}>
          {error}
          <IconButton size="sm" variant="solid" color="danger" onClick={() => fetchShopStatus()} sx={{ ml: 1 }}>
            <RefreshIcon />
          </IconButton>
        </Alert>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="solid"
          color={isOpen ? 'success' : 'danger'}
          startDecorator={isOpen ? <StoreIcon /> : <NoStoreIcon />}
          onClick={handleToggle}
          disabled={isLoading}
          sx={{ fontWeight: 'bold', py: 1, minWidth: 150 }}
        >
          {isLoading ? (
            <CircularProgress size="sm" />
          ) : (
            isOpen ? 'STORE OPEN' : 'STORE CLOSED'
          )}
        </Button>
        <Tooltip title="Refresh status" placement="top">
          <IconButton size="md" variant="outlined" color="neutral" onClick={() => fetchShopStatus()} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      {lastUpdated && (
        <Typography level="body-xs" textAlign="right" sx={{ mt: 0.5, opacity: 0.8 }}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Typography>
      )}
    </Box>
  );
}
