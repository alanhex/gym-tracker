'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, Calendar, BookOpen, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/history', label: 'History', icon: Calendar },
  { href: '/add', label: 'Add', icon: Plus, isCenter: true },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center -mt-5"
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform active:scale-95',
                    'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200'
                  )}
                >
                  <Icon className="w-7 h-7 text-white dark:text-gray-900" strokeWidth={2.5} />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full transition-colors',
                isActive
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
