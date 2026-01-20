import Link from 'next/link'
import ProgressChart from './ProgressChart'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import { auth } from '@/lib/auth'

export default async function Progress() {
  const session = await auth()

  let workouts: Array<{
    id: number
    date: Date
    exercises: Array<{
      name: string
      sets: Array<{
        reps: number
        weight: number
        rpe: number | null
      }>
    }>
  }> = []
  let exercises: string[] = []
  try {
    workouts = await prisma.workout.findMany({
      where: {
        type: 'strength',
        userId: session?.user?.id,
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })
    exercises = [...new Set(workouts.flatMap(w => w.exercises.map(e => e.name)))]
  } catch (error) {
    console.error('Failed to fetch workouts:', error)
  }

  const serializedWorkouts = workouts.map(w => ({
    ...w,
    date: w.date.toISOString(),
    exercises: w.exercises.map(e => ({
      ...e,
      sets: e.sets.map(s => ({
        reps: s.reps,
        weight: s.weight,
        rpe: s.rpe ?? undefined,
      })),
    })),
  }))

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Progress</h1>

        {exercises.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No strength workouts yet.{' '}
              <Link href="/add" className="text-gray-900 dark:text-white font-medium hover:underline">
                Add workouts
              </Link>{' '}
              to track your progress.
            </p>
          </Card>
        ) : (
          <ProgressChart exercises={exercises} workouts={serializedWorkouts} />
        )}
      </div>
    </div>
  )
}
