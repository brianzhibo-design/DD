import React from 'react'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function PageLayout({ 
  children, 
  title, 
  subtitle, 
  action,
  className 
}: PageLayoutProps) {
  return (
    <div className={cn(
      'space-y-4 md:space-y-6 lg:space-y-8', // 响应式区块间距
      className
    )}>
      {/* 页面标题栏 */}
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
          <div>
            {title && (
              <h1 className="text-xl md:text-2xl font-bold text-[#1A2421] font-serif">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm md:text-base text-[#6B7A74] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="flex items-center gap-2 md:gap-3">
              {action}
            </div>
          )}
        </div>
      )}
      
      {/* 页面内容 */}
      {children}
    </div>
  )
}

