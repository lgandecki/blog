"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface SpriteMetadata {
  frameCount: number;
  framesPerSheet: number;
  numSheets: number;
  sheetCols: number;
  previewSize: { width: number; height: number };
  thumbnailSize: { width: number; height: number };
  thumbnailCols: number;
  interval: number;
  duration: number;
  frameTimes?: number[];
  speechSegments?: { start: number; end: number }[];
}

export interface VideoScrubberConfig {
  videoPath: string;
  previewSpritePathPrefix: string;
  timelineSpritePath: string;
  metadataPath: string;
}

export interface VideoScrubberCallbacks {
  onScrub?: () => void;
  onSpaceKey?: () => void;
  onArrowKey?: () => void;
}

export interface PlayableRegion {
  start: number;
  end: number;
}

export function useVideoScrubber(config: VideoScrubberConfig, callbacks?: VideoScrubberCallbacks) {
  // State
  const [metadata, setMetadata] = useState<SpriteMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [skipSilence, setSkipSilence] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showVideo, setShowVideo] = useState(false); // false = show canvas, true = show video

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const filmstripCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const filmstripPlayheadRef = useRef<HTMLDivElement | null>(null);

  // Sprite sheets
  const previewSpritesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const loadingSheetsRef = useRef<Set<number>>(new Set());
  const timelineSpriteRef = useRef<HTMLImageElement | null>(null);

  // Computed regions
  const playableRegionsRef = useRef<PlayableRegion[]>([]);

  // Scrubbing state
  const isScrubbingRef = useRef(false);
  const wasPlayingBeforeScrubRef = useRef(false);
  const pendingScrubXRef = useRef<number | null>(null);
  const scrubRafRef = useRef<number | null>(null);

  // Keep a sync ref for current frame to avoid stale state during rapid scrubbing
  const currentFrameRef = useRef(0);

  // Cached rects
  const filmstripRectRef = useRef<DOMRect | null>(null);

  // Track if we've initialized to avoid re-running setup
  const hasInitializedRef = useRef(false);

  // Load image helper
  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }, []);

  // Load sprite sheet
  const loadSpriteSheet = useCallback(
    async (sheetIndex: number) => {
      if (!metadata) return null;
      if (previewSpritesRef.current.has(sheetIndex) || loadingSheetsRef.current.has(sheetIndex)) {
        return previewSpritesRef.current.get(sheetIndex) || null;
      }

      if (sheetIndex < 0 || sheetIndex >= metadata.numSheets) {
        return null;
      }

      loadingSheetsRef.current.add(sheetIndex);
      const path = `${config.previewSpritePathPrefix}-${sheetIndex}.jpg`;

      try {
        const img = await loadImage(path);
        previewSpritesRef.current.set(sheetIndex, img);
        return img;
      } catch (e) {
        console.error(`Failed to load sprite sheet ${sheetIndex}:`, e);
        return null;
      } finally {
        loadingSheetsRef.current.delete(sheetIndex);
      }
    },
    [metadata, config.previewSpritePathPrefix, loadImage]
  );

  // Preload adjacent sheets
  const preloadAdjacentSheets = useCallback(
    (currentSheetIndex: number) => {
      if (!metadata) return;
      const sheetsToPreload = [currentSheetIndex - 1, currentSheetIndex + 1, currentSheetIndex + 2];

      for (const idx of sheetsToPreload) {
        if (idx >= 0 && idx < metadata.numSheets && !previewSpritesRef.current.has(idx)) {
          loadSpriteSheet(idx);
        }
      }
    },
    [metadata, loadSpriteSheet]
  );

  // Get frame position in sprite sheets
  const getFramePosition = useCallback(
    (frameIndex: number) => {
      if (!metadata) return null;

      const { framesPerSheet, sheetCols, previewSize, thumbnailSize, thumbnailCols } = metadata;

      const sheetIndex = Math.floor(frameIndex / framesPerSheet);
      const frameInSheet = frameIndex % framesPerSheet;
      const col = frameInSheet % sheetCols;
      const row = Math.floor(frameInSheet / sheetCols);

      const thumbCol = frameIndex % thumbnailCols;
      const thumbRow = Math.floor(frameIndex / thumbnailCols);

      return {
        sheetIndex,
        preview: {
          x: col * previewSize.width,
          y: row * previewSize.height,
        },
        thumbnail: {
          x: thumbCol * thumbnailSize.width,
          y: thumbRow * thumbnailSize.height,
        },
      };
    },
    [metadata]
  );

  // Get frame index for time
  const getFrameIndexForTime = useCallback(
    (timeSeconds: number) => {
      if (!metadata) return 0;

      const times = metadata.frameTimes;
      if (times && times.length) {
        let lo = 0,
          hi = times.length - 1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          if (times[mid] < timeSeconds) lo = mid + 1;
          else hi = mid - 1;
        }
        if (lo <= 0) return 0;
        if (lo >= times.length) return times.length - 1;
        return timeSeconds - times[lo - 1] < times[lo] - timeSeconds ? lo - 1 : lo;
      }

      const frameIndex = Math.round(timeSeconds / metadata.interval);
      return Math.max(0, Math.min(frameIndex, metadata.frameCount - 1));
    },
    [metadata]
  );

  // Format time
  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  // Compute playable regions
  const computePlayableRegions = useCallback(() => {
    if (!metadata) return;
    const SPEECH_SEGMENT_BUFFER_SECONDS = 5;
    const segments = metadata.speechSegments || [];

    if (!segments.length) {
      playableRegionsRef.current = [{ start: 0, end: metadata.duration }];
      return;
    }

    const buffered = segments.map((seg) => ({
      start: Math.max(0, seg.start - SPEECH_SEGMENT_BUFFER_SECONDS),
      end: Math.min(metadata.duration, seg.end + SPEECH_SEGMENT_BUFFER_SECONDS),
    }));

    buffered.sort((a, b) => a.start - b.start);
    const merged = [buffered[0]];

    for (let i = 1; i < buffered.length; i++) {
      const last = merged[merged.length - 1];
      const curr = buffered[i];
      if (curr.start <= last.end) {
        last.end = Math.max(last.end, curr.end);
      } else {
        merged.push(curr);
      }
    }

    playableRegionsRef.current = merged;
  }, [metadata]);

  // Check if in playable region
  const isInPlayableRegion = useCallback((time: number) => {
    for (const region of playableRegionsRef.current) {
      if (time >= region.start && time <= region.end) {
        return true;
      }
    }
    return false;
  }, []);

  // Get next playable time
  const getNextPlayableTime = useCallback((time: number) => {
    for (const region of playableRegionsRef.current) {
      if (region.start > time) {
        return region.start;
      }
      if (time >= region.start && time <= region.end) {
        return time;
      }
    }
    return null;
  }, []);

  // Render preview frame
  const renderPreviewFrame = useCallback(
    async (frameIndex: number) => {
      const canvas = previewCanvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || !metadata) return;

      const pos = getFramePosition(frameIndex);
      if (!pos) return;

      let sprite: HTMLImageElement | null | undefined = previewSpritesRef.current.get(pos.sheetIndex);
      if (!sprite) {
        sprite = await loadSpriteSheet(pos.sheetIndex);
        if (!sprite) {
          ctx.fillStyle = "#333";
          ctx.fillRect(0, 0, metadata.previewSize.width, metadata.previewSize.height);
          return;
        }
      }

      ctx.drawImage(
        sprite,
        pos.preview.x,
        pos.preview.y,
        metadata.previewSize.width,
        metadata.previewSize.height,
        0,
        0,
        metadata.previewSize.width,
        metadata.previewSize.height
      );

      preloadAdjacentSheets(pos.sheetIndex);
    },
    [metadata, getFramePosition, loadSpriteSheet, preloadAdjacentSheets]
  );

  // Render filmstrip
  const renderFilmstrip = useCallback(() => {
    const canvas = filmstripCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    const sprite = timelineSpriteRef.current;
    const rect = filmstripRectRef.current;

    if (!canvas || !ctx || !sprite || !rect || !metadata) return;

    const { thumbnailSize, frameCount, thumbnailCols, duration } = metadata;

    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, rect.width, rect.height);

    const displayHeight = rect.height;
    const aspectRatio = thumbnailSize.width / thumbnailSize.height;
    const displayWidth = displayHeight * aspectRatio;
    const numThumbnails = Math.ceil(rect.width / displayWidth) + 1;

    for (let i = 0; i < numThumbnails; i++) {
      const x = i * displayWidth;
      if (x > rect.width) break;

      const progress = x / rect.width;
      const frameIndex = Math.floor(progress * (frameCount - 1));
      const thumbCol = frameIndex % thumbnailCols;
      const thumbRow = Math.floor(frameIndex / thumbnailCols);
      const sx = thumbCol * thumbnailSize.width;
      const sy = thumbRow * thumbnailSize.height;

      ctx.drawImage(sprite, sx, sy, thumbnailSize.width, thumbnailSize.height, x, 0, displayWidth, displayHeight);
    }

    // Draw speech/silence indicator
    const segments = metadata.speechSegments;
    if (segments && segments.length) {
      const barHeight = 6;
      const y = rect.height - barHeight;

      ctx.fillStyle = "rgba(120, 40, 40, 0.9)";
      ctx.fillRect(0, y, rect.width, barHeight);

      ctx.fillStyle = "rgba(50, 180, 80, 0.95)";
      for (const seg of segments) {
        const x1 = (seg.start / duration) * rect.width;
        const x2 = (seg.end / duration) * rect.width;
        ctx.fillRect(x1, y, Math.max(2, x2 - x1), barHeight);
      }
    }
  }, [metadata]);

  // Update playhead position
  const updatePlayhead = useCallback(() => {
    if (!metadata || !filmstripPlayheadRef.current || !filmstripRectRef.current) return;

    const progress = currentFrame / (metadata.frameCount - 1);
    filmstripPlayheadRef.current.style.left = `${progress * filmstripRectRef.current.width}px`;
  }, [metadata, currentFrame]);

  // Seek to frame
  const seekToFrame = useCallback(
    (frameIndex: number) => {
      if (!metadata) return;

      frameIndex = Math.max(0, Math.min(frameIndex, metadata.frameCount - 1));

      // Use ref for sync check to avoid stale state during rapid scrubbing
      if (frameIndex === currentFrameRef.current) {
        return;
      }

      const times = metadata.frameTimes;
      const newTime = times && times[frameIndex] != null ? times[frameIndex] : frameIndex * metadata.interval;

      // Update ref synchronously
      currentFrameRef.current = frameIndex;
      setCurrentFrame(frameIndex);
      setCurrentTime(newTime);
      renderPreviewFrame(frameIndex);

      // Also sync the video element if it exists and we're not scrubbing
      const video = videoRef.current;
      if (video && !isScrubbingRef.current && video.readyState >= 1) {
        video.currentTime = newTime;
      }
    },
    [metadata, renderPreviewFrame]
  );

  // Seek to time (snaps to nearest frame)
  const seekToTime = useCallback(
    (seconds: number) => {
      if (!metadata) return;
      const time = Math.max(0, Math.min(seconds, metadata.duration));
      setCurrentTime(time);
      const frameIndex = getFrameIndexForTime(time);
      seekToFrame(frameIndex);
    },
    [metadata, getFrameIndexForTime, seekToFrame]
  );

  // Seek to exact time (no frame snapping) - useful for timestamp navigation
  // Adds 300ms offset to account for recording delay
  const seekToExactTime = useCallback(
    (seconds: number) => {
      if (!metadata) return;
      const TIMESTAMP_OFFSET = 0.3; // 300ms offset for recording delay
      const time = Math.max(0, Math.min(seconds + TIMESTAMP_OFFSET, metadata.duration));

      // Update the frame for preview display (show low quality immediately)
      const frameIndex = getFrameIndexForTime(time);
      currentFrameRef.current = frameIndex;
      setCurrentFrame(frameIndex);
      setCurrentTime(time);
      renderPreviewFrame(frameIndex);

      // Seek the video element to the exact time, then show high quality
      const video = videoRef.current;
      if (video) {
        const onSeeked = () => {
          setShowVideo(true);
        };

        if (video.readyState >= 1) {
          video.addEventListener("seeked", onSeeked, { once: true });
          video.currentTime = time;
        } else {
          video.addEventListener(
            "loadedmetadata",
            () => {
              video.addEventListener("seeked", onSeeked, { once: true });
              video.currentTime = time;
            },
            { once: true }
          );
        }
      }
    },
    [metadata, getFrameIndexForTime, renderPreviewFrame]
  );

  // Play
  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video || isPlaying) return;

    if (showVideo) {
      setIsPlaying(true);
      video.play();
      return;
    }

    // Seek video to current position then play
    const times = metadata?.frameTimes;
    const targetTime = times && times[currentFrame] != null ? times[currentFrame] : currentTime;

    const onSeeked = () => {
      const newFrame = getFrameIndexForTime(video.currentTime);
      setCurrentTime(video.currentTime);
      currentFrameRef.current = newFrame;
      setCurrentFrame(newFrame);

      setShowVideo(true);
      setIsPlaying(true);
      video.play();
    };

    if (video.readyState >= 1) {
      video.addEventListener("seeked", onSeeked, { once: true });
      video.currentTime = targetTime;
    } else {
      video.addEventListener(
        "loadedmetadata",
        () => {
          video.addEventListener("seeked", onSeeked, { once: true });
          video.currentTime = targetTime;
        },
        { once: true }
      );
    }
  }, [metadata, isPlaying, showVideo, currentFrame, currentTime, getFrameIndexForTime]);

  // Pause
  const pause = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    setIsPlaying(false);
    video.pause();

    const newFrame = getFrameIndexForTime(video.currentTime);
    setCurrentTime(video.currentTime);
    currentFrameRef.current = newFrame;
    setCurrentFrame(newFrame);
  }, [isPlaying, getFrameIndexForTime]);

  // Toggle playback
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Step frame
  const stepFrame = useCallback(
    (delta: number) => {
      pause();
      seekToFrame(currentFrame + delta);
    },
    [pause, currentFrame, seekToFrame]
  );

  // Initialize
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        // Load metadata
        const metaResponse = await fetch(config.metadataPath);
        const meta: SpriteMetadata = await metaResponse.json();
        setMetadata(meta);

        // Load first sprite sheet
        loadingSheetsRef.current.add(0);
        const firstSpritePath = `${config.previewSpritePathPrefix}-0.jpg`;
        const firstSprite = await loadImage(firstSpritePath);
        previewSpritesRef.current.set(0, firstSprite);
        loadingSheetsRef.current.delete(0);

        // Load timeline sprite
        const timelineSprite = await loadImage(config.timelineSpritePath);
        timelineSpriteRef.current = timelineSprite;

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize video scrubber:", error);
        setIsLoading(false);
      }
    };

    init();
  }, [config.metadataPath, config.previewSpritePathPrefix, config.timelineSpritePath, loadImage]);

  // Compute playable regions when metadata loads
  useEffect(() => {
    if (metadata) {
      computePlayableRegions();
    }
  }, [metadata, computePlayableRegions]);

  // Setup canvases when metadata loads - only run once
  useEffect(() => {
    if (!metadata || isLoading) return;
    if (hasInitializedRef.current) return;

    hasInitializedRef.current = true;

    const setupCanvasLayout = () => {
      const previewCanvas = previewCanvasRef.current;
      const filmstripCanvas = filmstripCanvasRef.current;

      if (previewCanvas) {
        previewCanvas.width = metadata.previewSize.width;
        previewCanvas.height = metadata.previewSize.height;
      }

      if (filmstripCanvas) {
        const container = filmstripCanvas.parentElement;
        if (container) {
          filmstripRectRef.current = container.getBoundingClientRect();
          filmstripCanvas.width = filmstripRectRef.current.width * window.devicePixelRatio;
          filmstripCanvas.height = filmstripRectRef.current.height * window.devicePixelRatio;
          const ctx = filmstripCanvas.getContext("2d");
          if (ctx) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
          }
        }
      }
    };

    setupCanvasLayout();

    // Initial render
    renderPreviewFrame(0);
    renderFilmstrip();

    const handleResize = () => {
      setupCanvasLayout();
      // Re-render current frame on resize, not frame 0
      renderPreviewFrame(currentFrameRef.current);
      renderFilmstrip();
      updatePlayhead();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata, isLoading]);

  // Update playhead when frame changes
  useEffect(() => {
    updatePlayhead();
  }, [updatePlayhead, currentFrame]);

  // Switch to high quality video once it's ready after initial load
  useEffect(() => {
    if (isLoading || !metadata || showVideo) return;

    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const onSeeked = () => {
      if (!cancelled) {
        setShowVideo(true);
      }
    };

    const onCanPlay = () => {
      if (cancelled) return;
      video.removeEventListener("canplay", onCanPlay);
      video.addEventListener("seeked", onSeeked, { once: true });
      video.currentTime = 0;
    };

    if (video.readyState >= 1) {
      video.addEventListener("seeked", onSeeked, { once: true });
      video.currentTime = 0;
    } else {
      video.addEventListener("canplay", onCanPlay);
    }

    return () => {
      cancelled = true;
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [isLoading, metadata, showVideo]);

  // Playback sync
  useEffect(() => {
    if (!isPlaying) return;

    const video = videoRef.current;
    if (!video) return;

    const syncUI = () => {
      const newFrame = getFrameIndexForTime(video.currentTime);
      setCurrentTime(video.currentTime);
      currentFrameRef.current = newFrame;
      setCurrentFrame(newFrame);

      // Skip silence
      if (skipSilence && !isInPlayableRegion(video.currentTime)) {
        const nextTime = getNextPlayableTime(video.currentTime);
        if (nextTime !== null) {
          video.currentTime = nextTime;
        } else {
          pause();
        }
      }
    };

    if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
      let frameId: number;
      const onVideoFrame = () => {
        if (!isPlaying) return;
        syncUI();
        frameId = (video as any).requestVideoFrameCallback(onVideoFrame);
      };
      frameId = (video as any).requestVideoFrameCallback(onVideoFrame);
      return () => {
        if (frameId) (video as any).cancelVideoFrameCallback?.(frameId);
      };
    } else {
      const interval = setInterval(syncUI, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, getFrameIndexForTime, skipSilence, isInPlayableRegion, getNextPlayableTime, pause]);

  // Speed control
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
    }
  }, [speed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlayback();
          callbacks?.onSpaceKey?.();
          break;
        case "ArrowLeft":
          e.preventDefault();
          stepFrame(-1);
          callbacks?.onArrowKey?.();
          break;
        case "ArrowRight":
          e.preventDefault();
          stepFrame(1);
          callbacks?.onArrowKey?.();
          break;
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [togglePlayback, stepFrame, callbacks]);

  // Handle scrubbing
  const startScrubbing = useCallback(
    (e: React.MouseEvent) => {
      wasPlayingBeforeScrubRef.current = isPlaying;
      isScrubbingRef.current = true;

      // Switch to canvas view for scrubbing
      if (showVideo) {
        setShowVideo(false);
      }

      // Notify tutorial that scrubbing started
      callbacks?.onScrub?.();

      handleScrub(e);
    },
    [isPlaying, showVideo, callbacks]
  );

  const handleScrub = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const rect = filmstripRectRef.current;
      if (!rect || !metadata) return;

      const x = e.clientX - rect.left;
      const progress = Math.max(0, Math.min(1, x / rect.width));

      // Update playhead immediately
      if (filmstripPlayheadRef.current) {
        filmstripPlayheadRef.current.style.left = `${progress * rect.width}px`;
      }

      // Schedule heavy work
      pendingScrubXRef.current = e.clientX;
      if (!scrubRafRef.current) {
        scrubRafRef.current = requestAnimationFrame(() => {
          scrubRafRef.current = null;
          if (pendingScrubXRef.current !== null && filmstripRectRef.current && metadata) {
            const scrubX = pendingScrubXRef.current - filmstripRectRef.current.left;
            const scrubProgress = Math.max(0, Math.min(1, scrubX / filmstripRectRef.current.width));
            const frameIndex = Math.round(scrubProgress * (metadata.frameCount - 1));
            pendingScrubXRef.current = null;

            if (isPlaying) {
              pause();
            }
            seekToFrame(frameIndex);
          }
        });
      }
    },
    [metadata, isPlaying, pause, seekToFrame]
  );

  const endScrubbing = useCallback(() => {
    if (!isScrubbingRef.current) return;

    isScrubbingRef.current = false;

    // Execute any pending scrub synchronously before cleaning up
    // This ensures clicks without dragging still seek to the clicked position
    if (pendingScrubXRef.current !== null && filmstripRectRef.current && metadata) {
      const scrubX = pendingScrubXRef.current - filmstripRectRef.current.left;
      const scrubProgress = Math.max(0, Math.min(1, scrubX / filmstripRectRef.current.width));
      const frameIndex = Math.round(scrubProgress * (metadata.frameCount - 1));

      const times = metadata.frameTimes;
      const newTime = times && times[frameIndex] != null ? times[frameIndex] : frameIndex * metadata.interval;

      currentFrameRef.current = frameIndex;
      setCurrentFrame(frameIndex);
      setCurrentTime(newTime);
      renderPreviewFrame(frameIndex);
    }

    // Clean up RAF
    if (scrubRafRef.current) {
      cancelAnimationFrame(scrubRafRef.current);
      scrubRafRef.current = null;
    }
    pendingScrubXRef.current = null;

    // Sync video to current frame - use ref for current frame to get sync value
    const video = videoRef.current;
    if (video && metadata) {
      const times = metadata.frameTimes;
      const frame = currentFrameRef.current;
      const targetTime = times && times[frame] != null ? times[frame] : currentTime;

      const onSeeked = () => {
        const newFrame = getFrameIndexForTime(video.currentTime);
        setCurrentTime(video.currentTime);
        currentFrameRef.current = newFrame;
        setCurrentFrame(newFrame);

        // Show video only after seek completes
        setShowVideo(true);

        if (wasPlayingBeforeScrubRef.current) {
          setIsPlaying(true);
          video.play();
        }
      };

      if (video.readyState >= 1) {
        video.addEventListener("seeked", onSeeked, { once: true });
        video.currentTime = targetTime;
      }
    }
  }, [metadata, currentTime, getFrameIndexForTime, renderPreviewFrame]);

  // Global mouse events for scrubbing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbingRef.current) {
        handleScrub(e);
      }
    };

    const handleMouseUp = () => {
      endScrubbing();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleScrub, endScrubbing]);

  return {
    // State
    isLoading,
    isPlaying,
    currentTime,
    currentFrame,
    skipSilence,
    speed,
    metadata,
    duration: metadata?.duration || 0,
    showVideo,

    // Setters
    setSkipSilence,
    setSpeed,

    // Actions
    play,
    pause,
    togglePlayback,
    seekToTime,
    seekToExactTime,
    seekToFrame,
    stepFrame,

    // Refs for DOM elements
    videoRef,
    previewCanvasRef,
    filmstripCanvasRef,
    filmstripPlayheadRef,

    // Event handlers
    startScrubbing,

    // Formatters
    formatTime,

    // Config
    videoPath: config.videoPath,
  };
}
