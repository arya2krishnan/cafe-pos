'use client';
import { Typography, Alert, CircularProgress, Box, Chip } from '@mui/joy';
import ItemGrid from '@/components/items/ItemGrid';
import CartButton from '@/components/receipt/CartButton';
import { useCartStore } from '@/store/cartStore';
import { useEffect, useState, useCallback, useRef } from 'react';
import UserInput from '@/components/user/UserInput';
import OrderNumber from '@/components/user/OrderNumber';
import { createApiService } from '@/lib/api-client';
import { NavBar } from '@/components/NavBar';
import DonationButton from '@/components/DonationButton';
import { useCafe } from '@/components/CafeProvider';
import { useAuth } from '@/components/AuthProvider';
import { ItemData } from '@/types';
import { Fireworks } from '@fireworks-js/react';
import type { FireworksHandlers } from '@fireworks-js/react';
import { use } from 'react';

export default function POSPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { cafe } = useCafe();
  const { getIdToken } = useAuth();
  const api = createApiService(slug, getIdToken);

  const cartItems = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const [items, setItems] = useState<ItemData[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState('');
  const [isUserInputOpen, setIsUserInputOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [textOptIn, setTextOptIn] = useState(true);
  const [isOrderNumberOpen, setIsOrderNumberOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showFireworks, setShowFireworks] = useState(false);
  const [shopOpen, setShopOpen] = useState<boolean | null>(null);
  const fireworksRef = useRef<FireworksHandlers>(null);

  const fetchItems = useCallback(async () => {
    setItemsLoading(true);
    setItemsError('');
    try {
      const [itemsRes, shopRes] = await Promise.all([api.getItems(), api.getShopStatus()]);
      if (itemsRes.success && itemsRes.data) setItems(itemsRes.data as ItemData[]);
      else setItemsError(itemsRes.error || 'Failed to fetch items');
      if (shopRes.success && shopRes.data) setShopOpen(shopRes.data.isOpen);
    } catch { setItemsError('Unexpected error fetching items'); }
    finally { setItemsLoading(false); }
  }, [slug]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    if (showFireworks && fireworksRef.current) {
      for (let i = 0; i < 5; i++) setTimeout(() => fireworksRef.current?.launch(1), i * 200);
      const t = setTimeout(() => setShowFireworks(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showFireworks]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) { setErrorMessage('Your cart is empty.'); return; }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const status = await api.getShopStatus();
      if (!status.success || !status.data?.isOpen) {
        setErrorMessage('Sorry, the store is currently closed. Please come back later.');
        return;
      }
      setIsUserInputOpen(true);
    } catch { setErrorMessage('Unable to verify shop status. Please try again.'); }
    finally { setIsLoading(false); }
  };

  const processOrder = async (customerName = userName, customerPhone = userPhone, optIn = textOptIn) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (!customerName.trim() && !customerPhone.trim()) {
        setErrorMessage('Customer name or phone number is required.');
        return;
      }
      const status = await api.getShopStatus();
      if (!status.success || !status.data?.isOpen) {
        setErrorMessage('The store has closed. Your order cannot be processed.');
        return;
      }
      const generatedOrderNumber = Math.floor(Math.random() * 900) + 100;
      setOrderNumber(generatedOrderNumber);

      const res = await api.submitOrder({
        orderNumber: generatedOrderNumber,
        customerName,
        customerPhone,
        textOptIn: optIn,
        items: cartItems,

        orderDate: new Date().toISOString(),
        donation: { donated: false, amount: 0 },
      });

      if (res.success) {
        setShowFireworks(true);
        setIsOrderNumberOpen(true);
        await fetchItems();
        clearCart();
      } else {
        setErrorMessage(res.error || 'Failed to place order');
      }
    } catch { setErrorMessage('An unexpected error occurred'); }
    finally { setIsLoading(false); }
  };

  return (
    <>
      <NavBar slug={slug} showAdminLinks={false} />

      <Box sx={{ pt: '64px', pb: 4, px: { xs: 2, md: 1 }, minHeight: 'calc(100vh - 64px)', bgcolor: 'background.body' }}>
        <Box sx={{ px: { xs: 1, md: 1 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, mb: 3, gap: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
              {cafe?.logoUrl && (
                <img src={cafe.logoUrl} alt={cafe.name} style={{ width: 80, height: 80, objectFit: 'contain' }} />
              )}
              <Typography level="h2" sx={{ fontWeight: 'bold', fontSize: { xs: '2.5rem', md: '3.5rem' }, textTransform: 'uppercase' }}>
                {cafe?.name ?? ''}
              </Typography>
            </Box>
            {shopOpen !== null && (
              <Chip
                size="sm"
                variant="soft"
                color={shopOpen ? 'success' : 'danger'}
                sx={{ fontWeight: 'md' }}
              >
                {shopOpen ? 'Open' : 'Closed'}
              </Chip>
            )}
          </Box>

          {shopOpen === false && (
            <Alert color="warning" sx={{ mb: 2 }}>
              This store is currently closed — orders cannot be placed right now.
            </Alert>
          )}
          {itemsError && <Alert color="danger" sx={{ mb: 2 }}>{itemsError}</Alert>}
          {errorMessage && <Alert color="danger" sx={{ mb: 2 }}>{errorMessage}</Alert>}
          {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}

          {itemsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
          ) : (
            <ItemGrid items={items} />
          )}

          {/* Cart button */}
          <Box sx={{ position: 'fixed', top: 64, right: 16, zIndex: 1050 }}>
            <CartButton
              items={cartItems}
              onClick={handleCheckout}
              onRemove={removeItem}
              onDestroy={clearCart}
              onQuantityChange={updateQuantity}
            />
          </Box>

          <DonationButton />

          <UserInput
            isOpen={isUserInputOpen}
            name={userName}
            phone={userPhone}
            onClick={(n, p, opt) => { setUserName(n); setUserPhone(p); setTextOptIn(opt); setTimeout(() => processOrder(n, p, opt), 100); }}
            onClose={() => setIsUserInputOpen(false)}
          />

          <OrderNumber
            open={isOrderNumberOpen}
            onClose={() => { setIsOrderNumberOpen(false); setUserName(''); setUserPhone(''); setTextOptIn(true); }}
            name={userName}
            orderNumber={orderNumber}
          />
        </Box>
      </Box>

      {showFireworks && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, pointerEvents: 'none' }}>
          <Fireworks
            ref={fireworksRef}
            options={{ rocketsPoint: { min: 0, max: 100 } }}
            style={{ top: 0, left: 0, width: '100%', height: '100%', position: 'fixed', background: 'transparent' }}
          />
        </Box>
      )}
    </>
  );
}
