'use client';
import { useEffect, useState } from 'react';
import { Button, Drawer, Box, Typography, Stack } from '@mui/joy';
import useMediaQuery from '@mui/material/useMediaQuery';
import TooltipIconButton from '@/components/common/TooltipIconButton';
import CloseIcon from '@mui/icons-material/Close';
import { QRCodeSVG } from 'qrcode.react';
import { useCafe } from './CafeProvider';
const SNOOPY_URL = 'https://firebasestorage.googleapis.com/v0/b/cafe-pos-gough.firebasestorage.app/o/site-image%2FsnoopyMoney.jpg?alt=media&token=8f672bc8-1607-45d8-9392-38d22bb49b19';

export default function DonationButton() {
  const [open, setOpen] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const { cafe } = useCafe();
  // On mobile the customer is already on their phone, so a QR is useless —
  // link straight to Venmo instead of opening the QR drawer.
  const isMobile = useMediaQuery('(max-width:600px)', { noSsr: true });

  // Hide the button when the page footer is in view so it never covers it.
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { rootMargin: '0px 0px -12px 0px' },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (!cafe?.venmoUsername || cafe.tipButtonEnabled === false) return null;

  const venmoUrl = `https://venmo.com/${cafe.venmoUsername}`;

  const linkProps = isMobile
    ? ({ component: 'a', href: venmoUrl, target: '_blank', rel: 'noopener' } as const)
    : ({ onClick: () => setOpen(true) } as const);

  return (
    <>
      <Button
        variant="solid"
        color="success"
        size="lg"
        {...linkProps}
        sx={{
          position: 'fixed',
          bottom: { xs: 12, sm: 20 },
          right: { xs: 12, sm: 20 },
          borderRadius: 'xl',
          zIndex: 1100,
          transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
          minWidth: { xs: 'auto', sm: 180 },
          height: { xs: 52, sm: 64 },
          px: { xs: 1.75, sm: 2.5 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 1.5 },
          fontWeight: 'bold',
          // Fade out (and disable) when the footer is in view so it can't cover it.
          opacity: footerVisible ? 0 : 1,
          pointerEvents: footerVisible ? 'none' : 'auto',
          transform: footerVisible ? 'translateY(16px)' : 'none',
          '&:hover': {
            transform: footerVisible ? 'translateY(16px)' : 'scale(1.05)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          },
        }}
      >
        <Box sx={{ width: { xs: 28, sm: 36 }, height: { xs: 28, sm: 36 }, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)' }}>
          <img src={SNOOPY_URL} alt="Snoopy with money" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
        <Typography sx={{ fontWeight: 'bold', color: 'white', fontSize: { xs: '0.875rem', sm: '1rem' }, lineHeight: 1.2 }}>
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
            <TooltipIconButton tooltip="Close" placement="left" onClick={() => setOpen(false)}><CloseIcon /></TooltipIconButton>
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
