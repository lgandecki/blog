import { notFound } from "next/navigation";
import { CustomMDX } from "app/(main)/components/mdx";
import { formatDate, getBlogPosts } from "app/(main)/blog/utils";
import { baseUrl } from "app/(main)/sitemap";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export async function generateStaticParams() {
  let posts = getBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  let { slug } = await params;
  let posts = getBlogPosts();
  let post = posts.find((post) => post.slug === slug);
  if (!post) {
    return;
  }

  let { title, publishedAt: publishedTime, summary: description, image, heroImage } = post.metadata;
  let ogImage = heroImage || image || `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function HeroImage({ src, alt, blurDataURL }: { src: string; alt: string; blurDataURL?: string }) {
  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
        {...(blurDataURL && { placeholder: "blur", blurDataURL })}
      />
    </div>
  );
}

function AuthorMetadata({ date, readingTime }: { date: string; readingTime: number }) {
  return (
    <div className="flex items-center gap-3">
      <Image src="/assets/profile.jpg" alt="Lukasz Gandecki" width={48} height={48} className="rounded-full" />
      <div>
        <p className="font-medium">Lukasz Gandecki</p>
        <p className="text-sm text-muted-foreground">
          {formatDate(date)} · {readingTime} min read
        </p>
      </div>
    </div>
  );
}

export default async function Blog({ params }: { params: Promise<{ slug: string }> }) {
  let { slug } = await params;
  let posts = getBlogPosts();
  let post = posts.find((post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  const hasHeroImage = !!post.metadata.heroImage;

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-20">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image:
              post.metadata.heroImage || post.metadata.image
                ? `${baseUrl}${post.metadata.heroImage || post.metadata.image}`
                : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: "Lukasz Gandecki",
            },
          }),
        }}
      />

      {/* Desktop: Hero image first */}
      {hasHeroImage && (
        <div className="hidden md:block mb-8">
          <HeroImage src={post.metadata.heroImage!} alt={post.metadata.title} blurDataURL={post.heroImageBlur} />
        </div>
      )}

      {/* Title */}
      <h1 className="title font-semibold text-2xl tracking-tighter">{post.metadata.title}</h1>

      {/* Author metadata */}
      <div className="mt-4 mb-8">
        <AuthorMetadata date={post.metadata.publishedAt} readingTime={post.readingTime} />
      </div>

      {/* Mobile: Hero image after metadata */}
      {hasHeroImage && (
        <div className="block md:hidden mb-8">
          <HeroImage src={post.metadata.heroImage!} alt={post.metadata.title} blurDataURL={post.heroImageBlur} />
        </div>
      )}

      <article className="prose text-foreground dark:text-foreground">
        <CustomMDX source={post.content} />
      </article>
    </section>
  );
}
