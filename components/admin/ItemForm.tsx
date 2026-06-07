'use client';
import { useState } from 'react';
import {
  Button, FormControl, FormLabel, Input, Textarea,
  Stack, Modal, ModalDialog, DialogTitle, Divider, Box,
} from '@mui/joy';
import { ItemData, CategoryData } from '@/types';
import { useLogoUpload } from '@/hooks/useLogoUpload';
import ImageUploader from './ImageUploader';
import OptionGroupBuilder from './OptionGroupBuilder';
import CategorySelector from './CategorySelector';

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
  categories?: CategoryData[];
  preselectedCategory?: string;
  slug: string;
  getIdToken: () => Promise<string | null>;
  onCategoryCreated?: (name: string) => void;
}

export default function ItemForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories = [],
  preselectedCategory,
  slug,
  getIdToken,
  onCategoryCreated,
}: ItemFormProps) {
  const categoryNames = categories.map((c) => c.name);
  const defaultCategory = initialData?.category ?? preselectedCategory ?? categoryNames[0] ?? '';

  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [category, setCategory] = useState(defaultCategory);
  const [options, setOptions] = useState<OptionGroup[]>(
    (initialData?.options as any[])?.map((o) => ({ name: o.name, values: o.values, isMultiple: o.isMultiple })) ?? [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const image = useLogoUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      await onSubmit(
        { name: name.trim(), description: description.trim(), category: category || 'misc', options: options as any },
        image.file ?? undefined,
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
            <ImageUploader
              currentImageUrl={initialData?.imageUrl}
              preview={image.preview}
              onChange={image.handleChange}
              inputRef={image.inputRef}
            />

            <FormControl required>
              <FormLabel>Item name</FormLabel>
              <Input placeholder="e.g. Oat Milk Latte" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </FormControl>

            <FormControl>
              <FormLabel>Description (optional)</FormLabel>
              <Textarea minRows={2} placeholder="What&apos;s in it?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormControl>

            <CategorySelector
              value={category}
              onChange={setCategory}
              categories={categoryNames}
              onCategoryCreated={(n) => onCategoryCreated?.(n)}
              slug={slug}
              getIdToken={getIdToken}
            />

            <OptionGroupBuilder options={options} onOptionsChange={setOptions} />

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
