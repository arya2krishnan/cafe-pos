'use client';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import AddIcon from '@mui/icons-material/Add';
import type { SxProps } from '@mui/joy/styles/types';

interface ItemRowProps {
  url: string;
  title: string;
  description: string;
  onClick: () => void;
  soldOut?: boolean;
  sx?: SxProps;
}

// Compact list row used on mobile (xs/sm). Desktop uses ItemCard.
export default function ItemRow(props: ItemRowProps) {
  return (
    <Card
      orientation="horizontal"
      variant="outlined"
      onClick={props.soldOut ? undefined : props.onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1,
        width: '100%',
        cursor: props.soldOut ? 'default' : 'pointer',
        ...props.sx,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 72,
          height: 72,
          flexShrink: 0,
          borderRadius: 'sm',
          overflow: 'hidden',
          bgcolor: 'background.level2',
        }}
      >
        {props.url ? (
          <img
            src={props.url}
            loading="lazy"
            alt={props.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: props.soldOut ? 'grayscale(100%)' : 'none',
              display: 'block',
            }}
          />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <Typography level="h4" sx={{ color: 'text.tertiary' }}>
              {props.title.charAt(0).toUpperCase()}
            </Typography>
          </Box>
        )}
        {props.soldOut && (
          <Chip
            size="sm"
            variant="solid"
            color="primary"
            sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold' }}
          >
            Sold Out
          </Chip>
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography level="title-sm" sx={{ fontWeight: 'lg' }} noWrap>
          {props.title}
        </Typography>
        {props.description && (
          <Typography
            level="body-xs"
            sx={{
              color: 'text.secondary',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {props.description}
          </Typography>
        )}
      </Box>

      <IconButton
        variant="solid"
        color="primary"
        size="sm"
        disabled={props.soldOut}
        onClick={(e) => { e.stopPropagation(); props.onClick(); }}
        aria-label={`Add ${props.title}`}
        sx={{ flexShrink: 0, borderRadius: '50%' }}
      >
        <AddIcon />
      </IconButton>
    </Card>
  );
}
