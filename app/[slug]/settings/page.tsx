'use client';
import {
  Box, Typography, FormControl, FormLabel, Input, Button,
  Alert, Stack, Card, CardContent, Chip, Link, Switch,
} from '@mui/joy';
import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useCafe } from '@/components/CafeProvider';
import { NavBar } from '@/components/NavBar';
import { useRouter } from 'next/navigation';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import { useLogoUpload } from '@/hooks/useLogoUpload';
import AccentColorPicker from '@/components/settings/AccentColorPicker';
import SmsPreview from '@/components/settings/SmsPreview';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NextLink from 'next/link';
import { use } from 'react';

export default function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user, loading, getIdToken } = useAuth();
  const { cafe, refetch } = useCafe();
  const router = useRouter();

  const { file: logoFile, preview: logoPreview, inputRef: logoInputRef, handleChange: handleLogoChange } = useLogoUpload();
  const form = useSettingsForm(slug, cafe, getIdToken, refetch);

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=/${slug}/settings`);
  }, [user, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentLogo = logoPreview || cafe?.logoUrl;

  return (
    <>
      <NavBar slug={slug} showAdminLinks />
      <Box sx={{ pt: 10, px: { xs: 2, md: 4 }, pb: 6, maxWidth: 640, mx: 'auto' }}>
        <Typography level="h1" sx={{ mb: 4 }}>Settings</Typography>

        {form.error && <Alert color="danger" sx={{ mb: 2 }}>{form.error}</Alert>}
        {form.success && <Alert color="success" sx={{ mb: 2 }}>Settings saved!</Alert>}

        <form onSubmit={(e) => form.handleSave(e, logoFile, cafe?.logoUrl ?? '')}>
          <Stack spacing={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-lg" sx={{ mb: 2 }}>Cafe identity</Typography>
                <Stack spacing={2}>
                  <FormControl required>
                    <FormLabel>Cafe name</FormLabel>
                    <Input value={form.cafeName} onChange={(e) => form.setCafeName(e.target.value)} />
                  </FormControl>

                  <FormControl required>
                    <FormLabel>Venmo username</FormLabel>
                    <Input startDecorator="@" value={form.venmoUsername} onChange={(e) => form.setVenmoUsername(e.target.value)} />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Logo</FormLabel>
                    <Box
                      onClick={() => logoInputRef.current?.click()}
                      sx={{
                        border: '2px dashed', borderColor: 'divider', borderRadius: 'md',
                        height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', overflow: 'hidden',
                        '&:hover': { borderColor: 'primary.400', bgcolor: 'background.level1' },
                      }}
                    >
                      {currentLogo ? (
                        <img src={currentLogo} alt="logo" style={{ height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <Stack alignItems="center" spacing={0.5}>
                          <ImageIcon sx={{ fontSize: 32, color: 'text.tertiary' }} />
                          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Click to upload logo</Typography>
                        </Stack>
                      )}
                      <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />
                    </Box>
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography level="title-lg">Tips QR code</Typography>
                    <Typography level="body-sm" sx={{ color: 'text.secondary', mt: 0.25 }}>
                      Show a Venmo QR code on the order confirmation screen.
                    </Typography>
                  </Box>
                  <Switch
                    checked={form.tipsEnabled}
                    onChange={(e) => form.setTipsEnabled(e.target.checked)}
                    color={form.tipsEnabled ? 'success' : 'neutral'}
                  />
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography level="title-lg" sx={{ mb: 0.5 }}>Accent color</Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 2 }}>
                  Sets the color for buttons, chips, and highlights across your cafe.
                </Typography>
                <AccentColorPicker value={form.accentColor} onChange={form.setAccentColor} />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography level="title-lg" sx={{ mb: 0.5 }}>SMS message</Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 2 }}>
                  The standard message is always sent. Add a personal touch below, it appears after.
                </Typography>
                <SmsPreview
                  cafeName={form.cafeName}
                  value={form.customSmsMessage}
                  onChange={form.setCustomSmsMessage}
                  charsLeft={form.charsLeft}
                  maxLength={form.maxCustomMsg}
                />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography level="title-lg">SMS credentials</Typography>
                  {form.hasTwilioCreds && (
                    <Chip color="success" size="sm" startDecorator={<CheckCircleIcon />}>Configured</Chip>
                  )}
                </Box>
                <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  Paste your own Twilio credentials so order-ready texts come from your number.
                </Typography>
                <Link component={NextLink} href="/docs/sms-setup" target="_blank" level="body-sm" sx={{ mb: 2, display: 'inline-block' }}>
                  How to set up a Twilio account →
                </Link>
                <Stack spacing={2}>
                  <FormControl>
                    <FormLabel>Account SID</FormLabel>
                    <Input
                      placeholder={form.hasTwilioCreds ? 'Already set -- paste new value to update' : 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
                      value={form.twilioSid}
                      onChange={(e) => form.setTwilioSid(e.target.value)}
                      slotProps={{ input: { spellCheck: false } }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Auth Token</FormLabel>
                    <Input
                      type="password"
                      placeholder={form.hasTwilioCreds ? 'Already set -- paste new value to update' : 'Your Twilio auth token'}
                      value={form.twilioToken}
                      onChange={(e) => form.setTwilioToken(e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      placeholder={form.hasTwilioCreds ? 'Already set -- paste new value to update' : '+1XXXXXXXXXX'}
                      value={form.twilioPhone}
                      onChange={(e) => form.setTwilioPhone(e.target.value)}
                    />
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" loading={form.isSaving}>Save settings</Button>
          </Stack>
        </form>
      </Box>
    </>
  );
}
