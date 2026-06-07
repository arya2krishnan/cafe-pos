'use client';
import { Box, Typography, FormControl, FormLabel, Textarea } from '@mui/joy';

const STANDARD_MSG = (cafeName: string) =>
  `${cafeName}:\nHello [name]! Your order [number] is ready!\nHead to the counter to pick it up!`;

interface SmsPreviewProps {
  cafeName: string;
  value: string;
  onChange: (v: string) => void;
  charsLeft: number;
  maxLength: number;
}

export default function SmsPreview({ cafeName, value, onChange, charsLeft, maxLength }: SmsPreviewProps) {
  return (
    <>
      <Box sx={{ p: 1.5, bgcolor: 'background.level2', borderRadius: 'sm', mb: 2, fontFamily: 'monospace' }}>
        <Typography level="body-xs" sx={{ whiteSpace: 'pre-line', color: 'text.secondary' }}>
          {STANDARD_MSG(cafeName || 'Your Cafe')}
          {value && `\n\n${value}`}
        </Typography>
      </Box>

      <FormControl>
        <FormLabel>Custom addition (optional)</FormLabel>
        <Textarea
          minRows={3}
          maxRows={6}
          placeholder={`e.g. "Thanks for coming out! See you next time ☕"`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          slotProps={{ textarea: { maxLength } }}
        />
        <Typography
          level="body-xs"
          sx={{ textAlign: 'right', mt: 0.5, color: charsLeft < 50 ? 'warning.500' : 'text.tertiary' }}
        >
          {charsLeft} characters left
        </Typography>
      </FormControl>
    </>
  );
}
