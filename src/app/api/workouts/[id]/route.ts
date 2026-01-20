import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const updateStrengthSchema = z.object({
  type: z.literal('strength'),
  date: z.string().datetime().optional(),
  exercises: z.array(z.object({
    name: z.string(),
    sets: z.array(z.object({
      reps: z.number().int().positive(),
      weight: z.number().min(0),
      rpe: z.number().int().min(1).max(10).nullish(),
    })),
  })).optional(),
})

const updateCyclingSchema = z.object({
  type: z.literal('cycling'),
  date: z.string().datetime().optional(),
  cyclingSession: z.object({
    title: z.string().optional(),
    duration: z.number().min(1),
    distance: z.number().optional(),
    avgPower: z.number().optional(),
    maxPower: z.number().optional(),
    avgHeartRate: z.number().optional(),
    maxHeartRate: z.number().optional(),
    avgCadence: z.number().optional(),
    calories: z.number().optional(),
  }).optional(),
})

const updateRunningSchema = z.object({
  type: z.literal('running'),
  date: z.string().datetime().optional(),
  runningSession: z.object({
    title: z.string().optional(),
    duration: z.number().min(1),
    distance: z.number().optional(),
    avgPace: z.number().optional(),
    avgHeartRate: z.number().optional(),
    maxHeartRate: z.number().optional(),
    avgCadence: z.number().optional(),
    calories: z.number().optional(),
    elevationGain: z.number().optional(),
  }).optional(),
})

const updateWorkoutSchema = z.discriminatedUnion('type', [
  updateStrengthSchema,
  updateCyclingSchema,
  updateRunningSchema,
])

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const workout = await prisma.workout.findUnique({
      where: { id: parseInt(id) },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
        cyclingSession: true,
        runningSession: true,
      },
    })

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }

    if (workout.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(workout)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch workout' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const workoutId = parseInt(id)

    // Verify ownership
    const existingWorkout = await prisma.workout.findUnique({
      where: { id: workoutId },
    })

    if (!existingWorkout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }

    if (existingWorkout.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateWorkoutSchema.parse(body)

    if (validatedData.type === 'strength') {
      // Update strength workout
      await prisma.workout.update({
        where: { id: workoutId },
        data: {
          date: validatedData.date ? new Date(validatedData.date) : undefined,
          exercises: validatedData.exercises ? {
            deleteMany: {},
            create: validatedData.exercises.map(ex => ({
              name: ex.name,
              sets: {
                create: ex.sets,
              },
            })),
          } : undefined,
        },
      })
    } else if (validatedData.type === 'cycling') {
      // Update cycling workout
      await prisma.workout.update({
        where: { id: workoutId },
        data: {
          date: validatedData.date ? new Date(validatedData.date) : undefined,
        },
      })

      if (validatedData.cyclingSession) {
        await prisma.cyclingSession.update({
          where: { workoutId },
          data: {
            title: validatedData.cyclingSession.title,
            duration: validatedData.cyclingSession.duration,
            distance: validatedData.cyclingSession.distance,
            avgPower: validatedData.cyclingSession.avgPower,
            maxPower: validatedData.cyclingSession.maxPower,
            avgHeartRate: validatedData.cyclingSession.avgHeartRate,
            maxHeartRate: validatedData.cyclingSession.maxHeartRate,
            avgCadence: validatedData.cyclingSession.avgCadence,
            calories: validatedData.cyclingSession.calories,
          },
        })
      }
    } else if (validatedData.type === 'running') {
      // Update running workout
      await prisma.workout.update({
        where: { id: workoutId },
        data: {
          date: validatedData.date ? new Date(validatedData.date) : undefined,
        },
      })

      if (validatedData.runningSession) {
        await prisma.runningSession.update({
          where: { workoutId },
          data: {
            title: validatedData.runningSession.title,
            duration: validatedData.runningSession.duration,
            distance: validatedData.runningSession.distance,
            avgPace: validatedData.runningSession.avgPace,
            avgHeartRate: validatedData.runningSession.avgHeartRate,
            maxHeartRate: validatedData.runningSession.maxHeartRate,
            avgCadence: validatedData.runningSession.avgCadence,
            calories: validatedData.runningSession.calories,
            elevationGain: validatedData.runningSession.elevationGain,
          },
        })
      }
    }

    const updatedWorkout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
        cyclingSession: true,
        runningSession: true,
      },
    })

    return NextResponse.json(updatedWorkout)
  } catch (error) {
    console.error('Error updating workout:', error)
    return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const workoutId = parseInt(id)

    // Verify ownership
    const existingWorkout = await prisma.workout.findUnique({
      where: { id: workoutId },
    })

    if (!existingWorkout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }

    if (existingWorkout.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.workout.delete({
      where: { id: workoutId },
    })

    return NextResponse.json({ message: 'Workout deleted' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 })
  }
}
