'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { VideoScrubberPlayer, Activity } from '@/components/video-scrubber'
import type { VideoScrubberConfig } from '@/components/video-scrubber'

const R2_BASE_URL = 'https://sessions-storage.lgandecki.net'

function buildConfig(videoId: string): VideoScrubberConfig {
  return {
    videoPath: `${R2_BASE_URL}/${videoId}.mp4`,
    previewSpritePathPrefix: `${R2_BASE_URL}/${videoId}-preview`,
    timelineSpritePath: `${R2_BASE_URL}/${videoId}-timeline.jpg`,
    metadataPath: `${R2_BASE_URL}/${videoId}-meta.json`,
  }
}

export default function VideoPlayerPage() {
  const params = useParams()
  const videoId = params.videoId as string

  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActivities() {
      try {
        const res = await fetch(`${R2_BASE_URL}/${videoId}-activities.json`)
        if (res.ok) {
          const data = await res.json()
          setActivities(data)
        }
      } catch (e) {
        console.warn('Could not load activities:', e)
      } finally {
        setLoading(false)
      }
    }
    loadActivities()
  }, [videoId])

  const config = buildConfig(videoId)

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#0a0a0a] text-white">
        Loading...
      </div>
    )
  }

  return (
    <VideoScrubberPlayer
      theme="media-rich"
      title={videoId}
      config={config}
      activities={activities}
      className="h-full w-full"
    />
  )
}
