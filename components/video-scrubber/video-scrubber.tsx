'use client'

import { useState } from 'react'
import {
  Play,
  Pause,
  X,
  Clock,
  List,
  PanelRightClose,
  PanelRightOpen,
  Film,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './video-scrubber.module.css'
import mediaRichTheme from './themes/media-rich.module.css'

export interface Timestamp {
  time: string
  label: string
  current?: boolean
}

export interface PlaylistItem {
  id: string
  title: string
  thumbnail?: string
  current?: boolean
}

export interface VideoScrubberProps {
  theme?: 'media-rich'
  title: string
  timestamps?: Timestamp[]
  playlist?: PlaylistItem[]
  currentTime?: string
  totalTime?: string
  isPlaying?: boolean
  speed?: number
  skipMute?: boolean
  sidebarOpen?: boolean
  onSidebarToggle?: (open: boolean) => void
  onTimestampClick?: (time: string) => void
  onPlaylistItemClick?: (id: string) => void
  onPlayToggle?: () => void
  onSpeedChange?: (speed: number) => void
  onSkipMuteChange?: (enabled: boolean) => void
  children?: React.ReactNode
  className?: string
}

const SPEEDS = [0.5, 1, 1.5, 2]

export function VideoScrubber({
  theme = 'media-rich',
  title,
  timestamps = [],
  playlist = [],
  currentTime = '00:00',
  totalTime = '00:00',
  isPlaying = false,
  speed = 1,
  skipMute = false,
  sidebarOpen: controlledSidebarOpen,
  onSidebarToggle,
  onTimestampClick,
  onPlaylistItemClick,
  onPlayToggle,
  onSpeedChange,
  onSkipMuteChange,
  children,
  className,
}: VideoScrubberProps) {
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState<'timestamps' | 'playlist'>(
    'timestamps'
  )
  const [internalSpeed, setInternalSpeed] = useState(speed)
  const [internalSkipMute, setInternalSkipMute] = useState(skipMute)

  const themeStyles = mediaRichTheme
  const sidebarOpen = controlledSidebarOpen ?? internalSidebarOpen

  const handleSidebarToggle = (open: boolean) => {
    if (onSidebarToggle) {
      onSidebarToggle(open)
    } else {
      setInternalSidebarOpen(open)
    }
  }

  const handleSpeedChange = (newSpeed: number) => {
    if (onSpeedChange) {
      onSpeedChange(newSpeed)
    } else {
      setInternalSpeed(newSpeed)
    }
  }

  const handleSkipMuteChange = (enabled: boolean) => {
    if (onSkipMuteChange) {
      onSkipMuteChange(enabled)
    } else {
      setInternalSkipMute(enabled)
    }
  }

  const currentSpeed = onSpeedChange ? speed : internalSpeed
  const currentSkipMute = onSkipMuteChange ? skipMute : internalSkipMute

  return (
    <div
      className={cn(styles.wrapper, themeStyles.wrapper, className)}
      data-theme={theme}
    >
      <div className={styles.main}>
        {/* Video container */}
        <div
          className={cn(
            styles.videoContainer,
            sidebarOpen && styles.sidebarOpen
          )}
        >
          <div className={cn(styles.videoArea, themeStyles.videoArea)}>
            <div
              className={cn(
                styles.videoPlaceholder,
                themeStyles.videoPlaceholder
              )}
            >
              {/* Video element will be placed here */}
              <Film size={48} strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside
          className={cn(
            styles.sidebar,
            themeStyles.sidebar,
            sidebarOpen && styles.open
          )}
        >
          <div className={cn(styles.sidebarHeader, themeStyles.sidebarHeader)}>
            <h2 className={cn(styles.sidebarTitle, themeStyles.sidebarTitle)}>
              {title}
            </h2>
            <button
              className={cn(styles.sidebarClose, themeStyles.sidebarClose)}
              onClick={() => handleSidebarToggle(false)}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* View toggle */}
          <div className={cn(styles.viewToggle, themeStyles.viewToggle)}>
            <button
              className={cn(
                styles.viewToggleBtn,
                themeStyles.viewToggleBtn,
                activeView === 'timestamps' && themeStyles.viewToggleBtnActive
              )}
              onClick={() => setActiveView('timestamps')}
            >
              <Clock size={14} />
              <span>Timestamps</span>
            </button>
            <button
              className={cn(
                styles.viewToggleBtn,
                themeStyles.viewToggleBtn,
                activeView === 'playlist' && themeStyles.viewToggleBtnActive
              )}
              onClick={() => setActiveView('playlist')}
            >
              <List size={14} />
              <span>Playlist</span>
            </button>
          </div>

          {/* Content */}
          <div className={cn(styles.sidebarContent, themeStyles.sidebarContent)}>
            {activeView === 'timestamps' ? (
              <div className={styles.timestampList}>
                {timestamps.map((ts, i) => (
                  <button
                    key={i}
                    className={cn(
                      styles.timestampItem,
                      themeStyles.timestampItem,
                      ts.current && themeStyles.timestampItemCurrent
                    )}
                    onClick={() => onTimestampClick?.(ts.time)}
                  >
                    <span
                      className={cn(
                        styles.timestampTime,
                        themeStyles.timestampTime
                      )}
                    >
                      {ts.time}
                    </span>
                    <span
                      className={cn(
                        styles.timestampLabel,
                        themeStyles.timestampLabel
                      )}
                    >
                      {ts.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.playlistList}>
                {playlist.map((item) => (
                  <button
                    key={item.id}
                    className={cn(
                      styles.playlistItem,
                      themeStyles.playlistItem,
                      item.current && themeStyles.playlistItemCurrent
                    )}
                    onClick={() => onPlaylistItemClick?.(item.id)}
                  >
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt=""
                        className={cn(
                          styles.playlistThumb,
                          themeStyles.playlistThumb
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          styles.playlistThumbPlaceholder,
                          themeStyles.playlistThumbPlaceholder
                        )}
                      >
                        <Film size={16} />
                      </div>
                    )}
                    <span
                      className={cn(
                        styles.playlistTitle,
                        themeStyles.playlistTitle
                      )}
                    >
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Controls bar */}
      <div className={cn(styles.controlsBar, themeStyles.controlsBar)}>
        <button
          className={cn(styles.playButton, themeStyles.playButton)}
          onClick={onPlayToggle}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <span className={cn(styles.timeDisplay, themeStyles.timeDisplay)}>
          {currentTime} / {totalTime}
        </span>

        <div className={styles.controlsSpacer} />

        {/* Speed controls */}
        <div className={cn(styles.speedControls, themeStyles.speedControls)}>
          {SPEEDS.map((s) => (
            <button
              key={s}
              className={cn(
                styles.speedBtn,
                themeStyles.speedBtn,
                currentSpeed === s && themeStyles.speedBtnActive
              )}
              onClick={() => handleSpeedChange(s)}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Skip mute checkbox */}
        <label className={cn(styles.skipMuteControl, themeStyles.skipMuteControl)}>
          <input
            type="checkbox"
            className={cn(styles.skipMuteCheckbox, themeStyles.skipMuteCheckbox)}
            checked={currentSkipMute}
            onChange={(e) => handleSkipMuteChange(e.target.checked)}
          />
          <span className={cn(styles.skipMuteLabel, themeStyles.skipMuteLabel)}>
            Skip mute
          </span>
        </label>

        {/* Sidebar toggle */}
        <button
          className={cn(styles.sidebarToggle, themeStyles.sidebarToggle)}
          onClick={() => handleSidebarToggle(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? (
            <PanelRightClose size={18} />
          ) : (
            <PanelRightOpen size={18} />
          )}
        </button>
      </div>

      {/* Filmstrip slot */}
      <div className={cn(styles.filmstripSlot, themeStyles.filmstripSlot)}>
        {children || (
          <div
            className={cn(
              styles.filmstripPlaceholder,
              themeStyles.filmstripPlaceholder
            )}
          >
            filmstrip canvas
          </div>
        )}
      </div>
    </div>
  )
}
