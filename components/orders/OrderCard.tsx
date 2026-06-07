'use client';
import { Card, Typography, Box, Divider, List, ListItem, ListItemContent, Chip, Stack, Button, IconButton } from '@mui/joy';
import DeleteIcon from '@mui/icons-material/Delete';
import { OrderData } from '@/types';

interface OrderCardProps {
  order: OrderData;
  onComplete: (orderId: string) => void;
  onDelete: (id: string, orderNumber: number) => void;
}

export default function OrderCard({ order, onComplete, onDelete }: OrderCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', borderRadius: 'md', boxShadow: 'sm', overflow: 'hidden', minWidth: '280px' }}
    >
      <Box sx={{ bgcolor: 'neutral.solidBg', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography level="h2" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
          Order #{order.orderNumber}
        </Typography>
        <IconButton
          variant="plain"
          color="danger"
          size="sm"
          onClick={() => onDelete(String(order.id || order.orderNumber), order.orderNumber)}
        >
          <DeleteIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, flexGrow: 1 }}>
        <Typography level="body-sm" sx={{ mb: 2, color: 'text.secondary' }}>
          {new Date(order.orderDate).toLocaleString()}
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Typography level="title-md" sx={{ mt: 1, fontWeight: 600 }}>{order.customerName}</Typography>
        <Typography level="body-sm" sx={{ mb: 2 }}>
          {order.textOptIn ? `SMS: Yes (${order.customerPhone})` : 'SMS: No'}
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ mb: 2 }}>
          <Typography level="title-md" sx={{ mb: 1, fontWeight: 600 }}>Items:</Typography>
          <List sx={{ '--ListItem-paddingY': '4px', '--ListItem-paddingX': '0px' }}>
            {order.items.map((item, index) => (
              <ListItem key={index} sx={{ alignItems: 'flex-start' }}>
                <ListItemContent>
                  <Typography sx={{ fontWeight: 500 }}>
                    {item.quantity}x {item.item.name}
                  </Typography>
                  {Object.entries(item.selectedOptions).length > 0 && (
                    <Box sx={{ mt: 0.5 }}>
                      {Object.entries(item.selectedOptions).map(([optionName, values]) => (
                        <Stack key={optionName} direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', mt: 0.5 }}>
                          {values.map((value) => (
                            <Chip key={value} size="sm" variant="soft" color="primary" sx={{ mb: 0.5 }}>
                              {optionName}: {value}
                            </Chip>
                          ))}
                        </Stack>
                      ))}
                    </Box>
                  )}
                </ListItemContent>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <Box sx={{ p: 2, bgcolor: 'background.level1', mt: 'auto' }}>
        <Divider sx={{ mb: 2 }} />
        <Button
          fullWidth
          color="success"
          size="lg"
          onClick={() => onComplete(String(order.id || order.orderNumber))}
          sx={{ fontWeight: 600, py: 1.5, fontSize: '1rem' }}
        >
          Complete Order
        </Button>
      </Box>
    </Card>
  );
}
