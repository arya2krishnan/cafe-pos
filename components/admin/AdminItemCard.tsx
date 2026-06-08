'use client';
import { useState } from 'react';
import { Card, CardContent, CardOverflow, Typography, Box, Chip, Divider, Button, Switch, Input, Textarea } from '@mui/joy';
import TooltipIconButton from '@/components/common/TooltipIconButton';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { ItemData } from '@/types';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

interface AdminItemCardProps {
  item: ItemData;
  onEdit: () => void;
  onDelete: () => void;
  onToggleSoldOut: () => void;
  onSaveInline?: (updates: { name?: string; description?: string }) => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  isArchived?: boolean;
  dragListeners?: SyntheticListenerMap;
  dragAttributes?: Record<string, any>;
}

export default function AdminItemCard({
  item, onEdit, onDelete, onToggleSoldOut, onSaveInline, onArchive, onUnarchive, isArchived,
  dragListeners, dragAttributes,
}: AdminItemCardProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(item.name);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(item.description ?? '');

  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== item.name) onSaveInline?.({ name: trimmed });
    else setNameDraft(item.name);
    setEditingName(false);
  };

  const saveDesc = () => {
    const trimmed = descDraft.trim();
    if (trimmed !== (item.description ?? '')) onSaveInline?.({ description: trimmed });
    setEditingDesc(false);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        opacity: isArchived ? 0.65 : item.soldOut ? 0.6 : 1,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {item.imageUrl && (
        <CardOverflow>
          <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
        </CardOverflow>
      )}
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {editingName ? (
              <Input
                size="sm"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveName(); } if (e.key === 'Escape') { setNameDraft(item.name); setEditingName(false); } }}
                autoFocus
                sx={{ fontWeight: 'bold', mb: 0.25 }}
              />
            ) : (
              <Typography
                level="title-sm"
                onClick={() => { if (!isArchived && onSaveInline) { setNameDraft(item.name); setEditingName(true); } }}
                sx={{
                  textDecoration: isArchived ? 'line-through' : 'none',
                  wordBreak: 'break-word',
                  cursor: onSaveInline && !isArchived ? 'text' : 'default',
                  '&:hover': onSaveInline && !isArchived ? { color: 'text.primary' } : {},
                }}
              >
                {item.name}
              </Typography>
            )}

            {editingDesc ? (
              <Textarea
                size="sm"
                minRows={1}
                value={descDraft}
                onChange={(e) => setDescDraft(e.target.value)}
                onBlur={saveDesc}
                onKeyDown={(e) => { if (e.key === 'Escape') { setDescDraft(item.description ?? ''); setEditingDesc(false); } }}
                autoFocus
                sx={{ mt: 0.25, fontSize: 'xs' }}
              />
            ) : (
              <Typography
                level="body-xs"
                onClick={() => { if (!isArchived && onSaveInline) { setDescDraft(item.description ?? ''); setEditingDesc(true); } }}
                sx={{
                  mt: 0.25, color: 'text.secondary', wordBreak: 'break-word',
                  cursor: onSaveInline && !isArchived ? 'text' : 'default',
                  minHeight: '1em',
                  '&:hover': onSaveInline && !isArchived ? { color: 'text.secondary' } : {},
                }}
              >
                {item.description || (onSaveInline && !isArchived ? <span style={{ opacity: 0.35 }}>Add description…</span> : null)}
              </Typography>
            )}
          </Box>
          {dragListeners && (
            <Box
              {...dragAttributes}
              {...dragListeners}
              sx={{ cursor: 'grab', color: 'text.tertiary', flexShrink: 0, mt: 0.25, touchAction: 'none', '&:hover': { color: 'text.primary' } }}
            >
              <DragIndicatorIcon sx={{ fontSize: 18 }} />
            </Box>
          )}
        </Box>

        {Array.isArray(item.options) && item.options.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(item.options as any[]).map((opt: any) => (
              <Chip key={opt.name} size="sm" variant="soft">{opt.name}</Chip>
            ))}
          </Box>
        )}
      </CardContent>

      <Divider />

      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, px: 1.5 }}>
        {isArchived ? (
          <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
            <Button size="sm" variant="soft" color="success" startDecorator={<UnarchiveIcon />} onClick={onUnarchive}>
              Unarchive
            </Button>
            <TooltipIconButton tooltip="Delete item" size="sm" variant="plain" color="danger" onClick={onDelete}>
              <DeleteIcon fontSize="small" />
            </TooltipIconButton>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Switch size="sm" checked={item.soldOut ?? false} onChange={onToggleSoldOut} />
              <Typography level="body-xs" sx={{ color: item.soldOut ? 'danger.400' : 'success.500' }}>
                {item.soldOut ? 'Sold out' : 'Available'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.25 }}>
              <TooltipIconButton tooltip="Edit item" size="sm" variant="plain" color="primary" onClick={onEdit}>
                <EditIcon sx={{ fontSize: 17 }} />
              </TooltipIconButton>
              <TooltipIconButton tooltip="Archive item" size="sm" variant="plain" color="neutral" onClick={onArchive}>
                <ArchiveIcon sx={{ fontSize: 17 }} />
              </TooltipIconButton>
              <TooltipIconButton tooltip="Delete item" size="sm" variant="plain" color="danger" onClick={onDelete}>
                <DeleteIcon sx={{ fontSize: 17 }} />
              </TooltipIconButton>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
