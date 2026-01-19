'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Dumbbell, Calendar, Flame, Trophy } from 'lucide-react'
import { StatCard } from '@/components/ui/Card'
import { CardSkeleton, WorkoutCardSkeleton } from '@/components/ui/Skeleton'
import { WeeklyActivity } from '@/components/workout/WeeklyActivity'
import { WorkoutCard } from '@/components/workout/WorkoutCard'

interface Workout {
  id: number
  date: string
  type: 'strength' | 'cycling' | 'running'
  exercises: Array<{
    name: string
    sets: Array<{
      reps: number
      weight: number
      rpe?: number
    }>
  }>
  cyclingSession?: {
    title?: string
    duration: number
  }
  runningSession?: {
    title?: string
    duration: number
  }
}

export default function Home() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/workouts')
      .then(res => res.json())
      .then(data => {
        setWorkouts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const recentWorkouts = workouts.slice(0, 5)
  const totalWorkouts = workouts.length

  // Calculate this week's workouts
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const thisWeekCount = workouts.filter(w => new Date(w.date) >= weekAgo).length

  // Calculate streak
  const calculateStreak = () => {
    if (workouts.length === 0) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const sortedDates = [...new Set(workouts.map(w => w.date.split('T')[0]))]
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streak = 0
    let checkDate = new Date(today)

    // Check if there's a workout today or yesterday
    const todayStr = today.toISOString().split('T')[0]
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (!sortedDates.includes(todayStr) && !sortedDates.includes(yesterdayStr)) {
      return 0
    }

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0]
      if (sortedDates.includes(dateStr)) {
        streak++
      } else if (i > 0) {
        break
      }
      checkDate.setDate(checkDate.getDate() - 1)
    }

    return streak
  }

  const streak = calculateStreak()

  // Count unique exercises as a simple "PRs" proxy
  const uniqueExercises = new Set(
    workouts.flatMap(w => w.exercises?.map(e => e.name) || [])
  ).size

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="mb-8">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="space-y-3">
            <WorkoutCardSkeleton />
            <WorkoutCardSkeleton />
            <WorkoutCardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <header className="mb-2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        </header>

        <WeeklyActivity workoutDates={workouts.map(w => w.date)} />

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Total"
            value={totalWorkouts}
            icon={<Dumbbell className="w-5 h-5" />}
          />
          <StatCard
            label="This Week"
            value={thisWeekCount}
            icon={<Calendar className="w-5 h-5" />}
          />
          <StatCard
            label="Streak"
            value={streak > 0 ? `${streak} day${streak !== 1 ? 's' : ''}` : '-'}
            icon={<Flame className="w-5 h-5" />}
          />
          <StatCard
            label="Exercises"
            value={uniqueExercises}
            icon={<Trophy className="w-5 h-5" />}
          />
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent</h2>
            {workouts.length > 5 && (
              <Link
                href="/history"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                See all
              </Link>
            )}
          </div>

          {recentWorkouts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center shadow-sm">
              <p className="text-gray-500 dark:text-gray-400">
                No workouts yet.{' '}
                <Link href="/add" className="text-gray-900 dark:text-white font-medium hover:underline">
                  Add your first
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentWorkouts.map(workout => (
                <WorkoutCard
                  key={workout.id}
                  id={workout.id}
                  date={workout.date}
                  type={workout.type || 'strength'}
                  exerciseCount={workout.exercises?.length}
                  duration={workout.cyclingSession?.duration || workout.runningSession?.duration}
                  title={workout.cyclingSession?.title || workout.runningSession?.title}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
