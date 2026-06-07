'use client';
import { Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/joy';
import DeleteIcon from '@mui/icons-material/Delete';

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title: string;
  description: React.ReactNode;
}

export default function DeleteConfirmModal({ open, onClose, onConfirm, loading, title, description }: DeleteConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog variant="outlined" sx={{ maxWidth: 440, width: '90vw' }}>
        <DialogTitle sx={{ color: 'danger.500' }}>
          <DeleteIcon sx={{ mr: 1 }} /> {title}
        </DialogTitle>
        <DialogContent>
          <Typography level="body-md">{description}</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="plain" color="neutral" onClick={onClose}>Cancel</Button>
          <Button variant="solid" color="danger" loading={loading} onClick={onConfirm}>Delete</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
