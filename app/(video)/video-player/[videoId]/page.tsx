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

async function getActivities(videoId: string): Promise<Activity[]> {
  try {
    const res = await fetch(`${R2_BASE_URL}/${videoId}-activities.json`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    })
    if (res.ok) {
      return res.json()
    }
  } catch (e) {
    console.warn('Could not load activities:', e)
  }
  return []
}

export default async function VideoPlayerPage({
  params,
}: {
  params: Promise<{ videoId: string }>
}) {
  const { videoId } = await params
  const [config, activities] = await Promise.all([
    Promise.resolve(buildConfig(videoId)),
    getActivities(videoId),
  ])

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
