'use client';
import { useState } from 'react';
import { Box, Button, Input, Typography, Chip, FormLabel } from '@mui/joy';
import TooltipIconButton from '@/components/common/TooltipIconButton';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

interface OptionGroup {
  name: string;
  values: string[];
  isMultiple: boolean;
}

interface OptionGroupBuilderProps {
  options: OptionGroup[];
  onOptionsChange: (options: OptionGroup[]) => void;
}

export default function OptionGroupBuilder({ options, onOptionsChange }: OptionGroupBuilderProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [newOptionValue, setNewOptionValue] = useState<Record<number, string>>({});

  const addGroup = () => {
    if (!newGroupName.trim()) return;
    onOptionsChange([...options, { name: newGroupName.trim(), values: [], isMultiple: false }]);
    setNewGroupName('');
  };

  const addValue = (groupIdx: number) => {
    const val = (newOptionValue[groupIdx] || '').trim();
    if (!val) return;
    onOptionsChange(options.map((g, i) => i === groupIdx ? { ...g, values: [...g.values, val] } : g));
    setNewOptionValue((prev) => ({ ...prev, [groupIdx]: '' }));
  };

  const removeValue = (groupIdx: number, valIdx: number) => {
    onOptionsChange(options.map((g, i) => i === groupIdx ? { ...g, values: g.values.filter((_, vi) => vi !== valIdx) } : g));
  };

  const removeGroup = (groupIdx: number) => {
    onOptionsChange(options.filter((_, i) => i !== groupIdx));
  };

  const toggleMultiple = (groupIdx: number) => {
    onOptionsChange(options.map((g, i) => i === groupIdx ? { ...g, isMultiple: !g.isMultiple } : g));
  };

  return (
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
              <TooltipIconButton tooltip="Remove option group" size="sm" variant="plain" color="danger" onClick={() => removeGroup(gIdx)}>
                <CloseIcon fontSize="small" />
              </TooltipIconButton>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {group.values.map((v, vIdx) => (
              <Chip
                key={vIdx}
                size="sm"
                variant="soft"
                endDecorator={
                  <TooltipIconButton tooltip="Remove value" size="sm" variant="plain" onClick={() => removeValue(gIdx, vIdx)}>
                    <CloseIcon sx={{ fontSize: 12 }} />
                  </TooltipIconButton>
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
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addValue(gIdx); } }}
              sx={{ flex: 1 }}
            />
            <TooltipIconButton tooltip="Add value" size="sm" variant="outlined" onClick={() => addValue(gIdx)}>
              <AddIcon />
            </TooltipIconButton>
          </Box>
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Input
          size="sm"
          placeholder="New option group (e.g. Size)"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGroup(); } }}
          sx={{ flex: 1 }}
        />
        <Button size="sm" variant="outlined" startDecorator={<AddIcon />} onClick={addGroup}>
          Add option
        </Button>
      </Box>
    </Box>
  );
}
