"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { WritingTabs } from "./writing-tabs";
import { DevLogEntry, type DevLogPost } from "./devlog-entry";
import type { BlogPost } from "@/app/(main)/blog/utils";

type Tab = "articles" | "devlog";

// Change this to switch between tab styles: "text" | "pill" | "segmented"
const TAB_VARIANT: "text" | "pill" | "segmented" = "segmented";

function formatDate(date: string) {
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }
  const targetDate = new Date(date);
  return targetDate.toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface RecentWritingSectionProps {
  posts: BlogPost[];
  devLogPosts: DevLogPost[];
}

export function RecentWritingSection({ posts, devLogPosts }: RecentWritingSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>("articles");

  return (
    <section id="writing" className="mx-auto w-full max-w-5xl border-t border-border px-6 py-20">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Recent Writing</h2>
        <WritingTabs variant={TAB_VARIANT} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === "articles" && (
        <>
          <div className="mb-6 flex justify-end">
            <Button variant="ghost" asChild>
              <Link href="/blog">View All Posts →</Link>
            </Button>
          </div>
          <div className="space-y-8">
            {posts.map((post) => {
              const excerpt = post.metadata.summary || `${post.content.replace(/\s+/g, " ").trim().slice(0, 160)}…`;

              return (
                <article key={post.slug} className="group">
                  <Link href={`/blog/${post.slug}`} className="block sm:flex sm:gap-4">
                    {post.metadata.heroImage && (
                      <>
                        {/* Mobile: wide banner */}
                        <div className="relative sm:hidden w-full h-32 mb-3 overflow-hidden rounded-md">
                          <Image
                            src={post.metadata.heroImage}
                            alt={post.metadata.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="100vw"
                            {...(post.heroImageBlur && { placeholder: "blur", blurDataURL: post.heroImageBlur })}
                          />
                        </div>
                        {/* Desktop: side thumbnail */}
                        <div className="relative hidden sm:block h-24 w-36 flex-shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={post.metadata.heroImage}
                            alt={post.metadata.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="144px"
                            {...(post.heroImageBlur && { placeholder: "blur", blurDataURL: post.heroImageBlur })}
                          />
                        </div>
                      </>
                    )}
                    <div className="flex-1">
                      <time className="text-sm text-muted-foreground">{formatDate(post.metadata.publishedAt)}</time>
                      <h3 className="mt-1 mb-1 text-xl font-semibold transition-colors group-hover:text-accent">
                        {post.metadata.title}
                      </h3>
                      <p className="line-clamp-2 text-muted-foreground">{excerpt}</p>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "devlog" && (
        <>
          <div className="mb-6 flex justify-end">
            <Button variant="ghost" asChild>
              <Link href="/devlog">View All Entries →</Link>
            </Button>
          </div>
          <div className="devlog-feed">
            {devLogPosts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No dev log entries yet.</p>
            ) : (
              devLogPosts.map((post) => <DevLogEntry key={post.slug} post={post} />)
            )}
          </div>
        </>
      )}
    </section>
  );
}
