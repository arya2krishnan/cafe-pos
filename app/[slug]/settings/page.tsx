'use client';
import {
  Box, Typography, FormControl, FormLabel, Input, Textarea, Button,
  Alert, Stack, Divider, Card, CardContent,
} from '@mui/joy';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useCafe } from '@/components/CafeProvider';
import { NavBar } from '@/components/NavBar';
import { useRouter } from 'next/navigation';
import ImageIcon from '@mui/icons-material/Image';
import { use } from 'react';

const MAX_CUSTOM_MSG = 500;
const STANDARD_MSG = (cafeName: string) =>
  `${cafeName}:\nHello [name]! Your order [number] is ready!\nHead to the counter to pick it up!`;

export default function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user, loading, getIdToken } = useAuth();
  const { cafe } = useCafe();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [cafeName, setCafeName] = useState('');
  const [venmoUsername, setVenmoUsername] = useState('');
  const [customSmsMessage, setCustomSmsMessage] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=/${slug}/settings`);
  }, [user, loading]);

  // Pre-fill from cafe context once loaded
  useEffect(() => {
    if (cafe) {
      setCafeName(cafe.name);
      setVenmoUsername(cafe.venmoUsername);
      setCustomSmsMessage(cafe.customSmsMessage ?? '');
    }
  }, [cafe]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cafeName.trim() || !venmoUsername.trim()) {
      setError('Cafe name and Venmo username are required');
      return;
    }
    if (customSmsMessage.length > MAX_CUSTOM_MSG) {
      setError(`Custom message must be ${MAX_CUSTOM_MSG} characters or fewer`);
      return;
    }
    setError('');
    setSuccess(false);
    setIsSaving(true);

    try {
      const token = await getIdToken();

      // Upload new logo if selected
      let logoUrl = cafe?.logoUrl ?? '';
      if (logoFile) {
        const base64 = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result as string);
          reader.onerror = () => rej(new Error('Failed to read file'));
          reader.readAsDataURL(logoFile);
        });
        const uploadRes = await fetch('/api/logo-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ base64Data: base64, filename: logoFile.name, mimeType: logoFile.type }),
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          logoUrl = data.logoUrl || logoUrl;
        }
      }

      const res = await fetch('/api/cafe', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: cafeName.trim(),
          venmoUsername: venmoUsername.trim(),
          logoUrl,
          customSmsMessage: customSmsMessage.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save settings');
      }

      setSuccess(true);
      setLogoFile(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const charsLeft = MAX_CUSTOM_MSG - customSmsMessage.length;
  const currentLogo = logoPreview || cafe?.logoUrl;

  return (
    <>
      <NavBar slug={slug} showAdminLinks />
      <Box sx={{ pt: 10, px: { xs: 2, md: 4 }, pb: 6, maxWidth: 640, mx: 'auto' }}>
        <Typography level="h1" sx={{ mb: 4 }}>Settings</Typography>

        {error && <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert color="success" sx={{ mb: 2 }}>Settings saved!</Alert>}

        <form onSubmit={handleSave}>
          <Stack spacing={3}>
            {/* Cafe identity */}
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-lg" sx={{ mb: 2 }}>Cafe identity</Typography>
                <Stack spacing={2}>
                  <FormControl required>
                    <FormLabel>Cafe name</FormLabel>
                    <Input value={cafeName} onChange={(e) => setCafeName(e.target.value)} />
                  </FormControl>

                  <FormControl required>
                    <FormLabel>Venmo username</FormLabel>
                    <Input startDecorator="@" value={venmoUsername} onChange={(e) => setVenmoUsername(e.target.value)} />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Logo</FormLabel>
                    <Box
                      onClick={() => fileRef.current?.click()}
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
                      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />
                    </Box>
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>

            {/* SMS customization */}
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-lg" sx={{ mb: 0.5 }}>SMS message</Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 2 }}>
                  The standard message is always sent. Add a personal touch below — it appears after.
                </Typography>

                {/* Preview of the standard message */}
                <Box sx={{ p: 1.5, bgcolor: 'background.level2', borderRadius: 'sm', mb: 2, fontFamily: 'monospace' }}>
                  <Typography level="body-xs" sx={{ whiteSpace: 'pre-line', color: 'text.secondary' }}>
                    {STANDARD_MSG(cafeName || 'Your Cafe')}
                    {customSmsMessage && `\n\n${customSmsMessage}`}
                  </Typography>
                </Box>

                <FormControl>
                  <FormLabel>Custom addition (optional)</FormLabel>
                  <Textarea
                    minRows={3}
                    maxRows={6}
                    placeholder={`e.g. "Thanks for coming out! See you next time ☕"`}
                    value={customSmsMessage}
                    onChange={(e) => setCustomSmsMessage(e.target.value)}
                    slotProps={{ textarea: { maxLength: MAX_CUSTOM_MSG } }}
                  />
                  <Typography
                    level="body-xs"
                    sx={{ textAlign: 'right', mt: 0.5, color: charsLeft < 50 ? 'warning.500' : 'text.tertiary' }}
                  >
                    {charsLeft} characters left
                  </Typography>
                </FormControl>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" loading={isSaving}>Save settings</Button>
          </Stack>
        </form>
      </Box>
    </>
  );
}
