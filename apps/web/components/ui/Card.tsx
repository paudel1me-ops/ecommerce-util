import * as React from 'react'
import { cn } from '@/lib/utils'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding
  hoverable?: boolean
  bordered?: boolean
  elevated?: boolean
}

const padCls: Record<CardPadding, string> = { none: 'p-0', sm: 'p-3', md: 'p-5', lg: 'p-8' }

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ padding = 'md', hoverable = false, bordered = true, elevated = false, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white rounded-xl overflow-hidden',
        bordered && 'border border-gray-200',
        elevated ? 'shadow-md' : 'shadow-sm',
        hoverable && 'transition-shadow duration-200 hover:shadow-md cursor-pointer',
        padCls[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)
Card.displayName = 'Card'

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('flex flex-col gap-1 pb-4 border-b border-gray-100', className)} {...props}>{children}</div>
)

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 className={cn('text-lg font-semibold text-gray-900 leading-tight', className)} {...props}>{children}</h3>
)

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('pt-4', className)} {...props}>{children}</div>
)

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('flex items-center pt-4 border-t border-gray-100 mt-4', className)} {...props}>{children}</div>
)

export default Card
