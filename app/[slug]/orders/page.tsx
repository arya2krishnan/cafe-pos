'use client';
import { Container, Typography, Grid, Box, CircularProgress, Alert, Button } from '@mui/joy';
import { useEffect, useState, useCallback } from 'react';
import { createApiService } from '@/lib/api-client';
import { NavBar } from '@/components/NavBar';
import OrderCard from '@/components/orders/OrderCard';
import ShopStatusToggle from '@/components/common/ShopStatusToggle';
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal';
import RefreshIcon from '@mui/icons-material/Refresh';
import { OrderData } from '@/types';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { usePolling } from '@/hooks/usePolling';
import { use } from 'react';

export default function OrdersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user, loading, getIdToken } = useAuth();
  const router = useRouter();
  const api = createApiService(slug, getIdToken);

  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{ id: string; number: number } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=/${slug}/orders`);
  }, [user, loading]);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const shopRes = await api.getShopStatus();
      if (shopRes.success && shopRes.data) setIsShopOpen(shopRes.data.isOpen);
      const res = await api.getUnfinishedOrders();
      if (res.success && res.data) { setOrders(res.data); setLastUpdated(new Date()); }
      else setError(res.error || 'Failed to fetch orders');
    } catch { setError('Unexpected error fetching orders'); }
    finally { setIsLoading(false); }
  }, [slug]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [fetchOrders, user]);

  usePolling(fetchOrders, 120_000, isShopOpen && !!user);

  const handleCompleteOrder = async (orderId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.finishOrder(orderId);
      if (res.success) {
        if (res.data?.textOptIn === false) setSuccessMessage('Order complete. No SMS (customer opted out) — call out the name!');
        else if (res.data?.textError) setSuccessMessage('Order complete but SMS failed. Call out the name!');
        if (isShopOpen) await fetchOrders();
      } else setError(res.error || 'Failed to complete order');
    } catch { setError('Unexpected error completing order'); }
    finally { setIsLoading(false); }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.deleteOrder(orderToDelete.id);
      if (res.success) { setDeleteModalOpen(false); setOrderToDelete(null); await fetchOrders(); }
      else setError(res.error || 'Failed to delete order');
    } catch { setError('Unexpected error deleting order'); }
    finally { setIsLoading(false); }
  };

  if (!mounted || loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>;

  return (
    <>
      <NavBar slug={slug} showAdminLinks />
      <Container maxWidth="xl" sx={{ p: 2, pt: 10, pb: 4 }}>
        {error && <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && (
          <Alert
            color={successMessage.includes('failed') || successMessage.includes('opted out') ? 'warning' : 'success'}
            sx={{ mb: 2 }}
            endDecorator={
              <Button size="sm" variant="plain" color="neutral" onClick={() => setSuccessMessage(null)}>Dismiss</Button>
            }
          >
            {successMessage}
          </Alert>
        )}
        {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}

        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography level="h1">Orders</Typography>
            {lastUpdated && (
              <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.25 }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button variant="outlined" color="neutral" startDecorator={<RefreshIcon />} onClick={fetchOrders} disabled={isLoading} size="sm">
              Refresh
            </Button>
            <ShopStatusToggle slug={slug} />
          </Box>
        </Box>

        {orders.length === 0 && !isLoading ? (
          <Box sx={{ textAlign: 'center', py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '50vh' }}>
            <Typography level="h2" sx={{ mb: 2 }}>No Unfinished Orders</Typography>
            <Typography level="body-lg">
              {isShopOpen ? "When customers place orders, they'll appear here." : 'The shop is currently closed.'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ width: '100%' }}>
            {orders.map((order) => (
              <Grid key={order.id || order.orderNumber} xs={12} sm={6} md={4} lg={3}>
                <OrderCard
                  order={order}
                  onComplete={handleCompleteOrder}
                  onDelete={(id, num) => { setOrderToDelete({ id, number: num }); setDeleteModalOpen(true); }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <DeleteConfirmModal
          open={deleteModalOpen}
          onClose={() => { setDeleteModalOpen(false); setOrderToDelete(null); }}
          onConfirm={handleDeleteOrder}
          loading={isLoading}
          title="Delete Order"
          description={<>Are you sure you want to delete Order #{orderToDelete?.number}? This cannot be undone.</>}
        />
      </Container>
    </>
  );
}
