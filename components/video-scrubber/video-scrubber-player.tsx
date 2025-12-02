"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  X,
  Clock,
  List,
  PanelRightClose,
  PanelRightOpen,
  Gauge,
  Terminal,
  Globe,
  Code,
  FileText,
  MonitorPlay,
  BookOpen,
  Search,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import styles from "./video-scrubber.module.css";
import mediaRichTheme from "./themes/media-rich.module.css";
import { useVideoScrubber, VideoScrubberConfig } from "./use-video-scrubber";
import { useTutorial } from "./use-tutorial";
import { VideoTutorial } from "./video-tutorial";

export interface Activity {
  app: string;
  title: string;
  path?: string;
  startTime: number;
}

// App icon types
type IconType = "lucide" | "svg";

interface AppIconConfig {
  type: IconType;
  icon?: typeof Terminal;
  svgPath?: string;
  color: string;
}

// App icon mapping
const APP_ICONS: Record<string, AppIconConfig> = {
  Warp: { type: "lucide", icon: Terminal, color: "#d4a853" },
  Arc: { type: "lucide", icon: Globe, color: "#6366f1" },
  Code: { type: "lucide", icon: Code, color: "#007acc" },
  WebStorm: { type: "lucide", icon: Code, color: "#00d8ff" },
  Obsidian: { type: "lucide", icon: FileText, color: "#7c3aed" },
  ChatGPT: { type: "svg", svgPath: "/assets/chatgpt-logo.svg", color: "#10a37f" },
  "Claude Code": { type: "svg", svgPath: "/assets/claude.svg", color: "#d97757" },
  BookGenius: { type: "lucide", icon: BookOpen, color: "#d4a853" },
  default: { type: "lucide", icon: MonitorPlay, color: "#808080" },
};

// Transform activity based on special cases
function transformActivity(activity: { app: string; title: string; path?: string }) {
  // ChatGPT: Arc with path starting with "chatgpt"
  if (activity.app === "Arc" && activity.path?.toLowerCase().startsWith("chatgpt")) {
    return { ...activity, app: "ChatGPT" };
  }
  // BookGenius: Arc with title containing "BookGenius" or "BookGeniusz"
  if (activity.app === "Arc" && /bookgeniusz?/i.test(activity.title)) {
    return { ...activity, app: "BookGenius" };
  }
  // Claude Code: Warp with title starting with "✳"
  if (activity.app === "Warp" && activity.title.startsWith("✳")) {
    return { ...activity, app: "Claude Code", title: activity.title.slice(1).trim() };
  }
  return activity;
}

function getAppIcon(app: string): AppIconConfig {
  return APP_ICONS[app] || APP_ICONS.default;
}

export interface PlaylistItem {
  id: string;
  title: string;
  thumbnail?: string;
}

export interface VideoScrubberPlayerProps {
  theme?: "media-rich";
  title: string;
  config: VideoScrubberConfig;
  playlist?: PlaylistItem[];
  activities?: Activity[];
  className?: string;
}

const SPEEDS = [0.5, 1, 1.5, 2];

// Browser max playback rate is 16x
const MAX_SPEED = 16;

// Convert slider position (0-100) to actual speed (1-16) using exponential curve
// This gives finer control at lower speeds
function sliderToSpeed(sliderValue: number): number {
  // Use exponential: speed = e^(ln(MAX_SPEED) * sliderValue / 100)
  // At 0: speed = 1, at 100: speed = 16
  const speed = Math.exp((Math.log(MAX_SPEED) * sliderValue) / 100);
  // Round to 1 decimal place for cleaner display
  return Math.round(speed * 10) / 10;
}

// Convert actual speed (1-16) back to slider position (0-100)
function speedToSlider(speed: number): number {
  // Inverse of above: sliderValue = 100 * ln(speed) / ln(MAX_SPEED)
  return (100 * Math.log(speed)) / Math.log(MAX_SPEED);
}

export function VideoScrubberPlayer({
  theme = "media-rich",
  title,
  config,
  playlist = [],
  activities = [],
  className,
}: VideoScrubberPlayerProps) {
  // Tutorial state
  const tutorial = useTutorial();

  // Tutorial callbacks - wrapped in useCallback to avoid re-creating on every render
  const handleScrub = useCallback(() => {
    tutorial.complete("scrub");
  }, [tutorial]);

  const handleSpaceKey = useCallback(() => {
    tutorial.complete("space");
  }, [tutorial]);

  const handleArrowKey = useCallback(() => {
    tutorial.complete("arrows");
  }, [tutorial]);

  const scrubber = useVideoScrubber(config, {
    onScrub: handleScrub,
    onSpaceKey: handleSpaceKey,
    onArrowKey: handleArrowKey,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<"timestamps" | "playlist">("timestamps");
  const [showSpeedSlider, setShowSpeedSlider] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const speedSliderRef = useRef<HTMLDivElement>(null);
  const sidebarContentRef = useRef<HTMLDivElement>(null);
  const timestampItemsRef = useRef<Map<number, HTMLButtonElement>>(new Map());

  const themeStyles = mediaRichTheme;

  // Check if current speed is a custom speed (not one of the presets)
  const isCustomSpeed = !SPEEDS.includes(scrubber.speed) && scrubber.speed > 2;

  // Close speed slider when clicking outside
  useEffect(() => {
    if (!showSpeedSlider) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (speedSliderRef.current && !speedSliderRef.current.contains(e.target as Node)) {
        setShowSpeedSlider(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSpeedSlider]);

  // Convert activities to timestamps based on current time
  // Use 300ms offset to match the seek offset for recording delay
  const TIMESTAMP_OFFSET = 0.3;
  const { timestamps, currentIndex, filteredTimestamps } = useMemo(() => {
    let currentIdx = -1;
    const items = activities.map((activity, index) => {
      const nextActivity = activities[index + 1];
      const adjustedStart = activity.startTime + TIMESTAMP_OFFSET;
      const adjustedNextStart = nextActivity ? nextActivity.startTime + TIMESTAMP_OFFSET : Infinity;
      const isActive = scrubber.currentTime >= adjustedStart && scrubber.currentTime < adjustedNextStart;
      if (isActive) currentIdx = index;
      // Transform activity for special cases (ChatGPT, Claude Code)
      const transformed = transformActivity(activity);
      return {
        time: scrubber.formatTime(activity.startTime),
        app: transformed.app,
        title: transformed.title,
        path: transformed.path,
        current: isActive,
        startTime: activity.startTime,
        originalIndex: index,
      };
    });

    // Filter by search query
    const query = searchQuery.toLowerCase().trim();
    const filtered = query
      ? items.filter(
          (ts) =>
            ts.app.toLowerCase().includes(query) ||
            ts.title.toLowerCase().includes(query) ||
            (ts.path && ts.path.toLowerCase().includes(query))
        )
      : items;

    return { timestamps: items, currentIndex: currentIdx, filteredTimestamps: filtered };
  }, [activities, scrubber.currentTime, scrubber.formatTime, searchQuery]);

  // Auto-scroll to keep current activity roughly centered
  useEffect(() => {
    if (currentIndex < 0 || activeView !== "timestamps") return;

    const container = sidebarContentRef.current;
    const currentItem = timestampItemsRef.current.get(currentIndex);
    if (!container || !currentItem) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = currentItem.getBoundingClientRect();

    // Calculate where the item is relative to the container
    const itemTop = itemRect.top - containerRect.top + container.scrollTop;
    const itemCenter = itemTop + itemRect.height / 2;
    const containerCenter = container.clientHeight / 2;

    // Scroll so the item is roughly centered
    const targetScroll = itemCenter - containerCenter;

    container.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: "smooth",
    });
  }, [currentIndex, activeView]);

  // Find current playlist item
  const playlistWithCurrent = useMemo(() => {
    // For now, first item is current
    return playlist.map((item, index) => ({
      ...item,
      current: index === 0,
    }));
  }, [playlist]);

  const handleTimestampClick = (startTime: number) => {
    scrubber.seekToExactTime(startTime);
  };

  return (
    <div className={cn(styles.wrapper, themeStyles.wrapper, className)} data-theme={theme}>
      <div className={styles.main}>
        {/* Video container */}
        <div className={cn(styles.videoContainer, sidebarOpen && styles.sidebarOpen)}>
          <div className={cn(styles.videoArea, themeStyles.videoArea)}>
            {/* Preview canvas (shown during scrubbing) */}
            <canvas
              ref={scrubber.previewCanvasRef}
              className={cn(styles.videoCanvas, themeStyles.videoCanvas)}
              style={{ display: scrubber.showVideo ? "none" : "block" }}
            />
            {/* Video element (shown during playback) */}
            <video
              ref={scrubber.videoRef}
              src={scrubber.videoPath}
              className={cn(styles.videoElement, themeStyles.videoElement)}
              style={{ display: scrubber.showVideo ? "block" : "none" }}
              playsInline
              preload="auto"
            />
            {/* Loading indicator */}
            {scrubber.isLoading && (
              <div className={cn(styles.loadingOverlay, themeStyles.loadingOverlay)}>
                <div className={cn(styles.loadingSpinner, themeStyles.loadingSpinner)} />
                <span>Loading...</span>
              </div>
            )}

            {/* Tutorial overlay */}
            <VideoTutorial
              actions={tutorial.actions}
              isAllComplete={tutorial.isAllComplete}
              isVisible={tutorial.isVisible && !scrubber.isLoading}
              isFadingOut={tutorial.isFadingOut}
              completedCount={tutorial.completedCount}
              totalCount={tutorial.totalCount}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className={cn(styles.sidebar, themeStyles.sidebar, sidebarOpen && styles.open)}>
          <div className={cn(styles.sidebarHeader, themeStyles.sidebarHeader)}>
            <h2 className={cn(styles.sidebarTitle, themeStyles.sidebarTitle)}>{title}</h2>
            <button
              className={cn(styles.sidebarClose, themeStyles.sidebarClose)}
              onClick={() => setSidebarOpen(false)}
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
                activeView === "timestamps" && themeStyles.viewToggleBtnActive
              )}
              onClick={() => setActiveView("timestamps")}
            >
              <Clock size={14} />
              <span>Timestamps</span>
            </button>
            <button
              className={cn(
                styles.viewToggleBtn,
                themeStyles.viewToggleBtn,
                activeView === "playlist" && themeStyles.viewToggleBtnActive
              )}
              onClick={() => setActiveView("playlist")}
            >
              <List size={14} />
              <span>Playlist</span>
            </button>
          </div>

          {/* Search input - only show in timestamps view */}
          {activeView === "timestamps" && (
            <div className={cn(styles.searchContainer, themeStyles.searchContainer)}>
              <Search size={14} className={cn(styles.searchIcon, themeStyles.searchIcon)} />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(styles.searchInput, themeStyles.searchInput)}
              />
            </div>
          )}

          {/* Content */}
          <div ref={sidebarContentRef} className={cn(styles.sidebarContent, themeStyles.sidebarContent)}>
            {activeView === "timestamps" ? (
              <div className={styles.timestampList}>
                {filteredTimestamps.map((ts) => {
                  const appInfo = getAppIcon(ts.app);
                  return (
                    <button
                      key={ts.originalIndex}
                      ref={(el) => {
                        if (el) {
                          timestampItemsRef.current.set(ts.originalIndex, el);
                        } else {
                          timestampItemsRef.current.delete(ts.originalIndex);
                        }
                      }}
                      className={cn(
                        styles.timestampItem,
                        themeStyles.timestampItem,
                        ts.current && themeStyles.timestampItemCurrent
                      )}
                      onClick={() => handleTimestampClick(ts.startTime)}
                    >
                      <div className={styles.timestampIcon} style={{ color: appInfo.color }}>
                        {appInfo.type === "svg" && appInfo.svgPath ? (
                          <Image src={appInfo.svgPath} alt={ts.app} width={16} height={16} />
                        ) : (
                          appInfo.icon && <appInfo.icon size={16} />
                        )}
                      </div>
                      <div className={styles.timestampInfo}>
                        <div className={styles.timestampTitleRow}>
                          <span className={cn(styles.timestampApp, themeStyles.timestampApp)}>{ts.app}</span>
                          <span className={cn(styles.timestampTime, themeStyles.timestampTime)}>{ts.time}</span>
                        </div>
                        <span className={cn(styles.timestampLabel, themeStyles.timestampLabel)}>{ts.title}</span>
                        {ts.path && (
                          <span className={cn(styles.timestampPath, themeStyles.timestampPath)}>{ts.path}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className={styles.playlistList}>
                {playlistWithCurrent.map((item) => (
                  <button
                    key={item.id}
                    className={cn(
                      styles.playlistItem,
                      themeStyles.playlistItem,
                      item.current && themeStyles.playlistItemCurrent
                    )}
                    onClick={() => {}}
                  >
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt=""
                        className={cn(styles.playlistThumb, themeStyles.playlistThumb)}
                      />
                    ) : (
                      <div className={cn(styles.playlistThumbPlaceholder, themeStyles.playlistThumbPlaceholder)} />
                    )}
                    <span className={cn(styles.playlistTitle, themeStyles.playlistTitle)}>{item.title}</span>
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
          onClick={scrubber.togglePlayback}
          aria-label={scrubber.isPlaying ? "Pause" : "Play"}
        >
          {scrubber.isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <span className={cn(styles.timeDisplay, themeStyles.timeDisplay)}>
          {scrubber.formatTime(scrubber.currentTime)} / {scrubber.formatTime(scrubber.duration)}
        </span>

        <div className={styles.controlsSpacer} />

        {/* Speed controls */}
        <div className={cn(styles.speedControls, themeStyles.speedControls)}>
          {SPEEDS.map((s) => (
            <button
              key={s}
              className={cn(styles.speedBtn, themeStyles.speedBtn, scrubber.speed === s && themeStyles.speedBtnActive)}
              onClick={() => scrubber.setSpeed(s)}
            >
              {s}x
            </button>
          ))}
          {/* Custom speed button */}
          <div className={styles.customSpeedWrapper} ref={speedSliderRef}>
            <button
              className={cn(
                styles.speedBtn,
                styles.customSpeedBtn,
                themeStyles.speedBtn,
                isCustomSpeed && themeStyles.speedBtnActive
              )}
              onClick={() => setShowSpeedSlider(!showSpeedSlider)}
              aria-label="Custom speed"
              title="Custom speed (1x - 16x)"
            >
              {isCustomSpeed ? `${scrubber.speed}x` : <Gauge size={14} />}
            </button>
            {showSpeedSlider && (
              <div className={cn(styles.speedSliderPopup, themeStyles.speedSliderPopup)}>
                <div className={styles.speedSliderHeader}>
                  <span className={styles.speedSliderLabel}>Speed</span>
                  <span className={cn(styles.speedSliderValue, themeStyles.speedSliderValue)}>{scrubber.speed}x</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={speedToSlider(Math.max(1, Math.min(MAX_SPEED, scrubber.speed)))}
                  onChange={(e) => {
                    const speed = sliderToSpeed(Number(e.target.value));
                    scrubber.setSpeed(speed);
                  }}
                  className={cn(styles.speedSlider, themeStyles.speedSlider)}
                />
                <div className={styles.speedSliderTicks}>
                  <span>1x</span>
                  <span>4x</span>
                  <span>16x</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Skip silence checkbox */}
        <label className={cn(styles.skipMuteControl, themeStyles.skipMuteControl)}>
          <input
            type="checkbox"
            className={cn(styles.skipMuteCheckbox, themeStyles.skipMuteCheckbox)}
            checked={scrubber.skipSilence}
            onChange={(e) => scrubber.setSkipSilence(e.target.checked)}
          />
          <span className={cn(styles.skipMuteLabel, themeStyles.skipMuteLabel)}>Skip silence</span>
        </label>

        {/* Sidebar toggle */}
        <button
          className={cn(styles.sidebarToggle, themeStyles.sidebarToggle)}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
        </button>
      </div>

      {/* Filmstrip container */}
      <div className={cn(styles.filmstripSlot, themeStyles.filmstripSlot)}>
        <div
          className={cn(styles.filmstripContainer, themeStyles.filmstripContainer)}
          onMouseDown={scrubber.startScrubbing}
        >
          <canvas
            ref={scrubber.filmstripCanvasRef}
            className={cn(styles.filmstripCanvas, themeStyles.filmstripCanvas)}
          />
          <div
            ref={scrubber.filmstripPlayheadRef}
            className={cn(styles.filmstripPlayhead, themeStyles.filmstripPlayhead)}
          />
        </div>
      </div>
    </div>
  );
}
