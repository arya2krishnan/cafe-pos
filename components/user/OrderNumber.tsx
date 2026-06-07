'use client';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import { VenmoQR } from '../VenmoQR';
import { useCafe } from '../CafeProvider';

interface OrderNumberProps {
  open: boolean;
  onClose: () => void;
  name: string;
  orderNumber: number;
}

export default function OrderNumber({ open, onClose, name, orderNumber }: OrderNumberProps) {
  const { cafe } = useCafe();

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        variant="outlined"
        sx={{
          maxWidth: 400,
          width: '90vw',
          textAlign: 'center',
          p: 4,
          gap: 2,
        }}
      >
        <Typography level="h2" sx={{ fontWeight: 'bold' }}>
          You are Order No. {orderNumber}
        </Typography>

        <Typography level="body-lg" sx={{ color: 'text.secondary' }}>
          Thank you for your order, {name}!
        </Typography>

        {cafe?.venmoUsername && (
          <>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <VenmoQR venmoUsername={cafe.venmoUsername} size={140} label="Tip on Venmo" />
            </Box>
            <Divider />
          </>
        )}

        <Button variant="solid" color="neutral" size="lg" onClick={onClose} sx={{ mt: 1 }}>
          Close
        </Button>
      </ModalDialog>
    </Modal>
  );
}
