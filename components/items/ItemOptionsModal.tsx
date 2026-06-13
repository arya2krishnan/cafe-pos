'use client';
import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Typography from '@mui/joy/Typography';
import Textarea from '@mui/joy/Textarea';
import ItemOptions, { ItemOptionsProps } from './ItemOptions';
import { Box } from '@mui/joy';
import QuantityControl from '@/components/common/QuantityControl';

interface ItemOptionsModalProps {
  item: string;
  description: string;
  options: (ItemOptionsProps & { defaultValue?: string })[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (selectedValues: Record<string, string[]>, quantity: number, specialRequests?: string) => void;
  imageUrl?: string;
  allowSpecialRequests?: boolean;
}

export default function ItemOptionsModal(props: ItemOptionsModalProps) {
  const [selectedValues, setSelectedValues] = React.useState<Record<string, string[]>>({});
  const [total, setTotal] = React.useState(1);
  const [quantityError, setQuantityError] = React.useState('');
  const [optionError, setOptionError] = React.useState('');
  const [specialRequests, setSpecialRequests] = React.useState('');

  React.useEffect(() => {
    if (props.isOpen) {
      const initial: Record<string, string[]> = {};
      props.options.forEach((opt) => {
        // Only preselect when the admin set an explicit default. Otherwise the
        // option starts unselected and the customer must choose.
        if (opt.options.length > 0 && !opt.isMultiple && opt.defaultValue && opt.options.includes(opt.defaultValue)) {
          initial[opt.option] = [opt.defaultValue];
        }
      });
      setSelectedValues(initial);
      setSpecialRequests('');
      setQuantityError('');
      setOptionError('');
    }
  }, [props.isOpen, props.options]);

  const handleOptionChange = (option: string, value: string[]) => {
    setSelectedValues((prev) => ({ ...prev, [option]: value }));
    setOptionError('');
  };

  const onSubmit = () => {
    if (total <= 0) { setQuantityError('Please select at least 1 item.'); return; }
    setQuantityError('');
    // Every option group must have a selection before adding to cart.
    const missing = props.options.filter(
      (opt) => opt.options.length > 0 && !(selectedValues[opt.option]?.length),
    );
    if (missing.length > 0) {
      setOptionError(`Please choose ${missing.map((o) => o.option).join(', ')} before adding to cart.`);
      return;
    }
    setOptionError('');
    props.onSubmit?.(selectedValues, total, specialRequests.trim() || undefined);
  };

  return (
    <Modal open={props.isOpen} onClose={() => { props.onClose(); setSelectedValues({}); setTotal(1); setSpecialRequests(''); }}>
      <ModalDialog
        sx={(theme) => ({
          width: { xs: '100%', sm: '600px', md: '700px' },
          maxHeight: '90vh',
          overflowX: 'hidden',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          [theme.breakpoints.only('xs')]: {
            // Full-width bottom sheet. Override Joy's default min/max width
            // (min(100vw - 2*Card-padding, 300px)) which otherwise mismatches
            // the viewport and causes a horizontal scroll.
            top: 'unset', bottom: 0, left: 0, right: 0,
            width: '100%', minWidth: 0, maxWidth: '100%', m: 0,
            transform: 'none',
            borderRadius: 0, borderTopLeftRadius: 16, borderTopRightRadius: 16,
            maxHeight: '92vh', p: 2,
          },
        })}
      >
        {/* Single scroll region: image, title, and options all share the same
            width so the option boxes line up exactly with the heading. Only the
            footer is pinned. Thin scrollbar avoids stealing layout width. */}
        <Box
          sx={{
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
            pb: 1,
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-thumb': { borderRadius: '6px', backgroundColor: 'var(--joy-palette-neutral-outlinedBorder)' },
            '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
          }}
        >
          {props.imageUrl && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 1, sm: 2 } }}>
              <Box
                component="img"
                src={props.imageUrl}
                alt={props.item}
                sx={{ width: { xs: 104, sm: 180 }, height: { xs: 104, sm: 180 }, objectFit: 'cover', borderRadius: '8px' }}
              />
            </Box>
          )}

          <Typography level="h4" sx={{ mb: 0.25, textAlign: { xs: 'center', sm: 'left' } }}>{props.item}</Typography>
          {props.description && (
            <Typography level="body-sm" sx={{ mb: { xs: 1.5, sm: 2 }, color: 'text.secondary', textAlign: { xs: 'center', sm: 'left' } }}>{props.description}</Typography>
          )}

          {props.options.map((opt) => (
            <Box key={opt.option} sx={{ mb: 1.5 }}>
              <ItemOptions
                option={opt.option}
                options={opt.options}
                isMultiple={opt.isMultiple}
                value={selectedValues[opt.option]}
                onChange={(value) => handleOptionChange(opt.option, value)}
              />
            </Box>
          ))}

          {props.allowSpecialRequests && (
            <Box sx={{ mt: 1 }}>
              <Textarea
                placeholder="Any special requests?"
                minRows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                sx={{ width: '100%' }}
              />
            </Box>
          )}
        </Box>

        <Box
          sx={{
            pt: 2,
            mt: 'auto',
            borderTop: '1px solid',
            borderColor: 'divider',
            pb: { xs: 'max(0px, env(safe-area-inset-bottom))', sm: 0 },
          }}
        >
          {(optionError || quantityError) && (
            <Typography level="body-xs" color="danger" sx={{ mb: 1 }}>{optionError || quantityError}</Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
            <QuantityControl value={total} onChange={setTotal} />
            <Button variant="solid" color="primary" size="lg" onClick={onSubmit} sx={{ px: { xs: 3, sm: 4 }, flexShrink: 0 }}>
              Add to Cart
            </Button>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
}
