'use client'

import Link from 'next/link'
import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Dumbbell, Bike, Footprints, Clock, Zap, Heart, Activity, Flame, Trash2, Pencil, X, Mountain, Timer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { WorkoutCardSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { EditWorkoutModal } from '@/components/workout/EditWorkoutModal'
import { WorkoutCalendar } from '@/components/workout/WorkoutCalendar'
import { cn } from '@/lib/utils'

interface CyclingSession {
  title?: string
  duration: number
  distance?: number
  avgPower?: number
  maxPower?: number
  avgHeartRate?: number
  maxHeartRate?: number
  avgCadence?: number
  calories?: number
}

interface RunningSession {
  title?: string
  duration: number
  distance?: number
  avgPace?: number
  avgHeartRate?: number
  maxHeartRate?: number
  avgCadence?: number
  calories?: number
  elevationGain?: number
}

interface Workout {
  id: number
  date: string
  type: string
  exercises: Array<{
    name: string
    sets: Array<{
      reps: number
      weight: number
      rpe?: number
    }>
  }>
  cyclingSession?: CyclingSession
  runningSession?: RunningSession
}

export default function History() {
  return (
    <Suspense fallback={<HistorySkeleton />}>
      <HistoryContent />
    </Suspense>
  )
}

function HistorySkeleton() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6" />
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}

function HistoryContent() {
  const searchParams = useSearchParams()
  const initialDate = searchParams.get('date')

  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const { showToast } = useToast()

  const fetchWorkouts = () => {
    fetch('/api/workouts')
      .then(res => res.json())
      .then(data => {
        setWorkouts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const deleteWorkout = async (id: number) => {
    if (confirm('Delete this workout?')) {
      await fetch(`/api/workouts/${id}`, { method: 'DELETE' })
      showToast('Workout deleted')
      fetchWorkouts()
      // Clear selection if we deleted the selected workout
      const currentWorkouts = Array.isArray(workouts) ? workouts : []
      const remainingWorkouts = currentWorkouts.filter(w => w.id !== id)
      const dateWorkouts = remainingWorkouts.filter(w => w.date.split('T')[0] === selectedDate)
      if (dateWorkouts.length === 0) {
        setSelectedDate(null)
      }
    }
  }

  const saveWorkout = async (workout: Workout) => {
    try {
      const body: Record<string, unknown> = {
        date: workout.date,
        type: workout.type,
      }

      if (workout.type === 'strength') {
        body.exercises = workout.exercises
      } else if (workout.type === 'cycling') {
        body.cyclingSession = workout.cyclingSession
      } else if (workout.type === 'running') {
        body.runningSession = workout.runningSession
      }

      const response = await fetch(`/api/workouts/${workout.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        showToast('Workout updated')
        setEditingWorkout(null)
        fetchWorkouts()
      } else {
        showToast('Failed to update workout', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    }
  }

  const workoutsList = Array.isArray(workouts) ? workouts : []

  const selectedWorkouts = useMemo(() => {
    if (!selectedDate) return []
    return workoutsList.filter(w => w.date.split('T')[0] === selectedDate)
  }, [workoutsList, selectedDate])

  const totalWorkouts = workoutsList.length
  const strengthCount = workoutsList.filter(w => w.type === 'strength').length
  const cyclingCount = workoutsList.filter(w => w.type === 'cycling').length
  const runningCount = workoutsList.filter(w => w.type === 'running').length

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6" />
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">History</h1>

        {/* Stats summary */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-center">
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{totalWorkouts}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </div>
          <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-center">
            <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{strengthCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Strength</p>
          </div>
          <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-center">
            <p className="text-xl font-semibold text-orange-500">{cyclingCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cycling</p>
          </div>
          <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-center">
            <p className="text-xl font-semibold text-green-500">{runningCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Running</p>
          </div>
        </div>

        {workoutsList.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No workouts yet.{' '}
              <Link href="/add" className="text-gray-900 dark:text-white font-medium hover:underline">
                Add your first
              </Link>
            </p>
          </Card>
        ) : (
          <>
            <WorkoutCalendar
              workouts={workoutsList}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {/* Selected date workouts */}
            {selectedDate && selectedWorkouts.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h2>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {selectedWorkouts.map(workout => (
                  <Card key={workout.id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'p-2 rounded-lg',
                            workout.type === 'cycling'
                              ? 'bg-orange-50 dark:bg-orange-900/20'
                              : workout.type === 'running'
                              ? 'bg-green-50 dark:bg-green-900/20'
                              : 'bg-blue-50 dark:bg-blue-900/20'
                          )}
                        >
                          {workout.type === 'cycling' ? (
                            <Bike className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          ) : workout.type === 'running' ? (
                            <Footprints className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {workout.type === 'cycling' ? 'Cycling' : workout.type === 'running' ? 'Running' : 'Strength'}
                          </p>
                          {workout.type === 'cycling' && workout.cyclingSession?.title && (
                            <p className="text-sm text-orange-600 dark:text-orange-400">{workout.cyclingSession.title}</p>
                          )}
                          {workout.type === 'running' && workout.runningSession?.title && (
                            <p className="text-sm text-green-600 dark:text-green-400">{workout.runningSession.title}</p>
                          )}
                          {workout.type === 'strength' && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingWorkout(workout)}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteWorkout(workout.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {workout.type === 'cycling' && workout.cyclingSession ? (
                      <CyclingWorkoutDisplay session={workout.cyclingSession} />
                    ) : workout.type === 'running' && workout.runningSession ? (
                      <RunningWorkoutDisplay session={workout.runningSession} />
                    ) : (
                      <div className="space-y-3">
                        {workout.exercises.map((exercise, exIndex) => (
                          <div
                            key={exIndex}
                            className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg"
                          >
                            <p className="font-medium text-gray-900 dark:text-white mb-2">{exercise.name}</p>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              {exercise.sets.map((set, setIndex) => (
                                <div key={setIndex} className="flex gap-2">
                                  <span className="text-gray-400 dark:text-gray-500">Set {setIndex + 1}:</span>
                                  <span>{set.reps} reps @ {set.weight} kg</span>
                                  {set.rpe && <span className="text-gray-400">(RPE {set.rpe})</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {!selectedDate && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Tap a day to view workout details
              </p>
            )}
          </>
        )}
      </div>

      {editingWorkout && (
        <EditWorkoutModal
          workout={editingWorkout}
          isOpen={!!editingWorkout}
          onClose={() => setEditingWorkout(null)}
          onSave={saveWorkout}
        />
      )}
    </div>
  )
}

function CyclingWorkoutDisplay({ session }: { session: CyclingSession }) {
  return (
    <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">{session.duration} min</p>
          </div>
        </div>

        {session.distance && (
          <div className="flex items-center gap-2">
            <Bike className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Distance</p>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{session.distance} km</p>
            </div>
          </div>
        )}

        {session.avgPower && (
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Power</p>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{session.avgPower} W</p>
            </div>
          </div>
        )}

        {session.avgHeartRate && (
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg HR</p>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{session.avgHeartRate} bpm</p>
            </div>
          </div>
        )}

        {session.avgCadence && (
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cadence</p>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{session.avgCadence} rpm</p>
            </div>
          </div>
        )}

        {session.calories && (
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Calories</p>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{session.calories} kcal</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RunningWorkoutDisplay({ session }: { session: RunningSession }) {
  const formatPace = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}'${sec.toString().padStart(2, '0')}"`
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">{session.duration} min</p>
          </div>
        </div>

        {session.distance && (
          <div className="flex items-center gap-2">
            <Footprints className="w-4 h-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Distance</p>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{session.distance} km</p>
            </div>
          </div>
        )}

        {session.avgPace && (
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Pace</p>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{formatPace(session.avgPace)}/km</p>
            </div>
          </div>
        )}

        {session.avgHeartRate && (
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg HR</p>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{session.avgHeartRate} bpm</p>
            </div>
          </div>
        )}

        {session.avgCadence && (
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cadence</p>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{session.avgCadence} spm</p>
            </div>
          </div>
        )}

        {session.elevationGain && (
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Elevation</p>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{session.elevationGain} m</p>
            </div>
          </div>
        )}

        {session.calories && (
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Calories</p>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{session.calories} kcal</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
