'use client';
import { Box, Typography, Alert, Stack, Stepper, Step, StepIndicator, Link, Divider, FormControl, FormLabel, Input, Button } from '@mui/joy';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { signInWithGoogle } from '@/lib/google-auth';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { CafeDetailsForm } from '@/components/auth/CafeDetailsForm';
import { createCafe } from '@/lib/createCafe';
import { useLogoUpload } from '@/hooks/useLogoUpload';
import { useRouter } from 'next/navigation';
import CoffeeIcon from '@mui/icons-material/Coffee';
import NextLink from 'next/link';

type Step = 'account' | 'cafe';

export default function SignupPage() {
  const router = useRouter();
  const logo = useLogoUpload();

  const [step, setStep] = useState<Step>('account');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cafeName, setCafeName] = useState('');
  const [venmoUsername, setVenmoUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.isNewCafe) {
        router.replace('/setup');
      } else {
        router.replace(`/${result.slug}/orders`);
      }
    } catch (err: any) {
      setError(err?.code === 'auth/popup-closed-by-user' ? '' : 'Google sign-in failed');
    } finally {
      setIsGoogleLoading(false);
    }
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
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const token = await cred.user.getIdToken();
      const { slug } = await createCafe(token, cafeName, venmoUsername, logo.file);
      router.replace(`/${slug}/admin`);
    } catch (err: any) {
      setError(err?.code === 'auth/email-already-in-use' ? 'An account with this email already exists' : err?.message || 'Failed to create your cafe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, bgcolor: 'background.Body' }}>
      <Box sx={{ width: '100%', maxWidth: 480 }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
          <CoffeeIcon sx={{ fontSize: 48, color: 'primary.500' }} />
          <Typography level="h2">Create your cafe</Typography>
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>Get set up in 2 steps</Typography>
        </Stack>

        <Stepper sx={{ mb: 4 }}>
          <Step indicator={<StepIndicator variant={step === 'account' ? 'solid' : 'soft'} color="primary">1</StepIndicator>}>Account</Step>
          <Step indicator={<StepIndicator variant={step === 'cafe' ? 'solid' : 'soft'} color="primary">2</StepIndicator>}>Cafe details</Step>
        </Stepper>

        {error && <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>}

        {step === 'account' ? (
          <>
            <GoogleSignInButton onClick={handleGoogle} loading={isGoogleLoading} label="Sign up with Google" />
            <Divider sx={{ my: 2.5 }}>or</Divider>
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
          </>
        ) : (
          <CafeDetailsForm
            cafeName={cafeName}
            setCafeName={setCafeName}
            venmoUsername={venmoUsername}
            setVenmoUsername={setVenmoUsername}
            logoPreview={logo.preview}
            fileRef={logo.inputRef}
            handleLogoChange={logo.handleChange}
            isLoading={isLoading}
            onBack={() => { setStep('account'); setError(''); }}
            onSubmit={handleCreateCafe}
          />
        )}

        <Typography level="body-sm" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          Already have an account?{' '}
          <Link component={NextLink} href="/login">Sign in</Link>
        </Typography>
      </Box>
    </Box>
  );
}
