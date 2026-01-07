import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon, Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  fullWidth?: boolean
}

export function Button({ 
  children, 
  className, 
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading,
  fullWidth,
  disabled,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-[#2D4B3E] hover:bg-[#3D6654] text-white shadow-lg shadow-[#2D4B3E]/20',
    secondary: 'bg-white border border-[#2D4B3E]/10 text-[#2D4B3E] hover:bg-[#F7F3EE]',
    ghost: 'text-[#6B7A74] hover:bg-[#2D4B3E]/5 hover:text-[#2D4B3E]',
    danger: 'bg-[#B85C5C] hover:bg-[#A04848] text-white'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs md:text-sm gap-1.5',
    md: 'px-4 py-2 md:px-5 md:py-2.5 text-sm gap-2',
    lg: 'px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base gap-2'
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center',
        'rounded-lg font-medium',
        'transition-all active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className={iconSizes[size]} />
      ) : null}
      {children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={iconSizes[size]} />
      )}
    </button>
  )
}

