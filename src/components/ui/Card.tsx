import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ 
  children, 
  className, 
  title, 
  subtitle,
  action,
  padding = 'md' 
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3 md:p-4',
    md: 'p-4 md:p-5 lg:p-6',
    lg: 'p-5 md:p-6 lg:p-8'
  }

  return (
    <div className={cn(
      'bg-white rounded-xl md:rounded-2xl',
      'border border-[#2D4B3E]/5',
      'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
      paddingClasses[padding],
      className
    )}>
      {/* 卡片头部 */}
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            {title && (
              <h3 className="text-base md:text-lg font-semibold text-[#1A2421] font-serif">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs md:text-sm text-[#6B7A74] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      
      {children}
    </div>
  )
}

