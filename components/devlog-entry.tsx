"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export interface DevLogPost {
  metadata: {
    publishedAt: string;
    title?: string;
  };
  slug: string;
  content: string;
}

function formatRelativeTime(date: string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears}y`;
  if (diffMonths > 0) return `${diffMonths}mo`;
  if (diffWeeks > 0) return `${diffWeeks}w`;
  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  if (diffMinutes > 0) return `${diffMinutes}m`;
  return "now";
}

interface DevLogEntryProps {
  post: DevLogPost;
  isLast?: boolean;
}

export function DevLogEntry({ post, isLast = false }: DevLogEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [post.content]);

  return (
    <article className="devlog-entry relative flex gap-4">
      {/* Timeline column with avatar and line */}
      <div className="flex flex-col items-center">
        <Image
          src="/assets/profile.jpg"
          alt="Lukasz Gandecki"
          width={40}
          height={40}
          className="rounded-full flex-shrink-0 relative z-10"
        />
        {/* Vertical line connecting to next entry */}
        {!isLast && (
          <div className="w-px flex-1 bg-border mt-2" />
        )}
      </div>

      {/* Content column */}
      <div className="flex-1 min-w-0 pb-8">
        <div className="text-sm text-muted-foreground mb-1">
          {formatRelativeTime(post.metadata.publishedAt)}
        </div>
        <p
          ref={contentRef}
          className={`text-foreground leading-relaxed ${
            isExpanded ? "" : "line-clamp-4"
          }`}
        >
          {post.content}
        </p>
        {isTruncated && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="mt-2 text-sm text-accent hover:underline"
          >
            Expand
          </button>
        )}
        {isExpanded && isTruncated && (
          <button
            onClick={() => setIsExpanded(false)}
            className="mt-2 text-sm text-accent hover:underline"
          >
            Collapse
          </button>
        )}
      </div>
    </article>
  );
}
