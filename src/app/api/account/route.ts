import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete user (cascades to workouts, accounts, sessions)
    await prisma.user.delete({
      where: { id: session.user.id },
    })

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
