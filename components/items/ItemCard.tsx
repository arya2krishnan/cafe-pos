'use client';
import AspectRatio from '@mui/joy/AspectRatio';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardOverflow from '@mui/joy/CardOverflow';
import Typography from '@mui/joy/Typography';
import Chip from '@mui/joy/Chip';

interface ItemCardProps {
  url: string;
  title: string;
  description: string;
  onClick: () => void;
  soldOut?: boolean;
}

export default function ItemCard(props: ItemCardProps) {
  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s ease-in-out',
        minHeight: '280px',
        '@media (min-width: 600px)': { minHeight: '320px' },
        '@media (min-width: 900px)': { minHeight: '360px' },
        padding: 0,
        margin: 0,
        ...(props.soldOut ? {} : { '&:hover': { transform: 'scale(1.02)' } }),
      }}
      variant="solid"
      color="neutral"
      invertedColors
    >
      <Box
        onClick={props.soldOut ? undefined : props.onClick}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', cursor: props.soldOut ? 'default' : 'pointer' }}
      >
        <Box sx={{ position: 'relative', margin: 0, padding: 0, overflow: 'hidden' }}>
          <AspectRatio ratio="1/1" sx={{ minWidth: '100%', margin: 0, padding: 0 }}>
            {props.url ? (
              <img
                src={props.url}
                loading="lazy"
                alt={props.title}
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  width: '100%',
                  height: '100%',
                  filter: props.soldOut ? 'grayscale(100%)' : 'none',
                  display: 'block',
                }}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  bgcolor: 'background.level2',
                  filter: props.soldOut ? 'grayscale(100%)' : 'none',
                }}
              >
                <Typography level="h2" sx={{ color: 'text.tertiary' }}>
                  {props.title.charAt(0).toUpperCase()}
                </Typography>
              </Box>
            )}
          </AspectRatio>
          {props.soldOut && (
            <Chip
              size="sm"
              variant="solid"
              color="primary"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                backgroundColor: 'primary.500',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              Sold Out
            </Chip>
          )}
        </Box>
        <CardContent sx={{ flex: 1, p: 1.5, '@media (min-width: 900px)': { p: 2 } }}>
          <Typography level="title-lg" color="neutral" textColor="text.primary" sx={{ fontWeight: 'md' }}>
            {props.title}
          </Typography>
          <Typography level="body-xs">{props.description}</Typography>
        </CardContent>
      </Box>
      <CardOverflow>
        <Button
          variant="solid"
          color="primary"
          size="lg"
          onClick={(e) => { e.stopPropagation(); props.onClick(); }}
          disabled={props.soldOut}
          sx={{ width: '100%' }}
        >
          {props.soldOut ? 'Sold Out' : 'Add to Cart'}
        </Button>
      </CardOverflow>
    </Card>
  );
}
