'use client';
import { useState } from 'react';
import { Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, Button, Input, FormControl, FormLabel, Typography } from '@mui/joy';

interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => Promise<void>;
}

export default function AddCategoryModal({ open, onClose, onAdd }: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    const val = name.trim().toLowerCase();
    if (!val) return;
    setError('');
    setLoading(true);
    try {
      await onAdd(val);
      setName('');
    } catch (e: any) {
      setError(e?.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog sx={{ maxWidth: 380, width: '90vw' }}>
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <FormControl>
            <FormLabel>Category name</FormLabel>
            <Input
              autoFocus
              placeholder="e.g. drinks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } }}
            />
            {error && <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{error}</Typography>}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="plain" color="neutral" onClick={handleClose}>Cancel</Button>
          <Button loading={loading} disabled={!name.trim()} onClick={handleSubmit}>Create</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
