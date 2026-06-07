'use client';
import { Container, Typography, Grid, Box, CircularProgress, Alert, Button } from '@mui/joy';
import { useEffect, useState, useCallback } from 'react';
import { createApiService } from '@/lib/api-client';
import { NavBar } from '@/components/NavBar';
import OrderCard from '@/components/orders/OrderCard';
import ShopStatusToggle from '@/components/common/ShopStatusToggle';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import { OrderData } from '@/types';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function OrdersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user, loading, getIdToken } = useAuth();
  const router = useRouter();
  const api = createApiService(slug, getIdToken);

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{ id: string; number: number } | null>(null);

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
    if (!user) return;
    fetchOrders();
    if (!isShopOpen) return;
    const id = setInterval(() => fetchOrders(), 120000);
    return () => clearInterval(id);
  }, [isShopOpen, fetchOrders, user]);

  const handleCompleteOrder = async (orderId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.finishOrder(orderId);
      if (res.success) {
        if (res.data?.textOptIn === false) alert('Order complete — no SMS (customer opted out). Call out the name!');
        else if (res.data?.textError) alert('Order complete but SMS failed. Call out the name!');
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>;

  return (
    <>
      <NavBar slug={slug} showAdminLinks />
      <Container maxWidth="xl" sx={{ p: 2, pt: 10, pb: 4 }}>
        {error && <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>}
        {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}

        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography level="h1" sx={{ bgcolor: 'primary.main', color: 'white', py: 2, px: 4, borderRadius: 'sm' }}>
            Orders Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button variant="solid" color="primary" startDecorator={<RefreshIcon />} onClick={fetchOrders} disabled={isLoading}>
              Refresh
            </Button>
            <ShopStatusToggle slug={slug} />
          </Box>
        </Box>

        {lastUpdated && (
          <Typography level="body-sm" sx={{ mb: 2, textAlign: 'right', color: 'text.secondary' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
        )}

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

        {/* Delete confirmation modal */}
        {deleteModalOpen && (
          <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}>
            <Box sx={{ bgcolor: 'background.surface', borderRadius: 'md', p: 3, maxWidth: 400, width: '100%' }}>
              <Typography level="h2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DeleteIcon sx={{ color: 'danger.500' }} /> Delete Order
              </Typography>
              <Typography level="body-md" sx={{ mb: 3 }}>
                Are you sure you want to delete Order #{orderToDelete?.number}? This cannot be undone.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button variant="plain" color="neutral" onClick={() => { setDeleteModalOpen(false); setOrderToDelete(null); }}>Cancel</Button>
                <Button variant="solid" color="danger" onClick={handleDeleteOrder}>Delete</Button>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </>
  );
}
