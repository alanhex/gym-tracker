'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Set {
  reps: number
  weight: number
  rpe?: number
}

interface Exercise {
  name: string
  sets: Set[]
}

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
  exercises: Exercise[]
  cyclingSession?: CyclingSession
  runningSession?: RunningSession
}

interface EditWorkoutModalProps {
  workout: Workout
  isOpen: boolean
  onClose: () => void
  onSave: (workout: Workout) => Promise<void>
}

export function EditWorkoutModal({ workout, isOpen, onClose, onSave }: EditWorkoutModalProps) {
  const [date, setDate] = useState('')
  const [saving, setSaving] = useState(false)

  // Strength state
  const [exercises, setExercises] = useState<Exercise[]>([])

  // Cycling state
  const [cyclingData, setCyclingData] = useState<CyclingSession>({
    duration: 30,
    title: '',
  })

  // Running state
  const [runningData, setRunningData] = useState<RunningSession>({
    duration: 30,
    title: '',
  })

  useEffect(() => {
    if (workout) {
      setDate(workout.date.split('T')[0])

      if (workout.type === 'strength') {
        setExercises(JSON.parse(JSON.stringify(workout.exercises)))
      } else if (workout.type === 'cycling' && workout.cyclingSession) {
        setCyclingData({ ...workout.cyclingSession })
      } else if (workout.type === 'running' && workout.runningSession) {
        setRunningData({ ...workout.runningSession })
      }
    }
  }, [workout])

  if (!isOpen) return null

  // Strength handlers
  const updateExerciseName = (index: number, name: string) => {
    const updated = [...exercises]
    updated[index].name = name
    setExercises(updated)
  }

  const updateSet = (exIndex: number, setIndex: number, field: keyof Set, value: number | undefined) => {
    const updated = [...exercises]
    updated[exIndex].sets[setIndex] = {
      ...updated[exIndex].sets[setIndex],
      [field]: value,
    }
    setExercises(updated)
  }

  const addSet = (exIndex: number) => {
    const updated = [...exercises]
    const lastSet = updated[exIndex].sets[updated[exIndex].sets.length - 1]
    updated[exIndex].sets.push(lastSet ? { ...lastSet } : { reps: 10, weight: 20 })
    setExercises(updated)
  }

  const removeSet = (exIndex: number, setIndex: number) => {
    const updated = [...exercises]
    updated[exIndex].sets.splice(setIndex, 1)
    setExercises(updated)
  }

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ reps: 10, weight: 20 }] }])
  }

  const removeExercise = (index: number) => {
    const updated = [...exercises]
    updated.splice(index, 1)
    setExercises(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    const updatedWorkout: Workout = {
      ...workout,
      date: new Date(date).toISOString(),
      exercises: workout.type === 'strength' ? exercises : [],
    }

    if (workout.type === 'cycling') {
      updatedWorkout.cyclingSession = cyclingData
    } else if (workout.type === 'running') {
      updatedWorkout.runningSession = runningData
    }

    await onSave(updatedWorkout)
    setSaving(false)
  }

  const getTitle = () => {
    switch (workout.type) {
      case 'cycling': return 'Edit Cycling Workout'
      case 'running': return 'Edit Running Workout'
      default: return 'Edit Strength Workout'
    }
  }

  const getAccentColor = () => {
    switch (workout.type) {
      case 'cycling': return 'focus:ring-orange-500'
      case 'running': return 'focus:ring-green-500'
      default: return 'focus:ring-gray-900 dark:focus:ring-white'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 ${getAccentColor()} focus:border-transparent transition`}
            />
          </div>

          {workout.type === 'strength' && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">Exercises</h3>
                <Button size="sm" onClick={addExercise} className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              {exercises.map((exercise, exIndex) => (
                <Card key={exIndex} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExerciseName(exIndex, e.target.value)}
                      placeholder="Exercise name"
                      className="flex-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition"
                    />
                    <button
                      onClick={() => removeExercise(exIndex)}
                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-8">#{setIndex + 1}</span>
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Reps</label>
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) => updateSet(exIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Weight</label>
                            <input
                              type="number"
                              value={set.weight}
                              onChange={(e) => updateSet(exIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">RPE</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={set.rpe || ''}
                              onChange={(e) => updateSet(exIndex, setIndex, 'rpe', e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder="-"
                              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => removeSet(exIndex, setIndex)}
                          className="p-1 text-red-500 hover:text-red-600 rounded transition"
                          disabled={exercise.sets.length <= 1}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addSet(exIndex)}
                    className="mt-2 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                  >
                    <Plus className="w-3 h-3" />
                    Add Set
                  </button>
                </Card>
              ))}
            </>
          )}

          {workout.type === 'cycling' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title (optional)</label>
                <input
                  type="text"
                  value={cyclingData.title || ''}
                  onChange={(e) => setCyclingData({ ...cyclingData, title: e.target.value })}
                  placeholder="e.g., Zwift - Road to Ruins"
                  className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (min)</label>
                  <input
                    type="number"
                    value={cyclingData.duration}
                    onChange={(e) => setCyclingData({ ...cyclingData, duration: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cyclingData.distance || ''}
                    onChange={(e) => setCyclingData({ ...cyclingData, distance: parseFloat(e.target.value) || undefined })}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avg Power (W)</label>
                  <input
                    type="number"
                    value={cyclingData.avgPower || ''}
                    onChange={(e) => setCyclingData({ ...cyclingData, avgPower: parseInt(e.target.value) || undefined })}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avg HR (bpm)</label>
                  <input
                    type="number"
                    value={cyclingData.avgHeartRate || ''}
                    onChange={(e) => setCyclingData({ ...cyclingData, avgHeartRate: parseInt(e.target.value) || undefined })}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cadence (rpm)</label>
                  <input
                    type="number"
                    value={cyclingData.avgCadence || ''}
                    onChange={(e) => setCyclingData({ ...cyclingData, avgCadence: parseInt(e.target.value) || undefined })}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Calories</label>
                  <input
                    type="number"
                    value={cyclingData.calories || ''}
                    onChange={(e) => setCyclingData({ ...cyclingData, calories: parseInt(e.target.value) || undefined })}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>
          )}

          {workout.type === 'running' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title (optional)</label>
                <input
                  type="text"
                  value={runningData.title || ''}
                  onChange={(e) => setRunningData({ ...runningData, title: e.target.value })}
                  placeholder="e.g., Morning Run"
                  className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (min)</label>
                  <input
                    type="number"
                    value={runningData.duration}
                    onChange={(e) => setRunningData({ ...runningData, duration: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={runningData.distance || ''}
                    onChange={(e) => setRunningData({ ...runningData, distance: parseFloat(e.target.value) || undefined })}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avg Pace (sec/km)</label>
                  <input
                    type="number"
                    value={runningData.avgPace || ''}
                    onChange={(e) => setRunningData({ ...runningData, avgPace: parseInt(e.target.value) || undefined })}
                    placeholder="e.g., 330 for 5:30"
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avg HR (bpm)</label>
                  <input
                    type="number"
                    value={runningData.avgHeartRate || ''}
                    onChange={(e) => setRunningData({ ...runningData, avgHeartRate: parseInt(e.target.value) || undefined })}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cadence (spm)</label>
                  <input
                    type="number"
                    value={runningData.avgCadence || ''}
                    onChange={(e) => setRunningData({ ...runningData, avgCadence: parseInt(e.target.value) || undefined })}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Elevation (m)</label>
                  <input
                    type="number"
                    value={runningData.elevationGain || ''}
                    onChange={(e) => setRunningData({ ...runningData, elevationGain: parseInt(e.target.value) || undefined })}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Calories</label>
                <input
                  type="number"
                  value={runningData.calories || ''}
                  onChange={(e) => setRunningData({ ...runningData, calories: parseInt(e.target.value) || undefined })}
                  className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 ${workout.type === 'cycling' ? 'bg-orange-500 hover:bg-orange-600' : workout.type === 'running' ? 'bg-green-500 hover:bg-green-600' : ''}`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
