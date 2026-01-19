'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Dumbbell, Plus, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string
  level: string
  instructions: string[]
  image: string | null
}

interface ApiResponse {
  exercises: Exercise[]
  total: number
  muscleGroups: string[]
  hasMore: boolean
}

export default function Learn() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [muscleGroups, setMuscleGroups] = useState<string[]>([])
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const LIMIT = 30

  const fetchExercises = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset
    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: currentOffset.toString(),
      })
      if (selectedMuscle !== 'All') {
        params.set('muscle', selectedMuscle)
      }
      if (searchQuery) {
        params.set('search', searchQuery)
      }

      const response = await fetch(`/api/exercises-db?${params}`)
      if (!response.ok) throw new Error('Failed to fetch')

      const data: ApiResponse = await response.json()

      if (reset) {
        setExercises(data.exercises)
        setOffset(LIMIT)
      } else {
        setExercises(prev => [...prev, ...data.exercises])
        setOffset(prev => prev + LIMIT)
      }

      setMuscleGroups(data.muscleGroups)
      setHasMore(data.hasMore)
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching exercises:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [selectedMuscle, searchQuery, offset])

  // Initial fetch and when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchExercises(true)
    }, searchQuery ? 300 : 0) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [selectedMuscle, searchQuery])

  const handleAddExercise = (exerciseName: string) => {
    router.push(`/add?exercise=${encodeURIComponent(exerciseName)}`)
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchExercises(false)
    }
  }

  return (
    <div className="min-h-screen p-6 pb-24">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Learn</h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search 800+ exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition"
          />
        </div>

        {/* Muscle Group Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-6 px-6 scrollbar-hide">
          <button
            onClick={() => setSelectedMuscle('All')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition',
              selectedMuscle === 'All'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            )}
          >
            All
          </button>
          {muscleGroups.map(muscle => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition',
                selectedMuscle === muscle
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}
            >
              {muscle}
            </button>
          ))}
        </div>

        {/* Exercise Count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {loading ? 'Loading...' : `${total} exercise${total !== 1 ? 's' : ''}`}
        </p>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Exercise Grid */}
            <div className="grid grid-cols-2 gap-3">
              {exercises.map(exercise => (
                <button
                  key={exercise.id}
                  onClick={() => setSelectedExercise(exercise)}
                  className="text-left"
                >
                  <Card className="overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition">
                    <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                      {exercise.image ? (
                        <img
                          src={exercise.image}
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                          <Dumbbell className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">
                        {exercise.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {exercise.equipment}
                      </p>
                    </div>
                  </Card>
                </button>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full mt-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load more (${total - exercises.length} remaining)`
                )}
              </button>
            )}

            {exercises.length === 0 && !loading && (
              <Card className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No exercises found.</p>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedExercise(null)}
          />
          <div className="relative w-full max-w-lg h-[95vh] sm:h-auto sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
            {/* Image */}
            <div className="h-48 sm:h-auto sm:aspect-video flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              {selectedExercise.image ? (
                <img
                  src={selectedExercise.image}
                  alt={selectedExercise.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                  <Dumbbell className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Title and buttons - always visible */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {selectedExercise.name}
              </h2>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  {selectedExercise.muscleGroup}
                </span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  {selectedExercise.equipment}
                </span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  {selectedExercise.level}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => handleAddExercise(selectedExercise.name)}
                  className="flex-1 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add to Workout
                </button>
              </div>
            </div>

            {/* Instructions - scrollable */}
            <div className="flex-1 min-h-0 p-4 overflow-y-auto">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">How to perform</h3>
              {selectedExercise.instructions.length > 0 ? (
                <ol className="space-y-2">
                  {selectedExercise.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-500">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{instruction}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No instructions available for this exercise.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
