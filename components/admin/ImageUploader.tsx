'use client';
import { Box, Typography, Stack } from '@mui/joy';
import ImageIcon from '@mui/icons-material/Image';

interface ImageUploaderProps {
  currentImageUrl?: string;
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  height?: number;
}

export default function ImageUploader({ currentImageUrl, preview, onChange, inputRef, height = 160 }: ImageUploaderProps) {
  return (
    <Box
      onClick={() => inputRef.current?.click()}
      sx={{
        border: '2px dashed', borderColor: 'divider', borderRadius: 'md',
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', overflow: 'hidden',
        '&:hover': { borderColor: 'primary.400', bgcolor: 'background.level1' },
      }}
    >
      {preview ? (
        <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : currentImageUrl ? (
        <img src={currentImageUrl} alt="current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <Stack alignItems="center" spacing={0.5}>
          <ImageIcon sx={{ fontSize: height > 140 ? 40 : 32, color: 'text.tertiary' }} />
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Click to upload image</Typography>
        </Stack>
      )}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onChange} />
    </Box>
  );
}
