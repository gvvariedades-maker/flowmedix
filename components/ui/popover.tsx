'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

type PopoverContentProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
  /** `editorial` — vitrine/dashboard claro; evita fundo cyber no portal. */
  variant?: 'default' | 'editorial';
};

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, align = 'start', sideOffset = 6, variant = 'default', ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      data-theme={variant === 'editorial' ? 'editorial' : undefined}
      className={cn(
        'z-50 rounded-xl outline-none',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
        variant === 'editorial'
          ? 'border border-slate-200 bg-white p-2 text-slate-900 shadow-lg'
          : 'border border-white/15 bg-[#0d1117] p-2 text-slate-200 shadow-[0_8px_32px_-4px_rgba(0,242,255,0.08),0_4px_16px_-4px_rgba(0,0,0,0.6)]',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
