'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Dumbbell, Bike } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Workout {
  id: number
  date: string
  type: string
}

interface WorkoutCalendarProps {
  workouts: Workout[]
  onSelectDate: (date: string | null) => void
  selectedDate: string | null
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function WorkoutCalendar({ workouts, onSelectDate, selectedDate }: WorkoutCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const workoutMap = useMemo(() => {
    const map = new Map<string, Workout[]>()
    workouts.forEach(w => {
      const dateKey = w.date.split('T')[0]
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(w)
    })
    return map
  }, [workouts])

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Get the day of week for the first day (0 = Sunday, adjust for Monday start)
    let startDay = firstDay.getDay() - 1
    if (startDay < 0) startDay = 6

    const days: Array<{ date: Date | null; isCurrentMonth: boolean }> = []

    // Add previous month's days
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({ date, isCurrentMonth: false })
    }

    // Add current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }

    // Add next month's days to complete the grid (6 rows)
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }

    return days
  }, [currentDate])

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const formatDateKey = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="text-center">
          <button
            onClick={goToToday}
            className="font-semibold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </button>
        </div>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
        {DAYS.map(day => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          if (!day.date) return <div key={index} className="p-2" />

          const dateKey = formatDateKey(day.date)
          const dayWorkouts = workoutMap.get(dateKey)
          const hasWorkout = !!dayWorkouts && dayWorkouts.length > 0
          const isToday = day.date.getTime() === today.getTime()
          const isSelected = selectedDate === dateKey
          const hasStrength = dayWorkouts?.some(w => w.type === 'strength')
          const hasCycling = dayWorkouts?.some(w => w.type === 'cycling')
          const hasRunning = dayWorkouts?.some(w => w.type === 'running')

          return (
            <button
              key={index}
              onClick={() => {
                if (hasWorkout) {
                  onSelectDate(isSelected ? null : dateKey)
                }
              }}
              disabled={!hasWorkout}
              className={cn(
                'relative p-2 min-h-[56px] border-t border-r border-gray-100 dark:border-gray-800 transition',
                !day.isCurrentMonth && 'opacity-30',
                hasWorkout && 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
                isSelected && 'bg-gray-100 dark:bg-gray-800',
                !hasWorkout && 'cursor-default'
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center w-7 h-7 text-sm rounded-full mx-auto',
                  isToday && !isSelected && 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold',
                  isSelected && 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold',
                  !isToday && !isSelected && 'text-gray-700 dark:text-gray-300'
                )}
              >
                {day.date.getDate()}
              </span>
              {hasWorkout && (
                <div className="flex justify-center gap-1 mt-1">
                  {hasStrength && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                  {hasCycling && (
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  )}
                  {hasRunning && (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 p-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Strength</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Cycling</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Running</span>
        </div>
      </div>
    </div>
  )
}
