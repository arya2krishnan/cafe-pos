'use client';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/joy';
import { VenmoQR } from '@/components/VenmoQR';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import CoffeeIcon from '@mui/icons-material/Coffee';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import InventoryIcon from '@mui/icons-material/Inventory';
import SmsIcon from '@mui/icons-material/Sms';

const FEATURES = [
  { icon: <CoffeeIcon sx={{ fontSize: 32 }} />, title: 'Easy menu', body: 'Add items with photos and options in seconds.' },
  { icon: <QrCode2Icon sx={{ fontSize: 32 }} />, title: 'Venmo tips', body: 'QR code on the order screen. Customers tip instantly.' },
  { icon: <SmsIcon sx={{ fontSize: 32 }} />, title: 'SMS alerts', body: 'Customers get a text when their order is ready.' },
  { icon: <InventoryIcon sx={{ fontSize: 32 }} />, title: 'Live orders', body: 'See incoming orders in real time. Mark complete with one tap.' },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, loading, getIdToken } = useAuth();

  // Already logged in -- find their cafe and send them straight there
  useEffect(() => {
    if (loading || !user) return;
    (async () => {
      try {
        const token = await getIdToken();
        const res = await fetch('/api/cafe/me', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          router.replace(`/${data.slug}/orders`);
        } else {
          router.replace('/setup');
        }
      } catch {
        // If anything goes wrong just show the landing page
      }
    })();
  }, [user, loading]);

  // Show a spinner while we check auth instead of flashing the sign-in buttons
  if (loading || user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.body' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.body' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3, py: 10, textAlign: 'center' }}>
        <CoffeeIcon sx={{ fontSize: 64, color: 'primary.500', mb: 2 }} />

        <Typography level="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 'bold', mb: 2 }}>
          Home Cafe POS
        </Typography>

        <Typography level="body-lg" sx={{ maxWidth: 480, color: 'text.secondary', mb: 5, lineHeight: 1.7 }}>
          A point-of-sale for home cafes. Set up your menu, take orders, and accept Venmo tips in minutes.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button size="lg" onClick={() => router.push('/signup')}>Create your cafe</Button>
          <Button size="lg" variant="outlined" color="neutral" onClick={() => router.push('/login')}>Sign in</Button>
          <Button
            size="lg"
            variant="soft"
            color="neutral"
            startDecorator={<CoffeeIcon />}
            onClick={() => document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Buy me a coffee
          </Button>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
            mt: 10,
            maxWidth: 860,
            width: '100%',
          }}
        >
          {FEATURES.map((f) => (
            <Box key={f.title} sx={{ p: 2.5, bgcolor: 'background.level1', borderRadius: 'lg', textAlign: 'center' }}>
              <Box sx={{ color: 'primary.500', mb: 1 }}>{f.icon}</Box>
              <Typography level="title-sm" sx={{ mb: 0.5 }}>{f.title}</Typography>
              <Typography level="body-xs" sx={{ color: 'text.secondary' }}>{f.body}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Buy me a coffee */}
      <Box id="support" sx={{ py: 8, px: 3, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <CoffeeIcon sx={{ fontSize: 28, color: 'primary.500' }} />
          <Typography level="h3">Enjoying this?</Typography>
        </Box>
        <Typography level="body-md" sx={{ color: 'text.secondary', mb: 3, maxWidth: 360, mx: 'auto' }}>
          This is a free tool built with love. If it helps your cafe, consider sending a tip on Venmo!
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <VenmoQR venmoUsername="Arya-Krishnan" size={160} label="Buy me a coffee" />
        </Box>
      </Box>

      <Box component="footer" sx={{ py: 3, textAlign: 'center' }}>
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>homecafepos.xyz</Typography>
      </Box>
    </Box>
  );
}
