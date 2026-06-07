'use client';
import { useState } from 'react';
import { Box, Chip, Input, Typography, FormControl, FormLabel } from '@mui/joy';
import TooltipIconButton from '@/components/common/TooltipIconButton';
import AddIcon from '@mui/icons-material/Add';
import { createApiService } from '@/lib/api-client';

interface CategorySelectorProps {
  value: string;
  onChange: (cat: string) => void;
  categories: string[];
  onCategoryCreated: (name: string) => void;
  slug: string;
  getIdToken: () => Promise<string | null>;
}

export default function CategorySelector({ value, onChange, categories, onCategoryCreated, slug, getIdToken }: CategorySelectorProps) {
  const api = createApiService(slug, getIdToken);
  const [localCategories, setLocalCategories] = useState<string[]>(categories);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addCategory = async () => {
    const val = inputVal.trim().toLowerCase();
    if (!val) return;
    setError('');

    if (localCategories.includes(val)) {
      onChange(val);
      setInputVal('');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createCategory(val);
      if (res.success || res.error?.includes('already exists')) {
        setLocalCategories((prev) => [...prev, val]);
        onChange(val);
        setInputVal('');
        onCategoryCreated(val);
      } else {
        setError(res.error || 'Failed to create category');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormControl>
      <FormLabel>Category</FormLabel>
      {localCategories.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1, mt: 0.5 }}>
          {localCategories.map((cat) => (
            <Chip
              key={cat}
              variant={value === cat ? 'solid' : 'outlined'}
              color={value === cat ? 'primary' : 'neutral'}
              onClick={() => onChange(cat)}
              sx={{ cursor: 'pointer', textTransform: 'capitalize' }}
            >
              {cat}
            </Chip>
          ))}
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Input
          size="sm"
          placeholder={localCategories.length === 0 ? 'Type a category name...' : 'New category...'}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
          sx={{ flex: 1 }}
        />
        <TooltipIconButton tooltip="Add category" size="sm" variant="outlined" onClick={addCategory} disabled={!inputVal.trim() || loading}>
          <AddIcon />
        </TooltipIconButton>
      </Box>
      {error && <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{error}</Typography>}
    </FormControl>
  );
}
