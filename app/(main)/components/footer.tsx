import Link from 'next/link'

export default function Footer() {
  let year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
        <p>© {year} Łukasz Gandecki. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="transition-colors hover:text-foreground">
            Blog
          </Link>
          <Link href="/rss" className="transition-colors hover:text-foreground">
            RSS
          </Link>
        </div>
      </div>
    </footer>
  )
}
