'use client'

import Link from 'next/link'
import { Dumbbell, Bike, PersonStanding, ArrowRight, Sparkles } from 'lucide-react'

interface EmptyStateProps {
  userName?: string
}

export function EmptyState({ userName }: EmptyStateProps) {
  const tips = [
    'Track your sets, reps, and weights to see progress over time',
    'Log cycling and running sessions alongside strength training',
    'Build consistency with weekly goals and streak tracking',
    'Earn achievements as you hit milestones',
  ]

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-white/10 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {userName ? `Welcome, ${userName}!` : 'Welcome to Gym Tracker!'}
            </h2>
            <p className="text-gray-300 text-sm mt-1">
              Let&apos;s start your fitness journey
            </p>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-4">
          Track your workouts, monitor your progress, and achieve your fitness goals.
          Start by logging your first workout!
        </p>

        <Link
          href="/add"
          className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-100 transition"
        >
          Log your first workout
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick start options */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Quick Start</h3>
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/add?type=strength"
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-700 transition"
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Strength</span>
          </Link>

          <Link
            href="/add?type=cycling"
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-700 transition"
          >
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Bike className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Cycling</span>
          </Link>

          <Link
            href="/add?type=running"
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-700 transition"
          >
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <PersonStanding className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Running</span>
          </Link>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Getting Started Tips</h3>
        <ul className="space-y-2">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-500 dark:text-gray-400">
                {index + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
