'use client';
import { Box, Typography, FormControl, FormLabel, Input, Button, Alert, Stack, Link, Divider } from '@mui/joy';
import { useState, useEffect, Suspense } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { signInWithGoogle } from '@/lib/google-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import CoffeeIcon from '@mui/icons-material/Coffee';
import NextLink from 'next/link';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const next = params.get('next') || null;

  useEffect(() => {
    if (!loading && user) {
      if (next) { router.replace(next); return; }
      router.replace('/');
    }
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await cred.user.getIdToken();
      const res = await fetch('/api/cafe/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        router.replace(next || `/${data.slug}/orders`);
      } else {
        router.replace('/setup');
      }
    } catch (err: any) {
      setError(err?.code === 'auth/invalid-credential' ? 'Invalid email or password' : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.isNewCafe) {
        router.replace('/setup');
      } else {
        router.replace(next || `/${result.slug}/orders`);
      }
    } catch (err: any) {
      setError(err?.code === 'auth/popup-closed-by-user' ? '' : 'Google sign-in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (loading) return null;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, bgcolor: 'background.body' }}>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
          <CoffeeIcon sx={{ fontSize: 48, color: 'primary.500' }} />
          <Typography level="h2">Welcome back</Typography>
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>Sign in to your cafe</Typography>
        </Stack>

        {error && <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>}

        <GoogleSignInButton onClick={handleGoogle} loading={isGoogleLoading} />

        <Divider sx={{ my: 2.5 }}>or</Divider>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <FormControl required>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </FormControl>
            <FormControl required>
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormControl>
            <Button type="submit" loading={isLoading} size="lg" fullWidth>Sign in</Button>
          </Stack>
        </form>

        <Typography level="body-sm" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          Don&apos;t have a cafe?{' '}
          <Link component={NextLink} href="/signup">Create one</Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
