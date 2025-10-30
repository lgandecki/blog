'use client'

import Image from 'next/image'
import { useState } from 'react'

import styles from './youtube-player.module.css'

type YouTubePlayerProps = {
  videoId: string
  start?: number
  thumbnailSrc?: string
}

export function YouTubePlayer({ videoId, start = 0, thumbnailSrc = '/assets/talk-thumbnail.png' }: YouTubePlayerProps) {
  let [isPlaying, setIsPlaying] = useState(false)
  let embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`)

  embedUrl.searchParams.set('autoplay', '1')
  embedUrl.searchParams.set('enablejsapi', '1')
  embedUrl.searchParams.set('rel', '0')

  if (start > 0) {
    embedUrl.searchParams.set('start', start.toString())
  }

  if (isPlaying) {
    return (
      <div className={styles.container}>
        <iframe
          className={styles.iframe}
          src={embedUrl.toString()}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div
        role="button"
        tabIndex={0}
        className={`${styles.thumbnailFacade} group`}
        onClick={() => setIsPlaying(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setIsPlaying(true)
          }
        }}
      >
        <Image
          src={thumbnailSrc}
          alt="YouTube video thumbnail"
          width={1200}
          height={675}
          className={`${styles.thumbnailImage} grayscale-[50%] transition duration-300 ease-in-out group-hover:grayscale-0`}
          priority
        />
        <div className={`${styles.playButton}`} />
      </div>
    </div>
  )
}
