'use client';
import { Box, Chip } from '@mui/joy';

interface OptionChipsProps {
  selectedOptions: Record<string, string[]>;
  size?: 'sm' | 'md';
  color?: 'neutral' | 'primary';
}

export default function OptionChips({ selectedOptions, size = 'sm', color = 'neutral' }: OptionChipsProps) {
  const entries = Object.entries(selectedOptions);
  if (entries.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {entries.flatMap(([name, vals]) =>
        vals.map((v) => (
          <Chip key={`${name}-${v}`} size={size} variant="soft" color={color}>
            {name}: {v}
          </Chip>
        )),
      )}
    </Box>
  );
}
