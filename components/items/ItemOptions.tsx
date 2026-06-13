'use client';
import Checkbox from '@mui/joy/Checkbox';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import Done from '@mui/icons-material/Done';

export interface ItemOptionsProps {
  option: string;
  options: string[];
  isMultiple?: boolean;
  value?: string[];
  onChange: (value: string[]) => void;
}

// Controlled: selection state is owned by the parent (ItemOptionsModal).
export default function ItemOptions(props: ItemOptionsProps) {
  const value = props.value ?? [];

  const handleChange = (item: string, checked: boolean) => {
    let newValue: string[];
    if (props.isMultiple) {
      newValue = checked ? [...value, item] : value.filter((t) => t !== item);
    } else {
      newValue = checked ? [item] : [];
    }
    props.onChange(newValue);
  };

  return (
    <Sheet variant="outlined" sx={{ width: '100%', boxSizing: 'border-box', p: 1.5, borderRadius: 'sm' }}>
      <Typography level="body-sm" sx={{ fontWeight: 'lg', mb: 1, textAlign: 'left' }}>
        {props.option}
      </Typography>
      <List
        orientation="horizontal"
        wrap
        sx={{
          // Joy's wrap mode implements gaps with negative margins on the List
          // (marginInlineStart: calc(-1 * var(--List-gap))), which overflows the
          // bordered Sheet on the right. Zero that out and use a real flex gap so
          // the box stays exactly within its width.
          '--List-gap': '0px',
          gap: 1.25,
          '--ListItem-radius': '22px',
          '--ListItem-minHeight': '40px',
          '--ListItem-gap': '6px',
          '--ListItem-paddingX': '14px',
          p: 0,
          m: 0,
        }}
      >
        {props.options.map((item) => (
          <ListItem key={item} sx={{ maxWidth: '100%', minWidth: 0 }}>
            {value.includes(item) && <Done sx={{ ml: -0.5, zIndex: 2, pointerEvents: 'none', color: 'var(--joy-palette-primary-500)' }} />}
            <Checkbox
              size="md"
              disableIcon
              overlay
              label={item}
              checked={value.includes(item)}
              variant={value.includes(item) ? 'soft' : 'outlined'}
              onChange={(e) => handleChange(item, e.target.checked)}
              slotProps={{
                label: { sx: { whiteSpace: 'normal', wordBreak: 'break-word' } },
                action: ({ checked }) => ({
                  sx: checked ? { border: '1px solid', borderColor: 'primary.500' } : {},
                }),
              }}
            />
          </ListItem>
        ))}
      </List>
    </Sheet>
  );
}
