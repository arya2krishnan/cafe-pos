'use client';
export const dynamic = 'force-dynamic';
import { Box, Typography, Button, Stack } from '@mui/joy';
import { useRouter } from 'next/navigation';
import CoffeeIcon from '@mui/icons-material/Coffee';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import InventoryIcon from '@mui/icons-material/Inventory';
import SmsIcon from '@mui/icons-material/Sms';

export default function LandingPage() {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.body' }}>
      {/* Hero */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3, py: 8, textAlign: 'center' }}>
        <CoffeeIcon sx={{ fontSize: 64, color: 'primary.500', mb: 2 }} />
        <Typography level="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 'bold', mb: 2 }}>
          Home Cafe POS
        </Typography>
        <Typography level="body-lg" sx={{ maxWidth: 500, color: 'text.secondary', mb: 4, lineHeight: 1.7 }}>
          A point-of-sale for home cafes. Set up your menu, take orders, and accept Venmo tips — in minutes.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button size="lg" onClick={() => router.push('/signup')}>Create your cafe</Button>
          <Button size="lg" variant="outlined" color="neutral" onClick={() => router.push('/login')}>Sign in</Button>
        </Stack>

        {/* Feature highlights */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mt: 8, maxWidth: 900, width: '100%' }}>
          {[
            { icon: <CoffeeIcon sx={{ fontSize: 32 }} />, title: 'Easy menu', body: 'Add items with photos, prices, and options in seconds.' },
            { icon: <QrCode2Icon sx={{ fontSize: 32 }} />, title: 'Venmo tips', body: 'QR code on the order screen — customers tip instantly.' },
            { icon: <SmsIcon sx={{ fontSize: 32 }} />, title: 'SMS alerts', body: 'Customers get a text when their order is ready.' },
            { icon: <InventoryIcon sx={{ fontSize: 32 }} />, title: 'Live orders', body: 'See incoming orders in real time. Mark complete with one tap.' },
          ].map((f) => (
            <Box key={f.title} sx={{ p: 2.5, bgcolor: 'background.level1', borderRadius: 'lg', textAlign: 'center' }}>
              <Box sx={{ color: 'primary.500', mb: 1 }}>{f.icon}</Box>
              <Typography level="title-md" sx={{ mb: 0.5 }}>{f.title}</Typography>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>{f.body}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box component="footer" sx={{ py: 3, textAlign: 'center' }}>
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>homecafepos.xyz</Typography>
      </Box>
    </Box>
  );
}
