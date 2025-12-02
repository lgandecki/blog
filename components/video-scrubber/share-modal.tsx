'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Share2, Copy, Check, X, Link2 } from 'lucide-react'
import styles from './share-modal.module.css'

export interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  currentTime: number
  duration: number
  formatTime: (seconds: number) => string
  className?: string
}

// Parse seconds to compact format like "3m6s" or "1h2m30s"
function formatCompactTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  let result = ''
  if (h > 0) result += `${h}h`
  if (m > 0) result += `${m}m`
  if (s > 0 || result === '') result += `${s}s`
  return result
}

// Parse compact time format back to seconds
export function parseCompactTime(timeStr: string): number | null {
  if (!timeStr) return null

  const regex = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/
  const match = timeStr.match(regex)

  if (!match) return null

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  return hours * 3600 + minutes * 60 + seconds
}

export function ShareModal({
  isOpen,
  onClose,
  currentTime,
  duration,
  formatTime,
  className,
}: ShareModalProps) {
  const [startTime, setStartTime] = useState(currentTime)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [includeEnd, setIncludeEnd] = useState(false)
  const [copied, setCopied] = useState(false)
  const [startInput, setStartInput] = useState('')
  const [endInput, setEndInput] = useState('')
  const [isClosing, setIsClosing] = useState(false)

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200) // Match animation duration
  }, [onClose])

  // Update start time when modal opens
  useEffect(() => {
    if (isOpen) {
      setStartTime(currentTime)
      setStartInput(formatCompactTime(currentTime))
      setCopied(false)
      setIsClosing(false)
    }
  }, [isOpen, currentTime])

  // Update end input when endTime changes
  useEffect(() => {
    if (endTime !== null) {
      setEndInput(formatCompactTime(endTime))
    }
  }, [endTime])

  const generateUrl = useCallback(() => {
    const url = new URL(window.location.href)
    // Clear existing params
    url.searchParams.delete('t')
    url.searchParams.delete('e')

    url.searchParams.set('t', formatCompactTime(startTime))
    if (includeEnd && endTime !== null) {
      url.searchParams.set('e', formatCompactTime(endTime))
    }
    return url.toString()
  }, [startTime, endTime, includeEnd])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [generateUrl])

  const handleStartTimeChange = (value: string) => {
    setStartInput(value)
    const parsed = parseCompactTime(value)
    if (parsed !== null && parsed >= 0 && parsed <= duration) {
      setStartTime(parsed)
    }
  }

  const handleEndTimeChange = (value: string) => {
    setEndInput(value)
    const parsed = parseCompactTime(value)
    if (parsed !== null && parsed >= startTime && parsed <= duration) {
      setEndTime(parsed)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleEndInputFocus = () => {
    if (!includeEnd) {
      setIncludeEnd(true)
      if (endTime === null) {
        const defaultEnd = Math.min(startTime + 30, duration)
        setEndTime(defaultEnd)
        setEndInput(formatCompactTime(defaultEnd))
      }
    }
  }

  // Track if mounted for portal
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div className={cn(styles.overlay, isClosing && styles.closing, className)} onClick={handleOverlayClick}>
      <div className={styles.card}>
        <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className={styles.header}>
          <div className={styles.icon}>
            <Share2 size={22} />
          </div>
          <div className={styles.headerText}>
            <h2 className={styles.title}>Share Video</h2>
            <p className={styles.subtitle}>
              Create a link to share a specific moment or segment
            </p>
          </div>
        </div>

        <div className={styles.form}>
          <div className={styles.timeInputs}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Start time</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  className={styles.timeInput}
                  value={startInput}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  placeholder="0s"
                />
                <span className={styles.timePreview}>{formatTime(startTime)}</span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabelRow}>
                <input
                  type="checkbox"
                  checked={includeEnd}
                  onChange={(e) => {
                    setIncludeEnd(e.target.checked)
                    if (e.target.checked && endTime === null) {
                      const defaultEnd = Math.min(startTime + 30, duration)
                      setEndTime(defaultEnd)
                      setEndInput(formatCompactTime(defaultEnd))
                    }
                  }}
                  className={styles.checkbox}
                />
                <span className={styles.inputLabel}>End time (optional)</span>
              </label>
              <div
                className={cn(styles.inputWrapper, !includeEnd && styles.disabled)}
                onClick={handleEndInputFocus}
              >
                <input
                  type="text"
                  className={styles.timeInput}
                  value={endInput}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  onFocus={handleEndInputFocus}
                  placeholder="0s"
                />
                <span className={styles.timePreview}>
                  {includeEnd && endTime !== null ? formatTime(endTime) : '--:--'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.urlSection}>
            <label className={styles.inputLabel}>Shareable link</label>
            <div className={styles.urlWrapper}>
              <Link2 size={16} className={styles.urlIcon} />
              <input
                type="text"
                className={styles.urlInput}
                value={generateUrl()}
                readOnly
              />
              <button
                className={cn(styles.copyButton, copied && styles.copied)}
                onClick={handleCopy}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <p className={styles.hint}>
            Use format like <code>3m6s</code> or <code>1h2m30s</code>
          </p>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
