'use client';
import * as React from 'react';
import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import TooltipIconButton from '@/components/common/TooltipIconButton';
import QuantityControl from '@/components/common/QuantityControl';
import OptionChips from '@/components/common/OptionChips';
import { CartItem } from '@/types';

interface CartButtonProps {
  items: CartItem[];
  onClick: () => void;
  onRemove: (index: number) => void;
  onDestroy: () => void;
  onQuantityChange?: (index: number, quantity: number) => void;
}

export default function CartButton(props: CartButtonProps) {
  const [open, setOpen] = React.useState(false);
  const count = props.items.length;

  return (
    <Box>
      <Button variant="soft" color="neutral" size="lg" onClick={() => setOpen(true)} startDecorator={<ShoppingCartIcon />}>
        {count > 0 ? `Cart (${count})` : 'Cart'}
      </Button>

      <Drawer
        anchor="right"
        size="md"
        variant="plain"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ content: { sx: { bgcolor: 'background.body', p: 0, width: { xs: '100%', sm: 400 } } } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography level="h4">Your Cart</Typography>
            <TooltipIconButton tooltip="Close cart" placement="left" variant="plain" onClick={() => setOpen(false)}>
              <CloseIcon />
            </TooltipIconButton>
          </Box>

          {/* Items */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {count === 0 ? (
              <Typography level="body-md" sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
                Your cart is empty
              </Typography>
            ) : (
              <Stack spacing={2}>
                {props.items.map((cartItem, index) => (
                  <Box key={cartItem.id} sx={{ p: 1.5, bgcolor: 'background.level1', borderRadius: 'md' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography level="title-sm">{cartItem.item.name}</Typography>
                        <OptionChips selectedOptions={cartItem.selectedOptions} />
                      </Box>
                      <TooltipIconButton tooltip="Remove" size="sm" variant="plain" color="danger" onClick={() => props.onRemove(index)}>
                        <DeleteIcon />
                      </TooltipIconButton>
                    </Box>
                    {props.onQuantityChange && (
                      <Box sx={{ mt: 1 }}>
                        <QuantityControl
                          size="sm"
                          value={cartItem.quantity}
                          onChange={(v) => props.onQuantityChange!(index, v)}
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* Footer */}
          {count > 0 && (
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={1}>
                <Button fullWidth size="lg" color="primary" onClick={() => { setOpen(false); props.onClick(); }}>
                  Checkout
                </Button>
                <Button fullWidth size="sm" variant="soft" color="danger" onClick={props.onDestroy}>
                  Clear Cart
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
