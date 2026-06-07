'use client';
import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Typography from '@mui/joy/Typography';
import ItemOptions, { ItemOptionsProps } from './ItemOptions';
import { Box } from '@mui/joy';
import QuantityControl from '@/components/common/QuantityControl';

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
  const [quantityError, setQuantityError] = React.useState('');

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
    if (total <= 0) { setQuantityError('Please select at least 1 item.'); return; }
    setQuantityError('');
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

        <Box sx={{ mt: 2 }}>
          {quantityError && (
            <Typography level="body-xs" color="danger" sx={{ mb: 1 }}>{quantityError}</Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <QuantityControl value={total} onChange={setTotal} />
            <Button variant="solid" color="primary" onClick={onSubmit} sx={{ px: 4 }}>
              Add to Cart
            </Button>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
}
