import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type ComponentProps } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md';

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  fullWidth?: boolean;
}

function buttonClass({ variant = 'primary', size = 'md', fullWidth }: StyleProps, className?: string) {
  return cn('btn', `btn-${variant}`, size === 'sm' && 'btn-sm', fullWidth && 'btn-block', className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, StyleProps {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, icon: Icon, fullWidth, loading, className, children, disabled, type = 'button', ...rest },
  ref
) {
  const iconSize = size === 'sm' ? 14 : 16;
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass({ variant, size, fullWidth }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 size={iconSize} className="spin" /> : Icon ? <Icon size={iconSize} /> : null}
      {children}
    </button>
  );
});

type ButtonLinkProps = ComponentProps<typeof Link> & StyleProps;

export function ButtonLink({ variant, size, icon: Icon, fullWidth, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClass({ variant, size, fullWidth }, className)} {...rest}>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </Link>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  size?: number;
  active?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, label, size = 18, active, className, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn('icon-btn', active && 'icon-btn-active', className)}
      {...rest}
    >
      <Icon size={size} />
    </button>
  );
});
