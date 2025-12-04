import Link from "next/link";
import Image from "next/image";

import { formatDate, getBlogPosts, BlogPost } from "app/(main)/blog/utils";

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block md:grid md:grid-cols-3 md:gap-6">
        {post.metadata.heroImage && (
          <div className="relative w-full md:col-span-2 aspect-[16/9] mb-4 md:mb-0 overflow-hidden">
            <Image
              src={post.metadata.heroImage}
              alt={post.metadata.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              {...(post.heroImageBlur && { placeholder: "blur", blurDataURL: post.heroImageBlur })}
            />
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex-1">
            <h2 className="mb-2 text-2xl font-semibold tracking-tight transition-colors group-hover:text-accent">
              {post.metadata.title}
            </h2>
            <p className="text-muted-foreground line-clamp-3">
              {post.metadata.summary || `${post.content.replace(/\s+/g, " ").trim().slice(0, 200)}…`}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/profile.jpg"
                alt="Lukasz Gandecki"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm text-muted-foreground">Lukasz Gandecki</span>
            </div>
            <div className="text-sm text-muted-foreground text-right">
              <div>{formatDate(post.metadata.publishedAt)}</div>
              <div>{post.readingTime} min read</div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function GridCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex flex-col h-full">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        {post.metadata.heroImage && (
          <div className="relative w-full aspect-[16/10] mb-4 overflow-hidden">
            <Image
              src={post.metadata.heroImage}
              alt={post.metadata.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              {...(post.heroImageBlur && { placeholder: "blur", blurDataURL: post.heroImageBlur })}
            />
          </div>
        )}
        <div className="flex flex-col flex-1">
          <div className="flex-1">
            <h2 className="mb-2 text-xl font-semibold tracking-tight transition-colors group-hover:text-accent">
              {post.metadata.title}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {post.metadata.summary || `${post.content.replace(/\s+/g, " ").trim().slice(0, 150)}…`}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/profile.jpg"
                alt="Lukasz Gandecki"
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="text-xs text-muted-foreground">Lukasz Gandecki</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(post.metadata.publishedAt)} · {post.readingTime} min
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function MobileCard({ post }: { post: BlogPost }) {
  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        {post.metadata.heroImage && (
          <div className="relative w-full h-40 mb-3 overflow-hidden">
            <Image
              src={post.metadata.heroImage}
              alt={post.metadata.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="100vw"
              {...(post.heroImageBlur && { placeholder: "blur", blurDataURL: post.heroImageBlur })}
            />
          </div>
        )}
        <time className="text-sm text-muted-foreground">{formatDate(post.metadata.publishedAt)}</time>
        <h2 className="mt-1 mb-1 text-xl font-semibold tracking-tight transition-colors group-hover:text-accent">
          {post.metadata.title}
        </h2>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {post.metadata.summary || `${post.content.replace(/\s+/g, " ").trim().slice(0, 150)}…`}
        </p>
      </Link>
    </article>
  );
}

export async function BlogPosts() {
  let posts = (await getBlogPosts()).sort(
    (a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime()
  );

  // Pattern: 1 featured, 3 grid, 2 grid, then repeat
  const getRowType = (index: number): 'featured' | 'three' | 'two' => {
    if (index === 0) return 'featured';
    const cycleIndex = (index - 1) % 6;
    if (cycleIndex < 3) return 'three';
    if (cycleIndex < 5) return 'two';
    return 'featured';
  };

  // Group posts into rows
  const rows: { type: 'featured' | 'three' | 'two'; posts: BlogPost[] }[] = [];
  let i = 0;
  while (i < posts.length) {
    const rowType = getRowType(i);
    if (rowType === 'featured') {
      rows.push({ type: 'featured', posts: [posts[i]] });
      i += 1;
    } else if (rowType === 'three') {
      rows.push({ type: 'three', posts: posts.slice(i, Math.min(i + 3, posts.length)) });
      i += 3;
    } else {
      rows.push({ type: 'two', posts: posts.slice(i, Math.min(i + 2, posts.length)) });
      i += 2;
    }
  }

  return (
    <>
      {/* Mobile layout */}
      <div className="md:hidden space-y-10">
        {posts.map((post) => (
          <MobileCard key={post.slug} post={post} />
        ))}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block space-y-12">
        {rows.map((row, rowIndex) => {
          if (row.type === 'featured') {
            return (
              <div key={rowIndex}>
                <FeaturedCard post={row.posts[0]} />
              </div>
            );
          }
          if (row.type === 'three') {
            return (
              <div key={rowIndex} className="grid grid-cols-3 gap-6">
                {row.posts.map((post) => (
                  <GridCard key={post.slug} post={post} />
                ))}
              </div>
            );
          }
          // two columns
          return (
            <div key={rowIndex} className="grid grid-cols-2 gap-6">
              {row.posts.map((post) => (
                <GridCard key={post.slug} post={post} />
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
