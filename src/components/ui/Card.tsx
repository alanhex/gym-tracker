import { cn } from '@/lib/utils'
import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  className?: string
}

export function StatCard({ label, value, icon, className }: StatCardProps) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        {icon && (
          <div className="text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
