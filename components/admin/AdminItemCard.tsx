'use client';
import { Card, CardContent, CardOverflow, Typography, Box, Chip, Divider, Button, Switch } from '@mui/joy';
import TooltipIconButton from '@/components/common/TooltipIconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { ItemData } from '@/types';

interface AdminItemCardProps {
  item: ItemData;
  onEdit: () => void;
  onDelete: () => void;
  onToggleSoldOut: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  isArchived?: boolean;
}

export default function AdminItemCard({ item, onEdit, onDelete, onToggleSoldOut, onArchive, onUnarchive, isArchived }: AdminItemCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%', opacity: isArchived ? 0.65 : item.soldOut ? 0.6 : 1 }}>
      {item.imageUrl && (
        <CardOverflow>
          <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
        </CardOverflow>
      )}
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography level="title-md" sx={{ textDecoration: isArchived ? 'line-through' : 'none' }}>{item.name}</Typography>
            {item.description && (
              <Typography level="body-xs" sx={{ mt: 0.5, color: 'text.secondary' }}>{item.description}</Typography>
            )}
          </Box>
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

      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch size="sm" checked={item.soldOut ?? false} onChange={onToggleSoldOut} />
              <Typography level="body-xs">{item.soldOut ? 'Sold out' : 'Available'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <TooltipIconButton tooltip="Edit item" size="sm" variant="plain" color="primary" onClick={onEdit}>
                <EditIcon fontSize="small" />
              </TooltipIconButton>
              <TooltipIconButton tooltip="Archive item" size="sm" variant="plain" color="neutral" onClick={onArchive}>
                <ArchiveIcon fontSize="small" />
              </TooltipIconButton>
              <TooltipIconButton tooltip="Delete item" size="sm" variant="plain" color="danger" onClick={onDelete}>
                <DeleteIcon fontSize="small" />
              </TooltipIconButton>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
