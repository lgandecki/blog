import "../global.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";

import { cn } from "@/lib/utils";
export default function VideoRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("text-black bg-white dark:text-white dark:bg-black", GeistSans.variable, GeistMono.variable)}
    >
      <body className="antialiased bg-background text-foreground overflow-hidden">
        <ThemeProvider disableTransitionOnChange>
          <main className="fixed inset-0">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
