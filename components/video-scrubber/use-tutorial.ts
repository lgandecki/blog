'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'video-scrubber-tutorial'

export interface TutorialActions {
  scrub: boolean
  space: boolean
  arrows: boolean
}

export interface UseTutorialReturn {
  actions: TutorialActions
  isAllComplete: boolean
  isVisible: boolean
  isFadingOut: boolean
  completedCount: number
  totalCount: number
  complete: (action: keyof TutorialActions) => void
  reset: () => void
}

export function useTutorial(): UseTutorialReturn {
  const [actions, setActions] = useState<TutorialActions>({
    scrub: false,
    space: false,
    arrows: false,
  })
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const state = JSON.parse(saved) as Partial<TutorialActions>
        setActions((prev) => ({ ...prev, ...state }))

        // If all are already complete, hide immediately
        if (state.scrub && state.space && state.arrows) {
          setIsVisible(false)
        }
      } catch (e) {
        console.warn('Failed to parse tutorial state:', e)
      }
    }
  }, [])

  const save = useCallback((newActions: TutorialActions) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newActions))
  }, [])

  const complete = useCallback(
    (action: keyof TutorialActions) => {
      setActions((prev) => {
        if (prev[action]) return prev // Already complete

        const newActions = { ...prev, [action]: true }
        save(newActions)

        // Check if all complete
        if (newActions.scrub && newActions.space && newActions.arrows) {
          // Start fade out animation
          setIsFadingOut(true)
          setTimeout(() => {
            setIsVisible(false)
          }, 2000) // Allow time for celebration + fade
        }

        return newActions
      })
    },
    [save]
  )

  const reset = useCallback(() => {
    if (typeof window === 'undefined') return

    localStorage.removeItem(STORAGE_KEY)
    setActions({ scrub: false, space: false, arrows: false })
    setIsVisible(true)
    setIsFadingOut(false)
  }, [])

  const isAllComplete = actions.scrub && actions.space && actions.arrows
  const completedCount = Object.values(actions).filter(Boolean).length
  const totalCount = 3

  return {
    actions,
    isAllComplete,
    isVisible,
    isFadingOut,
    completedCount,
    totalCount,
    complete,
    reset,
  }
}
