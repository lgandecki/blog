import type { Metadata } from 'next'

import { BlogPosts } from 'app/components/posts'

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Thoughts on AI engineering, knowledge tools, and building resilient teams.',
}

export default function Page() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-20">
      <h1 className="mb-4 text-4xl font-semibold tracking-tight">Writing</h1>
      <p className="mb-12 text-muted-foreground">
        Longer-form notes on building AI-first experiences, developer tooling, and product strategy.
      </p>
      <BlogPosts />
    </section>
  )
}
