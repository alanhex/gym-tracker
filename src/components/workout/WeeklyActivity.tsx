'use client'

import { cn } from '@/lib/utils'

interface WeeklyActivityProps {
  workoutDates: string[]
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function WeeklyActivity({ workoutDates }: WeeklyActivityProps) {
  // Format date as YYYY-MM-DD using local timezone
  const formatDateKey = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Get the current week's dates (Monday to Sunday)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentDay = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1))

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return formatDateKey(date)
  })

  const todayStr = formatDateKey(today)
  const workoutSet = new Set(workoutDates.map(d => d.split('T')[0]))

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">This Week</p>
      <div className="flex justify-between">
        {DAYS.map((day, i) => {
          const dateStr = weekDates[i]
          const hasWorkout = workoutSet.has(dateStr)
          const isToday = dateStr === todayStr
          const isFuture = dateStr > todayStr

          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">{day}</span>
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  hasWorkout
                    ? 'bg-gray-900 dark:bg-white'
                    : isToday
                    ? 'border-2 border-gray-300 dark:border-gray-600'
                    : isFuture
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : 'bg-gray-100 dark:bg-gray-800'
                )}
              >
                {hasWorkout && (
                  <span className="text-white dark:text-gray-900 text-xs font-medium">
                    {String.fromCharCode(10003)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
