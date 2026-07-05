import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: 'bg-primary-container text-on-primary hover:bg-primary shadow-sm hover:shadow-md',
      secondary: 'bg-surface-container text-on-surface hover:bg-surface-container-high',
      outline: 'border border-outline-variant text-on-surface hover:bg-surface-container hover:border-outline',
      ghost: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
      danger: 'bg-error text-on-primary hover:bg-error/90 shadow-sm hover:shadow-md',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 py-2 px-4',
      lg: 'h-11 px-8 text-base',
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
