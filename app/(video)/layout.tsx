import "../global.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  icons: {
    icon: "/assets/favicon.svg",
  },
};

export default function VideoRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("text-black bg-white dark:text-white dark:bg-black", GeistSans.variable, GeistMono.variable)}
    >
      <body className="antialiased bg-background text-foreground overflow-hidden">
        <ThemeProvider disableTransitionOnChange>
          <main className="fixed inset-0">
            {children}
            <Analytics />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
