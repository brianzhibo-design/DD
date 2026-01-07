import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: LucideIcon
}

export function Input({ 
  className, 
  label, 
  error, 
  icon: Icon,
  ...props 
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[10px] md:text-xs font-bold text-[#6B7A74] uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-[#9BA8A3]" />
          </div>
        )}
        <input
          className={cn(
            'w-full bg-[#F4F6F0] border-none rounded-lg',
            'text-sm text-[#1A2421] placeholder-[#9BA8A3]',
            'focus:outline-none focus:ring-2 focus:ring-[#2D4B3E]/10',
            'transition-all',
            // 响应式内边距
            'px-3 py-2.5 md:px-4 md:py-3',
            Icon && 'pl-10',
            error && 'ring-2 ring-[#B85C5C]/20',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-[#B85C5C] ml-1">{error}</p>
      )}
    </div>
  )
}

