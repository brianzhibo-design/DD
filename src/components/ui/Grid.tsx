import React from 'react'
import { cn } from '@/lib/utils'

interface GridProps {
  children: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 6
}

export function Grid({ children, className, cols = 4 }: GridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
  }

  return (
    <div className={cn(
      'grid',
      'gap-3 md:gap-4 lg:gap-6', // 响应式间距
      gridCols[cols],
      className
    )}>
      {children}
    </div>
  )
}

