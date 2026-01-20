'use client'

import { useState, useEffect } from 'react'
import { Target, ChevronDown, Check } from 'lucide-react'

interface WeeklyGoalProps {
  currentCount: number
}

export function WeeklyGoal({ currentCount }: WeeklyGoalProps) {
  const [goal, setGoal] = useState<number>(4)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('weeklyGoal')
    if (saved) {
      setGoal(parseInt(saved))
    }
  }, [])

  const handleSetGoal = (newGoal: number) => {
    setGoal(newGoal)
    localStorage.setItem('weeklyGoal', newGoal.toString())
    setIsEditing(false)
  }

  const progress = Math.min((currentCount / goal) * 100, 100)
  const isComplete = currentCount >= goal

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isComplete ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
            {isComplete ? (
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          <span className="font-medium text-gray-900 dark:text-white">Weekly Goal</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {goal} workouts
            <ChevronDown className="w-4 h-4" />
          </button>

          {isEditing && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10">
              {[2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  onClick={() => handleSetGoal(num)}
                  className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    goal === num ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {num} workouts
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-2">
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete ? 'bg-green-500' : 'bg-gray-900 dark:bg-white'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={isComplete ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
          {isComplete ? 'Goal completed!' : `${currentCount} of ${goal} completed`}
        </span>
        <span className="text-gray-400 dark:text-gray-500">
          {goal - currentCount > 0 ? `${goal - currentCount} to go` : ''}
        </span>
      </div>
    </div>
  )
}
