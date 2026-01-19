import { NextRequest, NextResponse } from 'next/server'

const EXERCISES_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

interface RawExercise {
  id: string
  name: string
  force: string | null
  level: string
  mechanic: string | null
  equipment: string | null
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  category: string
  images: string[]
}

interface TransformedExercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string
  level: string
  instructions: string[]
  image: string | null
}

// Map raw muscle names to our display categories
const muscleGroupMap: Record<string, string> = {
  'biceps': 'Biceps',
  'chest': 'Chest',
  'forearms': 'Forearms',
  'lats': 'Back',
  'middle back': 'Back',
  'lower back': 'Back',
  'neck': 'Neck',
  'quadriceps': 'Legs',
  'hamstrings': 'Legs',
  'calves': 'Legs',
  'triceps': 'Triceps',
  'traps': 'Shoulders',
  'shoulders': 'Shoulders',
  'abdominals': 'Core',
  'glutes': 'Glutes',
  'adductors': 'Legs',
  'abductors': 'Legs',
}

// Cache the exercises in memory
let cachedExercises: TransformedExercise[] | null = null
let cacheTime: number | null = null
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const muscle = searchParams.get('muscle')
    const search = searchParams.get('search')?.toLowerCase()
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check cache
    if (cachedExercises && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
      return filterAndReturn(cachedExercises, muscle, search, limit, offset)
    }

    // Fetch from GitHub
    const response = await fetch(EXERCISES_URL, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error('Failed to fetch exercises')
    }

    const rawExercises: RawExercise[] = await response.json()

    // Transform exercises
    cachedExercises = rawExercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      muscleGroup: muscleGroupMap[ex.primaryMuscles[0]?.toLowerCase()] || 'Other',
      equipment: ex.equipment ? capitalizeFirst(ex.equipment) : 'Bodyweight',
      level: capitalizeFirst(ex.level),
      instructions: ex.instructions,
      image: ex.images.length > 0 ? `${IMAGE_BASE_URL}/${ex.images[0]}` : null,
    }))
    cacheTime = Date.now()

    return filterAndReturn(cachedExercises, muscle, search, limit, offset)
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }
}

function filterAndReturn(
  exercises: TransformedExercise[],
  muscle: string | null,
  search: string | null | undefined,
  limit: number,
  offset: number
) {
  let filtered = exercises

  if (muscle && muscle !== 'All') {
    filtered = filtered.filter(ex => ex.muscleGroup === muscle)
  }

  if (search) {
    filtered = filtered.filter(ex =>
      ex.name.toLowerCase().includes(search) ||
      ex.equipment.toLowerCase().includes(search)
    )
  }

  const total = filtered.length
  const paginated = filtered.slice(offset, offset + limit)

  // Get unique muscle groups for filters
  const muscleGroups = [...new Set(exercises.map(ex => ex.muscleGroup))].sort()

  return NextResponse.json({
    exercises: paginated,
    total,
    muscleGroups,
    hasMore: offset + limit < total,
  })
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
