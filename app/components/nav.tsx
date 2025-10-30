'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ThemeToggle } from '@/components/theme-toggle'

const siteLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
]

const homeSections = [
  { href: '#projects', label: 'Projects' },
  { href: '#writing', label: 'Writing' },
  { href: '#contact', label: 'Contact' },
]

export function Navbar() {
  let pathname = usePathname()
  let isHome = pathname === '/'

  if (isHome) {
    return (
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Łukasz Gandecki
          </Link>
          <div className="flex items-center gap-8">
            {homeSections.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-4 text-sm font-medium">
          {siteLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-colors hover:text-foreground"
              data-active={pathname === href}
            >
              <span className="capitalize text-muted-foreground data-[active=true]:text-foreground">{label}</span>
            </Link>
          ))}
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
