import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`w-full px-3 py-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/70 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none ${className}`}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
