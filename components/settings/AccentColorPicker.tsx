'use client';
import { Box, Button, Input } from '@mui/joy';

const PRESETS = ['#0B6BCB', '#1B7D3A', '#C41C1C', '#7B1FA2', '#E65C00', '#00838F', '#37474F'];

interface AccentColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function AccentColorPicker({ value, onChange }: AccentColorPickerProps) {
  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {PRESETS.map((preset) => (
          <Box
            key={preset}
            onClick={() => onChange(preset)}
            sx={{
              width: 36, height: 36, borderRadius: '50%', bgcolor: preset, cursor: 'pointer',
              border: value === preset ? '3px solid white' : '3px solid transparent',
              boxShadow: value === preset ? `0 0 0 2px ${preset}` : 'none',
              transition: 'all 0.15s',
              '&:hover': { transform: 'scale(1.15)' },
            }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          component="input"
          type="color"
          value={value || '#0B6BCB'}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          style={{ width: 40, height: 40, padding: 2, border: '1px solid', borderColor: 'var(--joy-palette-divider)', borderRadius: 8, cursor: 'pointer', background: 'none' }}
        />
        <Input
          placeholder="#0B6BCB"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          startDecorator={
            value ? (
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: value, border: '1px solid', borderColor: 'divider' }} />
            ) : null
          }
          sx={{ flex: 1, fontFamily: 'monospace' }}
        />
        {value && (
          <Button size="sm" variant="plain" color="neutral" onClick={() => onChange('')}>Reset</Button>
        )}
      </Box>
    </>
  );
}
