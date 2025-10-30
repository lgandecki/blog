import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Github, ExternalLink, Mail, Linkedin, Twitter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { YouTubePlayer } from '@/components/youtube-player'
import { formatDate, getBlogPosts } from './blog/utils'

export const metadata: Metadata = {
  title: 'AI Engineer',
  description:
    'Projects and writing from Łukasz Gandecki, an AI engineer focused on knowledge experiences, developer tooling, and scalable systems.',
}

const codeProjects = [
  {
    title: 'cypress-cucumber-preprocessor',
    description: 'Run cucumber specs with Cypress.io',
    downloads: '700k monthly downloads',
    type: 'npm',
    link: 'https://www.npmjs.com/package/cypress-cucumber-preprocessor',
    tags: ['cypress', 'cucumber', 'testing'],
  },
  {
    title: 'wait-for-expect',
    description: 'Wait for expectation to be true.',
    downloads: '3.5 mln weekly downloads.',
    type: 'npm',
    link: 'https://www.npmjs.com/package/wait-for-expect',
    tags: ['tooling', 'jest', 'testing'],
  },
  {
    title: 'modifyjs',
    description: 'Modify your objects with a mongo like syntax.',
    downloads: '50k monthly downloads',
    type: 'npm',
    link: 'https://www.npmjs.com/package/modifyjs',
    tags: ['helper', 'mongodb'],
  },
]

const contactLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/lgandecki',
    icon: Github,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/lgandecki',
    icon: Linkedin,
  },
  {
    label: 'Twitter',
    href: 'https://x.com/lgandecki',
    icon: Twitter,
  },
  {
    label: 'Email',
    href: 'mailto:lgandecki+website@thebrain.pro',
    icon: Mail,
  },
]

export default function Page() {
  let posts = getBlogPosts()
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() -
        new Date(a.metadata.publishedAt).getTime()
    )
    .slice(0, 3)

  return (
    <div className="bg-background text-foreground">
      <section className="mx-auto w-full max-w-5xl px-6 py-20">
        <div className="max-w-3xl">
          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
            AI Engineer
          </h1>
          <p className="mb-8 text-xl leading-relaxed text-muted-foreground">
            Two decades of building scalable systems and leading teams for
            startups and enterprises (2K Games, Audi, ...). Specialized in
            full-stack architecture, Artificial Intelligence, developer tooling.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="default" size="lg" asChild>
              <a href="#projects">View Projects</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#contact">Get in Touch</a>
            </Button>
          </div>
        </div>
      </section>

      <section
        id="projects"
        className="mx-auto w-full max-w-5xl border-t border-border px-6 py-20"
      >
        <h2 className="mb-12 text-3xl font-bold tracking-tight">
          Open Source &amp; Libraries
        </h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {codeProjects.map((project) => (
            <Card
              key={project.title}
              className="flex h-full flex-col gap-4 p-6 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <span className="rounded bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  {project.type}
                </span>
                <Link
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${project.title} on ${project.type}`}
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
              <h3 className="text-lg font-semibold">
                <Link
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent"
                >
                  {project.title}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
              <p className="text-sm text-muted-foreground">
                {project.downloads}
              </p>
              <div className="mt-auto flex flex-wrap gap-2 border-t border-dashed border-border pt-4">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl border-t border-border px-6 py-20">
        <h2 className="mb-12 text-3xl font-bold tracking-tight">
          Featured Talk
        </h2>
        <Card className="overflow-hidden">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="featured-talk-side flex flex-col">
              <div className="relative">
                <YouTubePlayer videoId="Kcka7rzcxLk" start={15} />
              </div>
              <div className="flex items-center justify-center bg-white p-6 dark:bg-white">
                <Image
                  src="/assets/ai-engineer-logo.svg"
                  alt="AI Engineer logo"
                  width={220}
                  height={160}
                  className="h-32 w-auto dark:invert"
                />
              </div>
            </div>
            <div className="featured-talk-side flex flex-col justify-center p-8">
              <h3 className="mb-3 text-2xl font-semibold">
                Books Reimagined: Use AI to Create New Experiences for Things
                You Know
              </h3>
              <p className="mb-4 text-muted-foreground">
                Presented at AI Engineer World&apos;s Fair • June 3-5, 2025 •
                San Francisco
              </p>
              <p className="text-muted-foreground">
                Exploring how AI transforms our relationship with knowledge and
                creates entirely new ways to engage with familiar concepts.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section
        id="writing"
        className="mx-auto w-full max-w-5xl border-t border-border px-6 py-20"
      >
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Recent Writing</h2>
          <Button variant="ghost" asChild>
            <Link href="/blog">View All Posts →</Link>
          </Button>
        </div>
        <div className="space-y-8">
          {posts.map((post) => {
            let excerpt =
              post.metadata.summary ||
              `${post.content.replace(/\s+/g, ' ').trim().slice(0, 160)}…`

            return (
              <article key={post.slug} className="group">
                <Link href={`/blog/${post.slug}`} className="block">
                  <time className="text-sm text-muted-foreground">
                    {formatDate(post.metadata.publishedAt)}
                  </time>
                  <h3 className="mt-2 mb-2 text-xl font-semibold transition-colors group-hover:text-accent">
                    {post.metadata.title}
                  </h3>
                  <p className="line-clamp-3 text-muted-foreground">{excerpt}</p>
                </Link>
              </article>
            )
          })}
        </div>
      </section>

      <section
        id="contact"
        className="mx-auto w-full max-w-5xl border-t border-border px-6 py-20"
      >
        <div className="max-w-3xl">
          <h2 className="mb-8 text-3xl font-bold tracking-tight">
            Let&apos;s Connect
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Open to interesting projects, consulting opportunities, and
            technical discussions.
          </p>
          <div className="flex flex-wrap gap-4">
            {contactLinks.map(({ label, href, icon: Icon }) => (
              <Button key={label} variant="outline" size="lg" asChild>
                <Link href={href} target="_blank" rel="noopener noreferrer">
                  <Icon className="mr-2 h-5 w-5" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
