import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany({
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
