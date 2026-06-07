'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Button, IconButton, Typography } from '@mui/joy';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import { useCafe } from './CafeProvider';
import { useAuth } from './AuthProvider';
import Image from 'next/image';

interface NavBarProps {
  slug: string;
  showAdminLinks?: boolean;
}

export function NavBar({ slug, showAdminLinks = false }: NavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { cafe } = useCafe();
  const { user, signOut } = useAuth();

  const adminLinks = [
    { label: 'POS', path: `/${slug}`, icon: <StorefrontIcon /> },
    { label: 'Orders', path: `/${slug}/orders`, icon: <ReceiptIcon /> },
    { label: 'Admin', path: `/${slug}/admin`, icon: <AdminPanelSettingsIcon /> },
    { label: 'Dashboard', path: `/${slug}/dashboard`, icon: <BarChartIcon /> },
  ];

  const publicLinks = [
    { label: 'POS', path: `/${slug}`, icon: <StorefrontIcon /> },
  ];

  const links = showAdminLinks && user ? adminLinks : publicLinks;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        bgcolor: 'background.surface',
        p: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', ml: { xs: 1, md: 2 }, minWidth: { xs: 'auto', md: '180px' } }}>
        <IconButton onClick={() => router.push(`/${slug}`)} variant="plain" color="neutral" size="sm">
          {cafe?.logoUrl ? (
            <img src={cafe.logoUrl} alt={cafe.name} style={{ width: 24, height: 24, objectFit: 'contain' }} />
          ) : (
            <StorefrontIcon sx={{ fontSize: 24 }} />
          )}
        </IconButton>
        <Typography level="title-lg" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
          {cafe?.name ?? ''}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1 }, mr: { xs: 1, md: 2 }, alignItems: 'center' }}>
        {links.map((link) => (
          <Button
            key={link.path}
            variant={pathname === link.path ? 'solid' : 'soft'}
            color={pathname === link.path ? 'primary' : 'neutral'}
            startDecorator={link.icon}
            onClick={() => router.push(link.path)}
            size="sm"
            sx={{ px: { xs: 1, md: 2 } }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{link.label}</Box>
          </Button>
        ))}

        {showAdminLinks && user && (
          <IconButton
            variant="plain"
            color="neutral"
            size="sm"
            onClick={() => signOut().then(() => router.push('/'))}
            title="Sign out"
          >
            <LogoutIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
