'use client';
import { QRCodeSVG } from 'qrcode.react';
import { Box, Typography } from '@mui/joy';

interface VenmoQRProps {
  venmoUsername: string;
  size?: number;
  label?: string;
}

export function VenmoQR({ venmoUsername, size = 120, label = 'Tip on Venmo' }: VenmoQRProps) {
  const venmoUrl = `https://venmo.com/${venmoUsername}`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        p: 1.5,
        bgcolor: 'background.surface',
        borderRadius: 'md',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <QRCodeSVG value={venmoUrl} size={size} />
      <Typography level="body-xs" sx={{ fontWeight: 'bold', mt: 0.5 }}>
        {label}
      </Typography>
      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
        @{venmoUsername}
      </Typography>
    </Box>
  );
}
