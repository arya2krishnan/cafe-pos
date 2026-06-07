'use client';
import { Box, Typography, FormControl, FormLabel, Input, Button, Alert, Stack, Stepper, Step, StepIndicator, Link } from '@mui/joy';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { useRouter } from 'next/navigation';
import CoffeeIcon from '@mui/icons-material/Coffee';
import ImageIcon from '@mui/icons-material/Image';
import NextLink from 'next/link';
import { useRef } from 'react';

type Step = 'account' | 'cafe';

export default function SignupPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('account');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cafeName, setCafeName] = useState('');
  const [venmoUsername, setVenmoUsername] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAccountNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setStep('cafe');
  };

  const handleCreateCafe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cafeName.trim() || !venmoUsername.trim()) {
      setError('Cafe name and Venmo username are required');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      // 1. Create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const token = await cred.user.getIdToken();

      // 2. Upload logo if provided
      let logoUrl = '';
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
          logoUrl = data.logoUrl || '';
        }
      }

      // 3. Create cafe in Firestore
      const cafeRes = await fetch('/api/cafe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: cafeName.trim(), venmoUsername: venmoUsername.trim(), logoUrl }),
      });

      if (!cafeRes.ok) {
        const err = await cafeRes.json();
        throw new Error(err.error || 'Failed to create cafe');
      }

      const { slug } = await cafeRes.json();
      router.replace(`/${slug}/admin`);
    } catch (err: any) {
      const msg =
        err?.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists'
          : err?.message || 'Failed to create your cafe';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, bgcolor: 'background.body' }}>
      <Box sx={{ width: '100%', maxWidth: 480 }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
          <CoffeeIcon sx={{ fontSize: 48, color: 'primary.500' }} />
          <Typography level="h2">Create your cafe</Typography>
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>Get set up in 2 steps</Typography>
        </Stack>

        {/* Stepper */}
        <Stepper sx={{ mb: 4 }}>
          <Step indicator={<StepIndicator variant={step === 'account' ? 'solid' : 'soft'} color="primary">1</StepIndicator>}>
            Account
          </Step>
          <Step indicator={<StepIndicator variant={step === 'cafe' ? 'solid' : 'soft'} color="primary">2</StepIndicator>}>
            Cafe details
          </Step>
        </Stepper>

        {error && <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>}

        {step === 'account' ? (
          <form onSubmit={handleAccountNext}>
            <Stack spacing={2}>
              <FormControl required>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              </FormControl>
              <FormControl required>
                <FormLabel>Password</FormLabel>
                <Input type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
              </FormControl>
              <Button type="submit" size="lg" fullWidth>Next →</Button>
            </Stack>
          </form>
        ) : (
          <form onSubmit={handleCreateCafe}>
            <Stack spacing={2.5}>
              <FormControl required>
                <FormLabel>Cafe name</FormLabel>
                <Input placeholder="e.g. Blue Bottle" value={cafeName} onChange={(e) => setCafeName(e.target.value)} autoFocus />
              </FormControl>

              <FormControl required>
                <FormLabel>Venmo username (for tips)</FormLabel>
                <Input
                  startDecorator="@"
                  placeholder="yourvenmo"
                  value={venmoUsername}
                  onChange={(e) => setVenmoUsername(e.target.value)}
                />
              </FormControl>

              {/* Logo upload */}
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

              <Stack direction="row" spacing={1}>
                <Button variant="outlined" color="neutral" onClick={() => { setStep('account'); setError(''); }} sx={{ flex: 1 }}>
                  ← Back
                </Button>
                <Button type="submit" loading={isLoading} sx={{ flex: 2 }}>
                  Create my cafe
                </Button>
              </Stack>
            </Stack>
          </form>
        )}

        <Typography level="body-sm" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          Already have an account?{' '}
          <Link component={NextLink} href="/login">Sign in</Link>
        </Typography>
      </Box>
    </Box>
  );
}
