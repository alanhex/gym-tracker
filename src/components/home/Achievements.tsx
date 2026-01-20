'use client'

import { Trophy, Flame, Dumbbell, Calendar, Star, Zap, Award, Target } from 'lucide-react'

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress?: number
  target?: number
}

interface AchievementsProps {
  totalWorkouts: number
  streak: number
  uniqueExercises: number
  thisWeekCount: number
}

export function Achievements({ totalWorkouts, streak, uniqueExercises, thisWeekCount }: AchievementsProps) {
  const achievements: Achievement[] = [
    {
      id: 'first-workout',
      name: 'First Steps',
      description: 'Complete your first workout',
      icon: <Star className="w-5 h-5" />,
      unlocked: totalWorkouts >= 1,
    },
    {
      id: '10-workouts',
      name: 'Getting Started',
      description: 'Complete 10 workouts',
      icon: <Dumbbell className="w-5 h-5" />,
      unlocked: totalWorkouts >= 10,
      progress: totalWorkouts,
      target: 10,
    },
    {
      id: '50-workouts',
      name: 'Dedicated',
      description: 'Complete 50 workouts',
      icon: <Award className="w-5 h-5" />,
      unlocked: totalWorkouts >= 50,
      progress: totalWorkouts,
      target: 50,
    },
    {
      id: '100-workouts',
      name: 'Centurion',
      description: 'Complete 100 workouts',
      icon: <Trophy className="w-5 h-5" />,
      unlocked: totalWorkouts >= 100,
      progress: totalWorkouts,
      target: 100,
    },
    {
      id: '3-day-streak',
      name: 'On Fire',
      description: 'Achieve a 3-day streak',
      icon: <Flame className="w-5 h-5" />,
      unlocked: streak >= 3,
    },
    {
      id: '7-day-streak',
      name: 'Week Warrior',
      description: 'Achieve a 7-day streak',
      icon: <Zap className="w-5 h-5" />,
      unlocked: streak >= 7,
    },
    {
      id: '30-day-streak',
      name: 'Unstoppable',
      description: 'Achieve a 30-day streak',
      icon: <Target className="w-5 h-5" />,
      unlocked: streak >= 30,
      progress: streak,
      target: 30,
    },
    {
      id: '10-exercises',
      name: 'Variety',
      description: 'Try 10 different exercises',
      icon: <Calendar className="w-5 h-5" />,
      unlocked: uniqueExercises >= 10,
      progress: uniqueExercises,
      target: 10,
    },
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const recentUnlocked = achievements.filter(a => a.unlocked).slice(-3)
  const nextToUnlock = achievements.find(a => !a.unlocked && a.progress !== undefined)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
            <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">Achievements</span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      {/* Unlocked badges */}
      {recentUnlocked.length > 0 && (
        <div className="flex gap-2 mb-4">
          {recentUnlocked.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
              title={achievement.description}
            >
              <span className="text-yellow-600 dark:text-yellow-400">{achievement.icon}</span>
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{achievement.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Next achievement progress */}
      {nextToUnlock && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 dark:text-gray-500">{nextToUnlock.icon}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{nextToUnlock.name}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {nextToUnlock.progress}/{nextToUnlock.target}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-300 dark:bg-gray-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(((nextToUnlock.progress || 0) / (nextToUnlock.target || 1)) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{nextToUnlock.description}</p>
        </div>
      )}

      {/* No achievements yet */}
      {unlockedCount === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
          Complete your first workout to unlock achievements!
        </p>
      )}
    </div>
  )
}
