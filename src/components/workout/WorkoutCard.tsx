import { cn } from '@/lib/utils'
import { Dumbbell, Bike, Footprints } from 'lucide-react'
import Link from 'next/link'

interface WorkoutCardProps {
  id: number
  date: string
  type: 'strength' | 'cycling' | 'running'
  exerciseCount?: number
  duration?: number
  title?: string
  className?: string
}

export function WorkoutCard({
  date,
  type,
  exerciseCount,
  duration,
  title,
  className,
}: WorkoutCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  const getIcon = () => {
    switch (type) {
      case 'cycling':
        return <Bike className="w-5 h-5 text-orange-600 dark:text-orange-400" />
      case 'running':
        return <Footprints className="w-5 h-5 text-green-600 dark:text-green-400" />
      default:
        return <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    }
  }

  const getIconBg = () => {
    switch (type) {
      case 'cycling':
        return 'bg-orange-50 dark:bg-orange-900/20'
      case 'running':
        return 'bg-green-50 dark:bg-green-900/20'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20'
    }
  }

  const getSubtitle = () => {
    switch (type) {
      case 'cycling':
      case 'running':
        return title || `${duration} min`
      default:
        return `${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}`
    }
  }

  const dateParam = date.split('T')[0]

  return (
    <Link href={`/history?date=${dateParam}`}>
      <div
        className={cn(
          'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', getIconBg())}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white">
              {formattedDate}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {getSubtitle()}
            </p>
          </div>
          <span className="text-gray-400 dark:text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
