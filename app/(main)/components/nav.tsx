"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

const homeSections = [
  { href: "#projects", label: "Projects" },
  { href: "#writing", label: "Writing" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  let pathname = usePathname();
  let isHome = pathname === "/";
  let isBlogPost = pathname?.startsWith("/blog/") && pathname !== "/blog";

  if (isHome) {
    return (
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="text-sm sm:text-base md:text-lg font-semibold tracking-tight whitespace-nowrap flex-shrink-0"
          >
            Łukasz Gandecki
          </Link>
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8 min-w-0">
            {homeSections.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
              >
                {label}
              </a>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm sm:text-base md:text-lg font-semibold tracking-tight whitespace-nowrap flex-shrink-0"
        >
          Łukasz Gandecki
        </Link>
        <div className="flex-shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
