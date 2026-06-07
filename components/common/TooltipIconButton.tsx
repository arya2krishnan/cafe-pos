'use client';
import { forwardRef } from 'react';
import { IconButton, Tooltip } from '@mui/joy';
import type { IconButtonProps } from '@mui/joy';

interface TooltipIconButtonProps extends IconButtonProps {
  tooltip: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
}

const TooltipIconButton = forwardRef<HTMLButtonElement, TooltipIconButtonProps>(
  ({ tooltip, placement = 'top', ...props }, ref) => (
    <Tooltip title={tooltip} placement={placement} arrow>
      <IconButton ref={ref} {...props} />
    </Tooltip>
  ),
);

TooltipIconButton.displayName = 'TooltipIconButton';
export default TooltipIconButton;
