'use client';
import * as React from 'react';
import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Chip from '@mui/joy/Chip';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import { CartItem } from '@/types';

interface CartButtonProps {
  items: CartItem[];
  totalPrice: number;
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
            <IconButton variant="plain" onClick={() => setOpen(false)}><CloseIcon /></IconButton>
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
                        <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                          ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                        </Typography>
                        {Object.entries(cartItem.selectedOptions).length > 0 && (
                          <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {Object.entries(cartItem.selectedOptions).flatMap(([name, vals]) =>
                              vals.map((v) => (
                                <Chip key={`${name}-${v}`} size="sm" variant="soft">{name}: {v}</Chip>
                              )),
                            )}
                          </Box>
                        )}
                      </Box>
                      <IconButton size="sm" variant="plain" color="danger" onClick={() => props.onRemove(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    {props.onQuantityChange && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <IconButton
                          size="sm" variant="outlined"
                          onClick={() => props.onQuantityChange!(index, Math.max(1, cartItem.quantity - 1))}
                          disabled={cartItem.quantity <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography level="body-sm" sx={{ minWidth: 24, textAlign: 'center' }}>{cartItem.quantity}</Typography>
                        <IconButton size="sm" variant="outlined" onClick={() => props.onQuantityChange!(index, cartItem.quantity + 1)}>
                          <AddIcon />
                        </IconButton>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography level="title-lg">Total</Typography>
                <Typography level="title-lg">${props.totalPrice.toFixed(2)}</Typography>
              </Box>
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
