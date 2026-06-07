'use client';
import Snackbar from '@mui/joy/Snackbar';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { VenmoQR } from '../VenmoQR';
import { useCafe } from '../CafeProvider';

interface OrderNumberProps {
  open: boolean;
  onClose: () => void;
  name: string;
  orderNumber: number;
}

export default function OrderNumber(props: OrderNumberProps) {
  const { cafe } = useCafe();

  return (
    <Snackbar
      autoHideDuration={10000}
      variant="solid"
      color="primary"
      size="lg"
      invertedColors
      open={props.open}
      onClose={props.onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={(theme) => ({
        background: `linear-gradient(45deg, ${theme.palette.primary[600]} 30%, ${theme.palette.primary[500]} 90%)`,
        maxWidth: '400px',
        width: '90vw',
      })}
    >
      <Stack spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
        <Typography level="title-lg">You are Order No. {props.orderNumber}</Typography>
        <Typography>Thank you for your order, {props.name}!</Typography>

        {cafe?.venmoUsername && (
          <Box sx={{ my: 1 }}>
            <VenmoQR venmoUsername={cafe.venmoUsername} size={100} label="Tip on Venmo" />
          </Box>
        )}

        <Button
          variant="solid"
          color="primary"
          onClick={props.onClose}
          startDecorator={<DoNotDisturbIcon />}
          sx={{ width: '100%' }}
        >
          Close
        </Button>
      </Stack>
    </Snackbar>
  );
}
