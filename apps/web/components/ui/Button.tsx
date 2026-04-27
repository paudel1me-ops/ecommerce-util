'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantCls: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--brand-primary)] text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 disabled:opacity-50',
  secondary:
    'bg-white text-[var(--brand-primary)] border border-[var(--brand-primary)] hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 disabled:opacity-50',
  ghost:
    'bg-transparent text-[var(--brand-primary)] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 disabled:opacity-50',
  danger:
    'bg-red-600 text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:opacity-50',
}

const sizeCls: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
}

function Spinner({ size }: { size: ButtonSize }) {
  const dim = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <svg className={cn('animate-spin', dim)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, fullWidth = false, leftIcon, rightIcon, disabled, children, className, type = 'button', ...props }, ref) => {
    const isDisabled = disabled || loading
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:outline-none cursor-pointer disabled:cursor-not-allowed',
          variantCls[variant],
          sizeCls[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <><Spinner size={size} /><span>{children}</span></>
        ) : (
          <>
            {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  },
)
Button.displayName = 'Button'
export default Button
