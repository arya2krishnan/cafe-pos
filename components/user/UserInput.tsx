'use client';
import { ModalDialog, Modal, DialogTitle, DialogContent, Stack, FormControl, FormLabel, Input, Button, FormHelperText, Checkbox } from '@mui/joy';
import React, { useState, useEffect } from 'react';
import { useCafe } from '../CafeProvider';

interface UserInputProps {
  isOpen: boolean;
  name: string;
  phone: string;
  onClick: (name: string, phone: string, text: boolean) => void;
  onClose: () => void;
}

export default function UserInput(props: UserInputProps) {
  const { cafe } = useCafe();
  const [name, setName] = useState(props.name || '');
  const [phone, setPhone] = useState(props.phone || '');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [optInText, setOptInText] = useState(false);

  useEffect(() => {
    setName(props.name || '');
    setPhone(props.phone || '');
    if (!props.name && !props.phone) setOptInText(true);
  }, [props.name, props.phone, props.isOpen]);

  const validatePhone = (p: string) =>
    /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(p);

  const formatPhone = (p: string) => {
    const d = p.replace(/\D/g, '');
    return d.startsWith('1') && d.length > 10 ? d.substring(1) : d;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !phone.trim()) {
      setPhoneError('Please provide either your name or phone number');
      return;
    }
    if (phone.trim() && !validatePhone(phone)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    props.onClick(name, phone.trim() ? formatPhone(phone) : '', optInText);
    props.onClose();
  };

  return (
    <Modal open={props.isOpen} onClose={props.onClose}>
      <ModalDialog>
        <DialogTitle>Your information</DialogTitle>
        <DialogContent>Please provide your name and phone number for order notifications.</DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input placeholder="Your Name" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl error={!!phoneError}>
              <FormLabel>Phone Number</FormLabel>
              <Input
                placeholder="(888)-888-8888"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError && validatePhone(e.target.value)) setPhoneError(null);
                }}
              />
              {phoneError && <FormHelperText>{phoneError}</FormHelperText>}
            </FormControl>
            <FormControl>
              <Checkbox
                label={`By checking this box, you agree to receive text messages about your order from ${cafe?.name ?? 'this cafe'}.`}
                checked={optInText}
                onChange={(e) => setOptInText(e.target.checked)}
              />
            </FormControl>
            <Button type="submit">Place Order</Button>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}
