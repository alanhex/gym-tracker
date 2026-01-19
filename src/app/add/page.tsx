'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, useFieldArray, Control, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Dumbbell, Bike, Footprints } from 'lucide-react'
import ScrollPicker from '@/components/ScrollPicker'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

// Strength workout schema
const strengthSchema = z.object({
  type: z.literal('strength'),
  date: z.string(),
  exercises: z.array(z.object({
    name: z.string().min(1, 'Exercise name required'),
    sets: z.array(z.object({
      reps: z.number().min(1),
      weight: z.number().min(0),
      rpe: z.number().min(1).max(10).optional(),
    })).min(1, 'At least one set required'),
  })).min(1, 'At least one exercise required'),
})

// Cycling workout schema
const cyclingSchema = z.object({
  type: z.literal('cycling'),
  date: z.string(),
  cycling: z.object({
    title: z.string().optional(),
    duration: z.number().min(1, 'Duration required'),
    distance: z.number().optional(),
    avgPower: z.number().optional(),
    maxPower: z.number().optional(),
    avgHeartRate: z.number().optional(),
    maxHeartRate: z.number().optional(),
    avgCadence: z.number().optional(),
    calories: z.number().optional(),
  }),
})

// Running workout schema
const runningSchema = z.object({
  type: z.literal('running'),
  date: z.string(),
  running: z.object({
    title: z.string().optional(),
    duration: z.number().min(1, 'Duration required'),
    distance: z.number().optional(),
    avgPace: z.number().optional(),
    avgHeartRate: z.number().optional(),
    maxHeartRate: z.number().optional(),
    avgCadence: z.number().optional(),
    calories: z.number().optional(),
    elevationGain: z.number().optional(),
  }),
})

type StrengthForm = z.infer<typeof strengthSchema>
type CyclingForm = z.infer<typeof cyclingSchema>
type RunningForm = z.infer<typeof runningSchema>

// Generate values for pickers
const REPS_VALUES = Array.from({ length: 30 }, (_, i) => i + 1)
const WEIGHT_VALUES = Array.from({ length: 61 }, (_, i) => i * 5)
const RPE_VALUES = ['-', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// Cycling picker values
const DURATION_VALUES = Array.from({ length: 180 }, (_, i) => i + 1)
const DISTANCE_VALUES = Array.from({ length: 201 }, (_, i) => i)
const POWER_VALUES = Array.from({ length: 81 }, (_, i) => i * 5)
const HR_VALUES = Array.from({ length: 121 }, (_, i) => i + 80)
const CADENCE_VALUES = Array.from({ length: 81 }, (_, i) => i + 40)
const CALORIES_VALUES = Array.from({ length: 41 }, (_, i) => i * 50)

// Running picker values
const RUN_DISTANCE_VALUES = Array.from({ length: 51 }, (_, i) => i) // 0-50 km
const PACE_MIN_VALUES = Array.from({ length: 11 }, (_, i) => i + 3) // 3-13 min/km
const PACE_SEC_VALUES = Array.from({ length: 12 }, (_, i) => i * 5) // 0, 5, 10...55
const RUN_CADENCE_VALUES = Array.from({ length: 61 }, (_, i) => i + 140) // 140-200 spm
const ELEVATION_VALUES = Array.from({ length: 101 }, (_, i) => i * 10) // 0-1000m

export default function AddWorkout() {
  return (
    <Suspense fallback={<AddWorkoutSkeleton />}>
      <AddWorkoutContent />
    </Suspense>
  )
}

function AddWorkoutSkeleton() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-lg mx-auto">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6" />
        <div className="flex gap-3 mb-6">
          <div className="flex-1 h-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="flex-1 h-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}

function AddWorkoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [workoutType, setWorkoutType] = useState<'strength' | 'cycling' | 'running'>('strength')
  const [exerciseNames, setExerciseNames] = useState<string[]>([])

  const initialExercise = searchParams.get('exercise') || ''

  useEffect(() => {
    fetch('/api/exercises')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setExerciseNames(data)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Add Workout</h1>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setWorkoutType('strength')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition font-medium text-sm',
              workoutType === 'strength'
                ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
            )}
          >
            <Dumbbell className="w-4 h-4" />
            Strength
          </button>
          <button
            type="button"
            onClick={() => setWorkoutType('cycling')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition font-medium text-sm',
              workoutType === 'cycling'
                ? 'border-orange-500 bg-orange-500 text-white'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
            )}
          >
            <Bike className="w-4 h-4" />
            Cycling
          </button>
          <button
            type="button"
            onClick={() => setWorkoutType('running')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition font-medium text-sm',
              workoutType === 'running'
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
            )}
          >
            <Footprints className="w-4 h-4" />
            Running
          </button>
        </div>

        {workoutType === 'strength' && (
          <StrengthWorkoutForm
            exerciseNames={exerciseNames}
            submitting={submitting}
            setSubmitting={setSubmitting}
            router={router}
            showToast={showToast}
            initialExercise={initialExercise}
          />
        )}
        {workoutType === 'cycling' && (
          <CyclingWorkoutForm
            submitting={submitting}
            setSubmitting={setSubmitting}
            router={router}
            showToast={showToast}
          />
        )}
        {workoutType === 'running' && (
          <RunningWorkoutForm
            submitting={submitting}
            setSubmitting={setSubmitting}
            router={router}
            showToast={showToast}
          />
        )}
      </div>
    </div>
  )
}

function StrengthWorkoutForm({
  exerciseNames,
  submitting,
  setSubmitting,
  router,
  showToast,
  initialExercise,
}: {
  exerciseNames: string[]
  submitting: boolean
  setSubmitting: (v: boolean) => void
  router: ReturnType<typeof useRouter>
  showToast: (message: string, type?: 'success' | 'error') => void
  initialExercise: string
}) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<StrengthForm>({
    resolver: zodResolver(strengthSchema),
    defaultValues: {
      type: 'strength',
      date: new Date().toISOString().split('T')[0],
      exercises: [{ name: initialExercise, sets: [{ reps: 10, weight: 20 }] }],
    },
  })

  const { fields: exerciseFields, append: appendExercise, remove: removeExercise } = useFieldArray({
    control,
    name: 'exercises',
  })

  const onSubmit = async (data: StrengthForm) => {
    data.exercises.forEach(ex => ex.sets.forEach(set => {
      if (set.rpe === undefined || (typeof set.rpe === 'number' && isNaN(set.rpe))) {
        set.rpe = undefined
      }
    }))

    setSubmitting(true)
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        showToast('Workout added successfully')
        router.push('/')
      } else {
        const errorData = await response.json()
        showToast(errorData.error || 'Failed to add workout', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
        <input
          type="date"
          {...register('date')}
          className="block w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition"
        />
        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
      </Card>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Exercises</h2>
          <Button
            type="button"
            size="sm"
            onClick={() => appendExercise({ name: '', sets: [{ reps: 10, weight: 20 }] })}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        {exerciseFields.map((exercise, exerciseIndex) => (
          <ExerciseField
            key={exercise.id}
            index={exerciseIndex}
            control={control}
            register={register}
            remove={() => removeExercise(exerciseIndex)}
            errors={errors.exercises?.[exerciseIndex]}
            exerciseNames={exerciseNames}
          />
        ))}
        {errors.exercises && <p className="text-red-500 text-sm">{errors.exercises.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="w-full"
      >
        {submitting ? 'Adding...' : 'Add Workout'}
      </Button>
    </form>
  )
}

function CyclingWorkoutForm({
  submitting,
  setSubmitting,
  router,
  showToast,
}: {
  submitting: boolean
  setSubmitting: (v: boolean) => void
  router: ReturnType<typeof useRouter>
  showToast: (message: string, type?: 'success' | 'error') => void
}) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<CyclingForm>({
    resolver: zodResolver(cyclingSchema),
    defaultValues: {
      type: 'cycling',
      date: new Date().toISOString().split('T')[0],
      cycling: {
        title: '',
        duration: 30,
        distance: 15,
        avgPower: 150,
        avgHeartRate: 140,
        avgCadence: 80,
        calories: 300,
      },
    },
  })

  const onSubmit = async (data: CyclingForm) => {
    if (data.cycling.distance === 0) data.cycling.distance = undefined
    if (data.cycling.avgPower === 0) data.cycling.avgPower = undefined
    if (data.cycling.maxPower === 0) data.cycling.maxPower = undefined
    if (data.cycling.avgHeartRate === 0) data.cycling.avgHeartRate = undefined
    if (data.cycling.maxHeartRate === 0) data.cycling.maxHeartRate = undefined
    if (data.cycling.avgCadence === 0) data.cycling.avgCadence = undefined
    if (data.cycling.calories === 0) data.cycling.calories = undefined

    setSubmitting(true)
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        showToast('Ride added successfully')
        router.push('/')
      } else {
        const errorData = await response.json()
        showToast(errorData.error || 'Failed to add ride', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
        <input
          type="date"
          {...register('date')}
          className="block w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
        />
        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
      </Card>

      <Card className="p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title (optional)</label>
        <input
          type="text"
          {...register('cycling.title')}
          placeholder="e.g., Zwift - Road to Ruins"
          className="block w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
        />
      </Card>

      <Card className="p-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (min)</label>
            <Controller
              control={control}
              name="cycling.duration"
              render={({ field }) => (
                <ScrollPicker
                  values={DURATION_VALUES}
                  value={field.value}
                  onChange={(v) => field.onChange(v as number)}
                  suffix=" min"
                />
              )}
            />
            {errors.cycling?.duration && <p className="text-red-500 text-sm mt-1">{errors.cycling.duration.message}</p>}
          </div>

          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distance (km)</label>
            <Controller
              control={control}
              name="cycling.distance"
              render={({ field }) => (
                <ScrollPicker
                  values={DISTANCE_VALUES}
                  value={field.value ?? 0}
                  onChange={(v) => field.onChange(v as number)}
                  suffix=" km"
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avg Power (W)</label>
            <Controller
              control={control}
              name="cycling.avgPower"
              render={({ field }) => (
                <ScrollPicker
                  values={POWER_VALUES}
                  value={field.value ?? 0}
                  onChange={(v) => field.onChange(v as number)}
                  suffix=" W"
                />
              )}
            />
          </div>

          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avg Heart Rate</label>
            <Controller
              control={control}
              name="cycling.avgHeartRate"
              render={({ field }) => (
                <ScrollPicker
                  values={HR_VALUES}
                  value={field.value ?? 140}
                  onChange={(v) => field.onChange(v as number)}
                  suffix=" bpm"
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avg Cadence</label>
            <Controller
              control={control}
              name="cycling.avgCadence"
              render={({ field }) => (
                <ScrollPicker
                  values={CADENCE_VALUES}
                  value={field.value ?? 80}
                  onChange={(v) => field.onChange(v as number)}
                  suffix=" rpm"
                />
              )}
            />
          </div>

          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Calories</label>
            <Controller
              control={control}
              name="cycling.calories"
              render={({ field }) => (
                <ScrollPicker
                  values={CALORIES_VALUES}
                  value={field.value ?? 0}
                  onChange={(v) => field.onChange(v as number)}
                  suffix=" kcal"
                />
              )}
            />
          </div>
        </div>
      </Card>

      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="w-full bg-orange-500 hover:bg-orange-600 focus:ring-orange-500"
      >
        {submitting ? 'Adding...' : 'Add Ride'}
      </Button>
    </form>
  )
}

function RunningWorkoutForm({
  submitting,
  setSubmitting,
  router,
  showToast,
}: {
  submitting: boolean
  setSubmitting: (v: boolean) => void
  router: ReturnType<typeof useRouter>
  showToast: (message: string, type?: 'success' | 'error') => void
}) {
  const [paceMin, setPaceMin] = useState(5)
  const [paceSec, setPaceSec] = useState(30)

  const { register, control, handleSubmit, formState: { errors } } = useForm<RunningForm>({
    resolver: zodResolver(runningSchema),
    defaultValues: {
      type: 'running',
      date: new Date().toISOString().split('T')[0],
      running: {
        title: '',
        duration: 30,
        distance: 5,
        avgPace: 330, // 5:30 in seconds
        avgHeartRate: 150,
        avgCadence: 170,
        calories: 300,
        elevationGain: 50,
      },
    },
  })

  const onSubmit = async (data: RunningForm) => {
    // Convert pace from min:sec to total seconds
    data.running.avgPace = paceMin * 60 + paceSec

    if (data.running.distance === 0) data.running.distance = undefined
    if (data.running.avgPace === 0) data.running.avgPace = undefined
    if (data.running.avgHeartRate === 0) data.running.avgHeartRate = undefined
    if (data.running.maxHeartRate === 0) data.running.maxHeartRate = undefined
    if (data.running.avgCadence === 0) data.running.avgCadence = undefined
    if (data.running.calories === 0) data.running.calories = undefined
    if (data.running.elevationGain === 0) data.running.elevationGain = undefined

    setSubmitting(true)
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        showToast('Run added successfully')
        router.push('/')
      } else {
        const errorData = await response.json()
        showToast(errorData.error || 'Failed to add run', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
        <input
          type="date"
          {...register('date')}
          className="block w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
      </Card>

      <Card className="p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title (optional)</label>
        <input
          type="text"
          {...register('running.title')}
          placeholder="e.g., Morning Run"
          className="block w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
      </Card>

      <Card className="p-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (min)</label>
            <Controller
              control={control}
              name="running.duration"
              render={({ field }) => (
                <ScrollPicker
                  values={DURATION_VALUES}
                  value={field.value}
                  onChange={(v) => field.onChange(v as number)}
                  suffix=" min"
                />
              )}
            />
            {errors.running?.duration && <p className="text-red-500 text-sm mt-1">{errors.running.duration.message}</p>}
          </div>

          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distance (km)</label>
            <Controller
              control={control}
              name="running.distance"
              render={({ field }) => (
                <ScrollPicker
                  values={RUN_DISTANCE_VALUES}
                  value={field.value ?? 0}
                  onChange={(v) => field.onChange(v as number)}
                  suffix=" km"
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avg Pace (min)</label>
            <ScrollPicker
              values={PACE_MIN_VALUES}
              value={paceMin}
              onChange={(v) => setPaceMin(v as number)}
              suffix="'"
            />
          </div>

          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avg Pace (sec)</label>
            <ScrollPicker
              values={PACE_SEC_VALUES}
              value={paceSec}
              onChange={(v) => setPaceSec(v as number)}
              suffix='"'
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avg Heart Rate</label>
            <Controller
              control={control}
              name="running.avgHeartRate"
              render={({ field }) => (
                <ScrollPicker
                  values={HR_VALUES}
                  value={field.value ?? 150}
                  onChange={(v) => field.onChange(v as number)}
                  suffix=" bpm"
                />
              )}
            />
          </div>

          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avg Cadence</label>
            <Controller
              control={control}
              name="running.avgCadence"
              render={({ field }) => (
                <ScrollPicker
                  values={RUN_CADENCE_VALUES}
                  value={field.value ?? 170}
                  onChange={(v) => field.onChange(v as number)}
                  suffix=" spm"
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Calories</label>
            <Controller
              control={control}
              name="running.calories"
              render={({ field }) => (
                <ScrollPicker
                  values={CALORIES_VALUES}
                  value={field.value ?? 0}
                  onChange={(v) => field.onChange(v as number)}
                  suffix=" kcal"
                />
              )}
            />
          </div>

          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Elevation</label>
            <Controller
              control={control}
              name="running.elevationGain"
              render={({ field }) => (
                <ScrollPicker
                  values={ELEVATION_VALUES}
                  value={field.value ?? 0}
                  onChange={(v) => field.onChange(v as number)}
                  suffix=" m"
                />
              )}
            />
          </div>
        </div>
      </Card>

      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="w-full bg-green-500 hover:bg-green-600 focus:ring-green-500"
      >
        {submitting ? 'Adding...' : 'Add Run'}
      </Button>
    </form>
  )
}

function ExerciseField({ index, control, register, remove, errors, exerciseNames }: {
  index: number
  control: Control<StrengthForm>
  register: ReturnType<typeof useForm<StrengthForm>>['register']
  remove: () => void
  errors: unknown
  exerciseNames: string[]
}) {
  const { fields: setFields, append: appendSet, remove: removeSet } = useFieldArray({
    control,
    name: `exercises.${index}.sets`,
  })
  const watchedSets = useWatch({
    control,
    name: `exercises.${index}.sets`,
  })
  const watchedName = useWatch({
    control,
    name: `exercises.${index}.name`,
  })

  const [showSuggestions, setShowSuggestions] = useState(false)
  const filteredSuggestions = exerciseNames.filter(name =>
    name.toLowerCase().includes((watchedName || '').toLowerCase()) && name.toLowerCase() !== (watchedName || '').toLowerCase()
  )

  const typedErrors = errors as { name?: { message?: string }; sets?: { message?: string } } | undefined

  return (
    <Card className="p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 relative">
          <input
            {...register(`exercises.${index}.name`)}
            placeholder="Exercise name"
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            autoComplete="off"
            className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
              {filteredSuggestions.map((name, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    const input = document.querySelector(`input[name="exercises.${index}.name"]`) as HTMLInputElement
                    if (input) {
                      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
                      nativeInputValueSetter?.call(input, name)
                      input.dispatchEvent(new Event('input', { bubbles: true }))
                    }
                    setShowSuggestions(false)
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={remove}
          className="ml-3 text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      {typedErrors?.name && <p className="text-red-500 text-sm mb-4">{typedErrors.name.message}</p>}

      <div className="space-y-3">
        {setFields.map((set, setIndex) => (
          <div key={set.id} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Set {setIndex + 1}</span>
              <button
                type="button"
                onClick={() => removeSet(setIndex)}
                className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-around items-start gap-2">
              <Controller
                control={control}
                name={`exercises.${index}.sets.${setIndex}.reps`}
                render={({ field }) => (
                  <ScrollPicker
                    label="Reps"
                    values={REPS_VALUES}
                    value={field.value}
                    onChange={(v) => field.onChange(v as number)}
                  />
                )}
              />
              <Controller
                control={control}
                name={`exercises.${index}.sets.${setIndex}.weight`}
                render={({ field }) => (
                  <ScrollPicker
                    label="Weight"
                    values={WEIGHT_VALUES}
                    value={field.value}
                    onChange={(v) => field.onChange(v as number)}
                    suffix=" kg"
                  />
                )}
              />
              <Controller
                control={control}
                name={`exercises.${index}.sets.${setIndex}.rpe`}
                render={({ field }) => (
                  <ScrollPicker
                    label="Effort"
                    values={RPE_VALUES}
                    value={field.value ?? '-'}
                    onChange={(v) => field.onChange(v === '-' ? undefined : v as number)}
                  />
                )}
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          const lastSet = watchedSets && watchedSets.length > 0 ? watchedSets[watchedSets.length - 1] : null
          appendSet(lastSet ? { reps: lastSet.reps, weight: lastSet.weight, rpe: lastSet.rpe } : { reps: 10, weight: 20 })
        }}
        className="mt-3 flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition"
      >
        <Plus className="w-4 h-4" />
        Add Set
      </button>
      {typedErrors?.sets && <p className="text-red-500 text-sm">{typedErrors.sets.message}</p>}
    </Card>
  )
}
