'use client';
import { ButtonGroup, Button, Typography, Box } from '@mui/joy';
import TooltipIconButton from '@/components/common/TooltipIconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface QuantityControlProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  size?: 'sm' | 'md';
}

export default function QuantityControl({ value, onChange, min = 1, size = 'md' }: QuantityControlProps) {
  if (size === 'sm') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TooltipIconButton tooltip="Decrease" size="sm" variant="outlined" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
          <RemoveIcon />
        </TooltipIconButton>
        <Typography level="body-sm" sx={{ minWidth: 24, textAlign: 'center' }}>{value}</Typography>
        <TooltipIconButton tooltip="Increase" size="sm" variant="outlined" onClick={() => onChange(value + 1)}>
          <AddIcon />
        </TooltipIconButton>
      </Box>
    );
  }

  return (
    <ButtonGroup>
      <TooltipIconButton tooltip="Decrease" variant="outlined" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        <RemoveIcon />
      </TooltipIconButton>
      <Button variant="outlined" sx={{ px: 3, pointerEvents: 'none' }}>{value}</Button>
      <TooltipIconButton tooltip="Increase" variant="outlined" onClick={() => onChange(value + 1)}>
        <AddIcon />
      </TooltipIconButton>
    </ButtonGroup>
  );
}
