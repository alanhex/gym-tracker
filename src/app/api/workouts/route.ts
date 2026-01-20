import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const strengthWorkoutSchema = z.object({
  type: z.literal('strength'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exercises: z.array(z.object({
    name: z.string().min(1, 'Exercise name required'),
    sets: z.array(z.object({
      reps: z.number().min(1),
      weight: z.number().min(0),
      rpe: z.number().min(1).max(10).optional(),
    })).min(1, 'At least one set required'),
  })).min(1, 'At least one exercise required'),
})

const cyclingWorkoutSchema = z.object({
  type: z.literal('cycling'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cycling: z.object({
    title: z.string().optional(),
    duration: z.number().min(1, 'Duration required'),
    distance: z.number().min(0).optional(),
    avgPower: z.number().min(0).optional(),
    maxPower: z.number().min(0).optional(),
    avgHeartRate: z.number().min(0).optional(),
    maxHeartRate: z.number().min(0).optional(),
    avgCadence: z.number().min(0).optional(),
    calories: z.number().min(0).optional(),
  }),
})

const runningWorkoutSchema = z.object({
  type: z.literal('running'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  running: z.object({
    title: z.string().optional(),
    duration: z.number().min(1, 'Duration required'),
    distance: z.number().min(0).optional(),
    avgPace: z.number().min(0).optional(),
    avgHeartRate: z.number().min(0).optional(),
    maxHeartRate: z.number().min(0).optional(),
    avgCadence: z.number().min(0).optional(),
    calories: z.number().min(0).optional(),
    elevationGain: z.number().min(0).optional(),
  }),
})

const createWorkoutSchema = z.discriminatedUnion('type', [
  strengthWorkoutSchema,
  cyclingWorkoutSchema,
  runningWorkoutSchema,
])

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workouts = await prisma.workout.findMany({
      where: { userId: session.user.id },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
        cyclingSession: true,
        runningSession: true,
      },
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(workouts)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Handle legacy requests without type field (assume strength)
    if (!body.type && body.exercises) {
      body.type = 'strength'
    }

    const validatedData = createWorkoutSchema.parse(body)

    if (validatedData.type === 'strength') {
      const workout = await prisma.workout.create({
        data: {
          userId: session.user.id,
          date: new Date(validatedData.date),
          type: 'strength',
          exercises: {
            create: validatedData.exercises.map(ex => ({
              name: ex.name,
              sets: {
                create: ex.sets,
              },
            })),
          },
        },
        include: {
          exercises: {
            include: {
              sets: true,
            },
          },
        },
      })
      return NextResponse.json(workout, { status: 201 })
    } else if (validatedData.type === 'cycling') {
      const workout = await prisma.workout.create({
        data: {
          userId: session.user.id,
          date: new Date(validatedData.date),
          type: 'cycling',
          cyclingSession: {
            create: {
              title: validatedData.cycling.title,
              duration: validatedData.cycling.duration,
              distance: validatedData.cycling.distance,
              avgPower: validatedData.cycling.avgPower,
              maxPower: validatedData.cycling.maxPower,
              avgHeartRate: validatedData.cycling.avgHeartRate,
              maxHeartRate: validatedData.cycling.maxHeartRate,
              avgCadence: validatedData.cycling.avgCadence,
              calories: validatedData.cycling.calories,
            },
          },
        },
        include: {
          cyclingSession: true,
        },
      })
      return NextResponse.json(workout, { status: 201 })
    } else {
      const workout = await prisma.workout.create({
        data: {
          userId: session.user.id,
          date: new Date(validatedData.date),
          type: 'running',
          runningSession: {
            create: {
              title: validatedData.running.title,
              duration: validatedData.running.duration,
              distance: validatedData.running.distance,
              avgPace: validatedData.running.avgPace,
              avgHeartRate: validatedData.running.avgHeartRate,
              maxHeartRate: validatedData.running.maxHeartRate,
              avgCadence: validatedData.running.avgCadence,
              calories: validatedData.running.calories,
              elevationGain: validatedData.running.elevationGain,
            },
          },
        },
        include: {
          runningSession: true,
        },
      })
      return NextResponse.json(workout, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating workout:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 })
  }
}
