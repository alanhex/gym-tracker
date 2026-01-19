'use client'

import { useRef, useEffect, useCallback } from 'react'

interface ScrollPickerProps {
  values: (number | string)[]
  value: number | string
  onChange: (value: number | string) => void
  label?: string
  suffix?: string
}

export default function ScrollPicker({ values, value, onChange, label, suffix }: ScrollPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isUserScrolling = useRef(false)
  const itemHeight = 44 // Slightly larger for better touch targets

  const currentIndex = values.indexOf(value)

  // Scroll to value on mount and when value changes externally
  useEffect(() => {
    if (containerRef.current && !isUserScrolling.current) {
      const index = values.indexOf(value)
      if (index !== -1) {
        containerRef.current.scrollTop = index * itemHeight
      }
    }
  }, [value, values, itemHeight])

  // Debounced scroll end handler - works better with iOS momentum scrolling
  const handleScrollEnd = useCallback(() => {
    if (!containerRef.current) return

    const scrollTop = containerRef.current.scrollTop
    const index = Math.round(scrollTop / itemHeight)
    const clampedIndex = Math.max(0, Math.min(index, values.length - 1))

    // Snap to nearest item
    containerRef.current.scrollTo({
      top: clampedIndex * itemHeight,
      behavior: 'smooth'
    })

    // Update value
    if (values[clampedIndex] !== value) {
      onChange(values[clampedIndex])
    }

    isUserScrolling.current = false
  }, [values, value, onChange, itemHeight])

  const handleScroll = useCallback(() => {
    isUserScrolling.current = true

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Set new timeout - this handles iOS momentum scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      handleScrollEnd()
    }, 100)
  }, [handleScrollEnd])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const handleItemClick = (v: number | string, index: number) => {
    onChange(v)
    if (containerRef.current) {
      isUserScrolling.current = true
      containerRef.current.scrollTo({
        top: index * itemHeight,
        behavior: 'smooth'
      })
      setTimeout(() => {
        isUserScrolling.current = false
      }, 300)
    }
  }

  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</span>
      )}
      <div className="relative h-[132px] w-24 overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700">
        {/* Highlight for selected item */}
        <div className="absolute top-[44px] left-1 right-1 h-[44px] bg-white dark:bg-gray-500 rounded-lg pointer-events-none z-0 shadow-md border border-blue-300 dark:border-blue-500" />

        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 right-0 h-[44px] bg-gradient-to-b from-gray-200 dark:from-gray-700 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[44px] bg-gradient-to-t from-gray-200 dark:from-gray-700 to-transparent pointer-events-none z-10" />

        {/* Scrollable container */}
        <div
          ref={containerRef}
          className="h-full overflow-y-scroll overscroll-contain relative z-20"
          onScroll={handleScroll}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            paddingTop: itemHeight,
            paddingBottom: itemHeight,
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {values.map((v, i) => (
            <div
              key={i}
              className={`h-[44px] flex items-center justify-center cursor-pointer transition-all select-none ${
                i === currentIndex
                  ? 'text-gray-900 dark:text-white font-bold text-xl'
                  : 'text-gray-400 dark:text-gray-500 text-base'
              }`}
              onClick={() => handleItemClick(v, i)}
            >
              {v}{suffix && i === currentIndex ? suffix : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
