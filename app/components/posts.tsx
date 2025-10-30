import Link from 'next/link'

import { formatDate, getBlogPosts } from 'app/blog/utils'

export function BlogPosts() {
  let posts = getBlogPosts().sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
  )

  return (
    <div className="space-y-12">
      {posts.map((post) => {
        let excerpt =
          post.metadata.summary ||
          `${post.content.replace(/\s+/g, ' ').trim().slice(0, 200)}…`

        return (
          <article key={post.slug} className="group">
            <Link href={`/blog/${post.slug}`} className="block space-y-2">
              <time className="text-sm text-muted-foreground">
                {formatDate(post.metadata.publishedAt)}
              </time>
              <h2 className="text-2xl font-semibold tracking-tight transition-colors group-hover:text-accent">
                {post.metadata.title}
              </h2>
              <p className="text-muted-foreground">{excerpt}</p>
            </Link>
          </article>
        )
      })}
    </div>
  )
}
