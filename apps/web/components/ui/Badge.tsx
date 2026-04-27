import * as React from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'origin' | 'outline'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
}

const variantCls: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
  origin:  'bg-green-100 text-green-700',
  outline: 'bg-transparent border border-gray-300 text-gray-600',
}

const dotCls: Record<BadgeVariant, string> = {
  default: 'bg-gray-500', success: 'bg-green-500', warning: 'bg-amber-500',
  danger: 'bg-red-500', info: 'bg-blue-500', origin: 'bg-green-500', outline: 'bg-gray-400',
}

const sizeCls: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', size = 'md', dot = false, className, children, ...props }) => (
  <span className={cn('inline-flex items-center font-medium rounded-full', variantCls[variant], sizeCls[size], className)} {...props}>
    {dot && <span aria-hidden="true" className={cn('rounded-full shrink-0 w-1.5 h-1.5', dotCls[variant])} />}
    {children}
  </span>
)
Badge.displayName = 'Badge'
export default Badge
