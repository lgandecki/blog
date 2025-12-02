'use client'

import { cn } from '@/lib/utils'
import { Play, Check } from 'lucide-react'
import styles from './video-tutorial.module.css'

export interface TutorialActions {
  scrub: boolean
  space: boolean
  arrows: boolean
}

export interface VideoTutorialProps {
  actions: TutorialActions
  isAllComplete: boolean
  isVisible: boolean
  isFadingOut: boolean
  completedCount: number
  totalCount: number
  className?: string
}

export function VideoTutorial({
  actions,
  isAllComplete,
  isVisible,
  isFadingOut,
  completedCount,
  totalCount,
  className,
}: VideoTutorialProps) {
  if (!isVisible) return null

  const progressPercent = (completedCount / totalCount) * 100
  const progressText = isAllComplete
    ? 'All done! You got this.'
    : `${completedCount} of ${totalCount} completed`

  return (
    <div
      className={cn(
        styles.overlay,
        isFadingOut && styles.fadeOut,
        className
      )}
    >
      <div className={cn(styles.card, isAllComplete && styles.allComplete)}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <Play size={22} fill="currentColor" />
          </div>
          <div className={styles.headerText}>
            <h2 className={styles.title}>Quick Controls</h2>
            <p className={styles.subtitle}>
              Master these shortcuts to navigate your video
            </p>
          </div>
        </div>

        <div className={styles.items}>
          <div
            className={cn(styles.item, actions.scrub && styles.completed)}
            data-action="scrub"
          >
            <div className={styles.checkbox}>
              <Check className={styles.checkIcon} size={16} strokeWidth={3} />
            </div>
            <div className={styles.content}>
              <div className={styles.keys}>
                <kbd className={styles.keyHold}>Hold & Drag</kbd>
              </div>
              <span className={styles.label}>on timeline to scrub through video</span>
            </div>
          </div>

          <div
            className={cn(styles.item, actions.space && styles.completed)}
            data-action="space"
          >
            <div className={styles.checkbox}>
              <Check className={styles.checkIcon} size={16} strokeWidth={3} />
            </div>
            <div className={styles.content}>
              <div className={styles.keys}>
                <kbd>Space</kbd>
              </div>
              <span className={styles.label}>play or pause the video</span>
            </div>
          </div>

          <div
            className={cn(styles.item, actions.arrows && styles.completed)}
            data-action="arrows"
          >
            <div className={styles.checkbox}>
              <Check className={styles.checkIcon} size={16} strokeWidth={3} />
            </div>
            <div className={styles.content}>
              <div className={styles.keys}>
                <kbd>&larr;</kbd>
                <kbd>&rarr;</kbd>
              </div>
              <span className={styles.label}>step through frames</span>
            </div>
          </div>
        </div>

        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className={styles.progressText}>{progressText}</span>
        </div>
      </div>
    </div>
  )
}
