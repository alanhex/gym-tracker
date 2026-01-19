'use client'

import { useEffect, useState, useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from 'chart.js'
import { TrendingUp, TrendingDown, Minus, Trophy, Dumbbell, Activity } from 'lucide-react'
import { Card, StatCard } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface Workout {
  id: number
  date: string
  exercises: Array<{
    name: string
    sets: Array<{
      reps: number
      weight: number
      rpe?: number
    }>
  }>
}

interface ProgressChartProps {
  exercises: string[]
  workouts: Workout[]
}

interface DataPoint {
  date: string
  maxWeight: number
  totalVolume: number
  estimated1RM: number
  bestSet: { reps: number; weight: number }
}

// Epley formula for estimated 1RM
function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

export default function ProgressChart({ exercises, workouts }: ProgressChartProps) {
  const [selectedExercise, setSelectedExercise] = useState(exercises[0] || '')
  const [metric, setMetric] = useState<'maxWeight' | 'totalVolume' | 'estimated1RM'>('maxWeight')

  const dataPoints = useMemo(() => {
    if (!selectedExercise) return []

    return workouts
      .filter(w => w.exercises.some(e => e.name === selectedExercise))
      .map(w => {
        const exercise = w.exercises.find(e => e.name === selectedExercise)!
        const maxWeight = Math.max(...exercise.sets.map(s => s.weight))
        const totalVolume = exercise.sets.reduce((sum, s) => sum + s.reps * s.weight, 0)
        const best1RM = Math.max(...exercise.sets.map(s => calculate1RM(s.weight, s.reps)))
        const bestSet = exercise.sets.reduce(
          (best, s) => (s.weight > best.weight ? s : best),
          exercise.sets[0]
        )

        return {
          date: w.date.split('T')[0],
          maxWeight,
          totalVolume,
          estimated1RM: best1RM,
          bestSet,
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [selectedExercise, workouts])

  // Calculate stats
  const stats = useMemo(() => {
    if (dataPoints.length === 0) return null

    const current = dataPoints[dataPoints.length - 1]
    const previous = dataPoints.length > 1 ? dataPoints[dataPoints.length - 2] : null
    const allTimeMax = Math.max(...dataPoints.map(d => d.maxWeight))
    const allTime1RM = Math.max(...dataPoints.map(d => d.estimated1RM))

    const weightTrend = previous ? current.maxWeight - previous.maxWeight : 0
    const volumeTrend = previous ? current.totalVolume - previous.totalVolume : 0
    const oneRMTrend = previous ? current.estimated1RM - previous.estimated1RM : 0

    return {
      currentMax: current.maxWeight,
      allTimeMax,
      allTime1RM,
      currentVolume: current.totalVolume,
      current1RM: current.estimated1RM,
      weightTrend,
      volumeTrend,
      oneRMTrend,
      totalSessions: dataPoints.length,
      isPR: current.maxWeight >= allTimeMax,
    }
  }, [dataPoints])

  const chartData: ChartData<'line'> = useMemo(() => {
    const labels = dataPoints.map(d => {
      const date = new Date(d.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    const metricLabels = {
      maxWeight: 'Max Weight (kg)',
      totalVolume: 'Volume (kg)',
      estimated1RM: 'Est. 1RM (kg)',
    }

    return {
      labels,
      datasets: [
        {
          label: metricLabels[metric],
          data: dataPoints.map(d => d[metric]),
          borderColor: '#171717',
          backgroundColor: 'rgba(23, 23, 23, 0.05)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#171717',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    }
  }, [dataPoints, metric])

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#171717',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#6b7280' },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280' },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  }

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  return (
    <div className="space-y-6">
      {/* Exercise Selector */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Select Exercise</p>
        <div className="flex flex-wrap gap-2">
          {exercises.map(ex => (
            <button
              key={ex}
              onClick={() => setSelectedExercise(ex)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition',
                selectedExercise === ex
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {dataPoints.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No data for this exercise yet.</p>
        </Card>
      ) : (
        <>
          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Max Weight</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.currentMax} kg
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendIcon value={stats.weightTrend} />
                    {stats.weightTrend !== 0 && (
                      <span
                        className={cn(
                          'text-xs font-medium',
                          stats.weightTrend > 0 ? 'text-green-500' : 'text-red-500'
                        )}
                      >
                        {stats.weightTrend > 0 ? '+' : ''}{stats.weightTrend}
                      </span>
                    )}
                  </div>
                </div>
                {stats.isPR && (
                  <div className="flex items-center gap-1 mt-2 text-amber-500">
                    <Trophy className="w-3 h-3" />
                    <span className="text-xs font-medium">Personal Record!</span>
                  </div>
                )}
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Est. 1RM</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.current1RM} kg
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendIcon value={stats.oneRMTrend} />
                    {stats.oneRMTrend !== 0 && (
                      <span
                        className={cn(
                          'text-xs font-medium',
                          stats.oneRMTrend > 0 ? 'text-green-500' : 'text-red-500'
                        )}
                      >
                        {stats.oneRMTrend > 0 ? '+' : ''}{stats.oneRMTrend}
                      </span>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Volume</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.currentVolume.toLocaleString()} kg
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendIcon value={stats.volumeTrend} />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sessions</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.totalSessions}
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Metric Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setMetric('maxWeight')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition',
                metric === 'maxWeight'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}
            >
              <Dumbbell className="w-4 h-4" />
              Weight
            </button>
            <button
              onClick={() => setMetric('totalVolume')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition',
                metric === 'totalVolume'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}
            >
              <Activity className="w-4 h-4" />
              Volume
            </button>
            <button
              onClick={() => setMetric('estimated1RM')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition',
                metric === 'estimated1RM'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}
            >
              <Trophy className="w-4 h-4" />
              Est. 1RM
            </button>
          </div>

          {/* Chart */}
          <Card className="p-4">
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </Card>

          {/* All-time Records */}
          {stats && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">All-Time Records</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <Trophy className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Max Weight</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{stats.allTimeMax} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Dumbbell className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Best Est. 1RM</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{stats.allTime1RM} kg</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
