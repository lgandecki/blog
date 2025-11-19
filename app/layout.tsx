import "./global.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Navbar } from "./components/nav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "./components/footer";
import { baseUrl } from "./sitemap";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Łukasz Gandecki",
    template: "%s | Łukasz Gandecki",
  },
  description:
    "AI engineer crafting knowledge experiences, scalable systems, and developer tooling across startups and enterprises.",
  openGraph: {
    title: "Łukasz Gandecki",
    description:
      "AI engineer crafting knowledge experiences, scalable systems, and developer tooling across startups and enterprises.",
    url: baseUrl,
    siteName: "Łukasz Gandecki",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Łukasz Gandecki",
    description:
      "AI engineer crafting knowledge experiences, scalable systems, and developer tooling across startups and enterprises.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const cx = (...classes) => classes.filter(Boolean).join(" ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cx("text-black bg-white dark:text-white dark:bg-black", GeistSans.variable, GeistMono.variable)}
    >
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider disableTransitionOnChange>
          <div className="flex min-h-screen flex-col w-full">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Analytics />
            <SpeedInsights />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
