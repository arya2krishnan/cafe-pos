'use client';
import { useState } from 'react';
import { Button, Drawer, Box, Typography, IconButton, Stack } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import { QRCodeSVG } from 'qrcode.react';
import { useCafe } from './CafeProvider';
const SNOOPY_URL = 'https://firebasestorage.googleapis.com/v0/b/cafe-pos-gough.firebasestorage.app/o/site-image%2FsnoopyMoney.jpg?alt=media&token=8f672bc8-1607-45d8-9392-38d22bb49b19';

export default function DonationButton() {
  const [open, setOpen] = useState(false);
  const { cafe } = useCafe();

  if (!cafe?.venmoUsername) return null;

  const venmoUrl = `https://venmo.com/${cafe.venmoUsername}`;

  return (
    <>
      <Button
        variant="solid"
        color="success"
        size="lg"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          borderRadius: 'xl',
          zIndex: 1100,
          transition: 'all 0.2s ease-in-out',
          minWidth: 180,
          height: 64,
          px: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          fontWeight: 'bold',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          },
        }}
      >
        <Box sx={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)' }}>
          <img src={SNOOPY_URL} alt="Snoopy with money" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
        <Typography sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem', lineHeight: 1.2 }}>
          Leave a tip :)
        </Typography>
      </Button>

      <Drawer
        anchor="top"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ '--Drawer-verticalSize': 'auto' }}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 480, mx: 'auto', width: '100%' }}>
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography level="h4">Leave a Tip</Typography>
            <IconButton onClick={() => setOpen(false)}><CloseIcon /></IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
              <img src={SNOOPY_URL} alt="Snoopy with money" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Typography level="body-md" sx={{ color: 'text.secondary' }}>
              Thanks for visiting {cafe.name}! Your tip helps keep the coffee flowing.
            </Typography>
          </Box>

          <Stack alignItems="center" spacing={1.5}>
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 'md' }}>
              <QRCodeSVG value={venmoUrl} size={180} />
            </Box>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Scan to tip via Venmo (@{cafe.venmoUsername})
            </Typography>
            <Button variant="solid" color="primary" onClick={() => setOpen(false)} sx={{ minWidth: 140 }}>
              Close
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
