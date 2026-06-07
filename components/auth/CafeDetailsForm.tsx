'use client';
import { Box, Typography, FormControl, FormLabel, Input, Button, Stack, Link } from '@mui/joy';
import ImageIcon from '@mui/icons-material/Image';
import NextLink from 'next/link';

interface CafeDetailsFormProps {
  cafeName: string;
  setCafeName: (v: string) => void;
  venmoUsername: string;
  setVenmoUsername: (v: string) => void;
  logoPreview: string | null;
  fileRef: React.RefObject<HTMLInputElement | null>;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  onBack?: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CafeDetailsForm({
  cafeName, setCafeName, venmoUsername, setVenmoUsername,
  logoPreview, fileRef, handleLogoChange,
  isLoading, onBack, onSubmit,
}: CafeDetailsFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        <FormControl required>
          <FormLabel>Cafe name</FormLabel>
          <Input placeholder="e.g. Blue Bottle" value={cafeName} onChange={(e) => setCafeName(e.target.value)} autoFocus />
        </FormControl>
        <FormControl required>
          <FormLabel>Venmo username (for tips)</FormLabel>
          <Input startDecorator="@" placeholder="yourvenmo" value={venmoUsername} onChange={(e) => setVenmoUsername(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Logo (optional)</FormLabel>
          <Box
            onClick={() => fileRef.current?.click()}
            sx={{
              border: '2px dashed', borderColor: 'divider', borderRadius: 'md',
              height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden',
              '&:hover': { borderColor: 'primary.400', bgcolor: 'background.level1' },
            }}
          >
            {logoPreview ? (
              <img src={logoPreview} alt="logo" style={{ height: '100%', objectFit: 'contain' }} />
            ) : (
              <Stack alignItems="center" spacing={0.5}>
                <ImageIcon sx={{ fontSize: 32, color: 'text.tertiary' }} />
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Upload your cafe logo</Typography>
              </Stack>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />
          </Box>
        </FormControl>
        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
          Want SMS order notifications?{' '}
          <Link component={NextLink} href="/docs/sms-setup" target="_blank">
            Set up Twilio in 5 minutes →
          </Link>
          {' '}(you can do this after signup in Settings)
        </Typography>

        <Stack direction="row" spacing={1}>
          {onBack && (
            <Button variant="outlined" color="neutral" onClick={onBack} sx={{ flex: 1 }}>← Back</Button>
          )}
          <Button type="submit" loading={isLoading} sx={{ flex: onBack ? 2 : 1 }}>
            Create my cafe
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
