'use client';
import { Box, Typography, Stack, Alert, CircularProgress } from '@mui/joy';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { CafeDetailsForm } from '@/components/auth/CafeDetailsForm';
import { createCafe } from '@/lib/createCafe';
import { useLogoUpload } from '@/hooks/useLogoUpload';
import CoffeeIcon from '@mui/icons-material/Coffee';

export default function SetupPage() {
  const router = useRouter();
  const { user, loading, getIdToken } = useAuth();
  const logo = useLogoUpload();

  const [cafeName, setCafeName] = useState('');
  const [venmoUsername, setVenmoUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cafeName.trim() || !venmoUsername.trim()) {
      setError('Cafe name and Venmo username are required');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');
      const { slug } = await createCafe(token, cafeName, venmoUsername, logo.file);
      router.replace(`/${slug}/admin`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create your cafe');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, bgcolor: 'background.Body' }}>
      <Box sx={{ width: '100%', maxWidth: 480 }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
          <CoffeeIcon sx={{ fontSize: 48, color: 'primary.500' }} />
          <Typography level="h2">Set up your cafe</Typography>
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>
            {user?.displayName ? `Hi ${user.displayName.split(' ')[0]}! ` : ''}Just a few details and you&apos;re live.
          </Typography>
        </Stack>

        {error && <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>}

        <CafeDetailsForm
          cafeName={cafeName}
          setCafeName={setCafeName}
          venmoUsername={venmoUsername}
          setVenmoUsername={setVenmoUsername}
          logoPreview={logo.preview}
          fileRef={logo.inputRef}
          handleLogoChange={logo.handleChange}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      </Box>
    </Box>
  );
}
