import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const exercises = await prisma.exercise.findMany({
      where: {
        workout: {
          userId: session.user.id,
        },
      },
      select: { name: true },
      distinct: ['name'],
      orderBy: { name: 'asc' },
    })
    const names = exercises.map(e => e.name)
    return NextResponse.json(names)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }
}
