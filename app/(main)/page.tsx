import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Github, Mail, Linkedin, Twitter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { YouTubePlayer } from "@/components/youtube-player";
import { ProjectCarousel } from "@/components/project-carousel";
import { ChromaLogos } from "@/components/chroma-logos";
import { formatDate, getBlogPosts } from "./blog/utils";
import { codeProjects } from "./codeProjects";

const companyLogos = [
  {
    src: "/assets/2K Games Logo.svg",
    darkSrc: "/assets/2K Games Logo Dark.svg",
    alt: "2K Games",
    width: 60,
    height: 40,
    className: "company-logo-2k h-8 w-auto md:h-9",
  },
  {
    src: "/assets/Audi Logo 2016.svg",
    alt: "Audi",
    width: 80,
    height: 28,
    className: "company-logo h-7 w-auto md:h-8",
  },
  {
    src: "/assets/Wayfair Logo.svg",
    alt: "Wayfair",
    width: 100,
    height: 24,
    className: "company-logo-wayfair h-6 w-auto md:h-7",
  },
  {
    src: "/assets/Alef.png.webp",
    alt: "Alef Education",
    width: 80,
    height: 32,
    className: "company-logo relative md:-top-[6px] -top-[4px] h-7 w-auto md:h-9",
  },
];

export const metadata: Metadata = {
  title: "Łukasz Gandecki - AI Engineer",
  description:
    "Projects and writing from Łukasz Gandecki, an AI engineer focused on knowledge experiences, developer tooling, and scalable systems.",
};

export const contactLinks = [
  {
    label: "GitHub",
    href: "https://github.com/lgandecki",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/lgandecki",
    icon: Linkedin,
  },
  {
    label: "Twitter",
    href: "https://x.com/lgandecki",
    icon: Twitter,
  },
  {
    label: "Email",
    href: "mailto:lgandecki+website@thebrain.pro",
    icon: Mail,
  },
];

export default async function Page() {
  let posts = getBlogPosts()
    .sort((a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime())
    .slice(0, 3);

  return (
    <div className="bg-background text-foreground">
      <section className="mx-auto w-full max-w-5xl px-6 pt-20 pb-8">
        <div className="max-w-4xl">
          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">AI Engineer</h1>
          <p className="mb-6 text-xl leading-relaxed text-muted-foreground">
            Two decades of building scalable systems and leading teams for startups and enterprises.
            <br />
            Specialized in full-stack architecture, Artificial Intelligence, developer tooling.
          </p>
          <ChromaLogos logos={companyLogos} className="mt-8 mb-0" radius={100} />
        </div>
      </section>

      <section id="projects" className="mx-auto w-full max-w-5xl border-t border-border px-6 py-20">
        <h2 className="mb-12 text-3xl font-bold tracking-tight">Open Source &amp; Libraries</h2>
        <ProjectCarousel projects={codeProjects} />
      </section>

      <section className="mx-auto w-full max-w-5xl border-t border-border px-6 py-20">
        <h2 className="mb-12 text-3xl font-bold tracking-tight">Featured Talk</h2>
        <Card className="overflow-hidden">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="featured-talk-side flex flex-col">
              <div className="relative">
                <YouTubePlayer videoId="Kcka7rzcxLk" start={15} />
              </div>
              <div className="featured-talk-side flex items-center justify-center p-6">
                <Image
                  src="/assets/ai-engineer-logo.svg"
                  alt="AI Engineer logo"
                  width={220}
                  height={160}
                  className="featured-talk-logo h-32 w-auto"
                />
              </div>
            </div>
            <div className="featured-talk-side flex flex-col justify-center p-8">
              <h3 className="mb-3 text-2xl font-semibold">
                Books Reimagined: Use AI to Create New Experiences for Things You Know
              </h3>
              <p className="mb-4 text-muted-foreground">
                Presented at AI Engineer World&apos;s Fair • June 3-5, 2025 • San Francisco
              </p>
              <p className="text-muted-foreground">
                Exploring how AI transforms our relationship with knowledge and creates entirely new ways to engage with
                familiar concepts.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section id="writing" className="mx-auto w-full max-w-5xl border-t border-border px-6 py-20">
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Recent Writing</h2>
          <Button variant="ghost" asChild>
            <Link href="/blog">View All Posts →</Link>
          </Button>
        </div>
        <div className="space-y-8">
          {posts.map((post) => {
            let excerpt = post.metadata.summary || `${post.content.replace(/\s+/g, " ").trim().slice(0, 160)}…`;

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
      </section>

      <section id="contact" className="mx-auto w-full max-w-5xl border-t border-border px-6 py-20">
        <div className="max-w-3xl">
          <h2 className="mb-8 text-3xl font-bold tracking-tight">Let&apos;s Connect</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Open to interesting projects, consulting opportunities, and technical discussions.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {contactLinks.map(({ label, href, icon: Icon }) => (
              <Button key={label} variant="outline" size="lg" asChild className="w-full">
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
  );
}
