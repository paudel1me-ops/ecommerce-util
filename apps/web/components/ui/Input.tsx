'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  errorText?: string
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
  fullWidth?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, errorText, leftAddon, rightAddon, fullWidth = true, id, className, disabled, required, ...props }, ref) => {
    const uid = React.useId()
    const inputId = id ?? uid
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    const hasError = Boolean(errorText)

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className={cn('text-sm font-medium', hasError ? 'text-red-600' : 'text-gray-700')}>
            {label}
            {required && <span aria-hidden="true" className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">{leftAddon}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            className={cn(
              'block rounded-lg border bg-white text-gray-900 text-sm placeholder:text-gray-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 py-2',
              leftAddon ? 'pl-10' : 'pl-3',
              rightAddon ? 'pr-10' : 'pr-3',
              hasError
                ? 'border-red-500 focus:ring-red-300'
                : 'border-gray-300 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20',
              disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed',
              fullWidth && 'w-full',
              className,
            )}
            {...props}
          />
          {rightAddon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-gray-400">{rightAddon}</div>
          )}
        </div>
        {hasError ? (
          <p id={errorId} role="alert" className="text-xs text-red-600">{errorText}</p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-gray-500">{helperText}</p>
        ) : null}
      </div>
    )
  },
)
Input.displayName = 'Input'
export default Input
