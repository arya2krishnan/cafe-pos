'use client';
import * as React from 'react';
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

export default function ItemOptions(props: ItemOptionsProps) {
  const [value, setValue] = React.useState<string[]>(props.value || []);

  const handleChange = (item: string, checked: boolean) => {
    let newValue: string[];
    if (props.isMultiple) {
      newValue = checked ? [...value, item] : value.filter((t) => t !== item);
    } else {
      newValue = checked ? [item] : [];
    }
    setValue(newValue);
    props.onChange(newValue);
  };

  return (
    <Sheet variant="outlined" sx={{ width: '100%', maxWidth: 360, p: 2, borderRadius: 'sm', mx: 'auto' }}>
      <Typography level="body-sm" sx={{ fontWeight: 'lg', mb: 1.5, textAlign: 'left' }}>
        {props.option}
      </Typography>
      <List
        orientation="horizontal"
        wrap
        sx={{ '--List-gap': '8px', '--ListItem-radius': '20px', '--ListItem-minHeight': '32px', '--ListItem-gap': '4px' }}
      >
        {props.options.map((item) => (
          <ListItem key={item}>
            {value.includes(item) && <Done color="primary" sx={{ ml: -0.5, zIndex: 2, pointerEvents: 'none' }} />}
            <Checkbox
              size="sm"
              disableIcon
              overlay
              label={item}
              checked={value.includes(item)}
              variant={value.includes(item) ? 'soft' : 'outlined'}
              onChange={(e) => handleChange(item, e.target.checked)}
              slotProps={{
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
