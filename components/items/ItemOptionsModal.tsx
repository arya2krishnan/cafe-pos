'use client';
import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Typography from '@mui/joy/Typography';
import ItemOptions, { ItemOptionsProps } from './ItemOptions';
import { ButtonGroup, IconButton, Stack, Box } from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface ItemOptionsModalProps {
  item: string;
  description: string;
  options: ItemOptionsProps[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (selectedValues: Record<string, string[]>, quantity: number) => void;
  imageUrl?: string;
}

export default function ItemOptionsModal(props: ItemOptionsModalProps) {
  const [selectedValues, setSelectedValues] = React.useState<Record<string, string[]>>({});
  const [total, setTotal] = React.useState(1);

  React.useEffect(() => {
    if (props.isOpen && props.options.length > 0) {
      const initial: Record<string, string[]> = {};
      props.options.forEach((opt) => {
        if (opt.options.length > 0) {
          initial[opt.option] = opt.isMultiple ? [] : [opt.options[0]];
        }
      });
      setSelectedValues(initial);
    }
  }, [props.isOpen, props.options]);

  const handleOptionChange = (option: string, value: string[]) => {
    setSelectedValues((prev) => ({ ...prev, [option]: value }));
  };

  const onSubmit = () => {
    if (total <= 0) { alert('Please select at least 1 item'); return; }
    props.onSubmit?.(selectedValues, total);
  };

  return (
    <Modal open={props.isOpen} onClose={() => { props.onClose(); setSelectedValues({}); setTotal(1); }}>
      <ModalDialog
        sx={(theme) => ({
          width: { xs: '95vw', sm: '600px', md: '700px' },
          maxHeight: '90vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          [theme.breakpoints.only('xs')]: {
            top: 'unset', bottom: 0, left: 0, right: 0, borderRadius: 0, transform: 'none', width: '100%', maxHeight: '95vh',
          },
        })}
      >
        {props.imageUrl && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <img
              src={props.imageUrl}
              alt={props.item}
              style={{ width: '180px', height: '180px', objectFit: 'cover', borderRadius: '8px' }}
            />
          </Box>
        )}

        <Typography level="h4" sx={{ mb: 1 }}>{props.item}</Typography>
        {props.description && (
          <Typography level="body-sm" sx={{ mb: 2, color: 'text.secondary' }}>{props.description}</Typography>
        )}

        <Box sx={{ overflow: 'auto', flex: 1, pb: 2 }}>
          {props.options.map((opt) => (
            <Box key={opt.option} sx={{ mb: 2 }}>
              <ItemOptions
                option={opt.option}
                options={opt.options}
                isMultiple={opt.isMultiple}
                value={selectedValues[opt.option]}
                onChange={(value) => handleOptionChange(opt.option, value)}
              />
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <ButtonGroup>
            <IconButton variant="outlined" onClick={() => setTotal((t) => Math.max(1, t - 1))} disabled={total <= 1}>
              <RemoveIcon />
            </IconButton>
            <Button variant="outlined" sx={{ px: 3, pointerEvents: 'none' }}>{total}</Button>
            <IconButton variant="outlined" onClick={() => setTotal((t) => t + 1)}>
              <AddIcon />
            </IconButton>
          </ButtonGroup>
          <Button variant="solid" color="primary" onClick={onSubmit} sx={{ px: 4 }}>
            Add to Cart
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
}
