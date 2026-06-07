'use client';
import { useState, useRef } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, Textarea, Typography, IconButton,
  Stack, Chip, Modal, ModalDialog, DialogTitle, Divider,
} from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import { ItemData } from '@/types';

const CATEGORIES = [
  { key: 'sp', label: 'Specialty Coffee' },
  { key: 't', label: 'Specialty Tea' },
  { key: 'st', label: 'Standard' },
  { key: 'e', label: 'Espresso' },
  { key: 'cb', label: 'Cold Brew' },
  { key: 'm', label: 'Matcha' },
  { key: 'misc', label: 'Misc.' },
];

interface OptionGroup {
  name: string;
  values: string[];
  isMultiple: boolean;
}

interface ItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ItemData>, imageFile?: File) => Promise<void>;
  initialData?: Partial<ItemData>;
}

export default function ItemForm({ isOpen, onClose, onSubmit, initialData }: ItemFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [price, setPrice] = useState(initialData?.price?.toString() ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [category, setCategory] = useState(initialData?.category ?? 'misc');
  const [options, setOptions] = useState<OptionGroup[]>(
    (initialData?.options as any[])?.map((o) => ({ name: o.name, values: o.values, isMultiple: o.isMultiple })) ?? [],
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValue, setNewOptionValue] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addOptionGroup = () => {
    if (!newOptionName.trim()) return;
    setOptions((prev) => [...prev, { name: newOptionName.trim(), values: [], isMultiple: false }]);
    setNewOptionName('');
  };

  const addOptionValue = (groupIdx: number) => {
    const val = (newOptionValue[groupIdx] || '').trim();
    if (!val) return;
    setOptions((prev) => prev.map((g, i) => i === groupIdx ? { ...g, values: [...g.values, val] } : g));
    setNewOptionValue((prev) => ({ ...prev, [groupIdx]: '' }));
  };

  const removeOptionValue = (groupIdx: number, valIdx: number) => {
    setOptions((prev) => prev.map((g, i) => i === groupIdx ? { ...g, values: g.values.filter((_, vi) => vi !== valIdx) } : g));
  };

  const removeOptionGroup = (groupIdx: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== groupIdx));
  };

  const toggleMultiple = (groupIdx: number) => {
    setOptions((prev) => prev.map((g, i) => i === groupIdx ? { ...g, isMultiple: !g.isMultiple } : g));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setIsLoading(true);
    try {
      await onSubmit(
        { name: name.trim(), price: parseFloat(price), description: description.trim(), category, options: options as any },
        imageFile ?? undefined,
      );
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalDialog sx={{ width: { xs: '95vw', sm: '560px' }, maxHeight: '90vh', overflow: 'auto' }}>
        <DialogTitle>{initialData ? 'Edit Item' : 'New Item'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            {/* Image drop zone */}
            <Box
              onClick={() => fileRef.current?.click()}
              sx={{
                border: '2px dashed', borderColor: 'divider', borderRadius: 'md',
                height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden', position: 'relative',
                '&:hover': { borderColor: 'primary.400', bgcolor: 'background.level1' },
              }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Stack alignItems="center" spacing={0.5}>
                  <ImageIcon sx={{ fontSize: 40, color: 'text.tertiary' }} />
                  <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Click to upload image</Typography>
                </Stack>
              )}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Box>

            {/* Name */}
            <FormControl required>
              <FormLabel>Item name</FormLabel>
              <Input placeholder="e.g. Oat Milk Latte" value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>

            {/* Price */}
            <FormControl required>
              <FormLabel>Price</FormLabel>
              <Input
                type="number"
                placeholder="0.00"
                startDecorator="$"
                slotProps={{ input: { step: '0.01', min: '0' } }}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </FormControl>

            {/* Description */}
            <FormControl>
              <FormLabel>Description (optional)</FormLabel>
              <Textarea minRows={2} placeholder="What's in it?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormControl>

            {/* Category */}
            <FormControl>
              <FormLabel>Category</FormLabel>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                {CATEGORIES.map((cat) => (
                  <Chip
                    key={cat.key}
                    variant={category === cat.key ? 'solid' : 'outlined'}
                    color={category === cat.key ? 'primary' : 'neutral'}
                    onClick={() => setCategory(cat.key)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {cat.label}
                  </Chip>
                ))}
              </Box>
            </FormControl>

            {/* Options builder */}
            <Box>
              <FormLabel sx={{ mb: 1 }}>Options (e.g. Size, Milk type)</FormLabel>

              {options.map((group, gIdx) => (
                <Box key={gIdx} sx={{ mb: 2, p: 1.5, bgcolor: 'background.level1', borderRadius: 'md' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography level="title-sm">{group.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Chip
                        size="sm"
                        variant={group.isMultiple ? 'solid' : 'outlined'}
                        color="neutral"
                        onClick={() => toggleMultiple(gIdx)}
                        sx={{ cursor: 'pointer' }}
                      >
                        {group.isMultiple ? 'Multi-select' : 'Single-select'}
                      </Chip>
                      <IconButton size="sm" variant="plain" color="danger" onClick={() => removeOptionGroup(gIdx)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {group.values.map((v, vIdx) => (
                      <Chip
                        key={vIdx}
                        size="sm"
                        variant="soft"
                        endDecorator={
                          <IconButton size="sm" variant="plain" onClick={() => removeOptionValue(gIdx, vIdx)}>
                            <CloseIcon sx={{ fontSize: 12 }} />
                          </IconButton>
                        }
                      >
                        {v}
                      </Chip>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Input
                      size="sm"
                      placeholder="Add value (e.g. Small)"
                      value={newOptionValue[gIdx] || ''}
                      onChange={(e) => setNewOptionValue((prev) => ({ ...prev, [gIdx]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOptionValue(gIdx); } }}
                      sx={{ flex: 1 }}
                    />
                    <IconButton size="sm" variant="outlined" onClick={() => addOptionValue(gIdx)}>
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Input
                  size="sm"
                  placeholder="New option group (e.g. Size)"
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOptionGroup(); } }}
                  sx={{ flex: 1 }}
                />
                <Button size="sm" variant="outlined" startDecorator={<AddIcon />} onClick={addOptionGroup}>
                  Add option
                </Button>
              </Box>
            </Box>

            <Divider />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="plain" color="neutral" onClick={onClose}>Cancel</Button>
              <Button type="submit" loading={isLoading}>
                {initialData ? 'Save Changes' : 'Create Item'}
              </Button>
            </Box>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}
