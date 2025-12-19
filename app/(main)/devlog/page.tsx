import type { Metadata } from "next";
import { DevLogFeed } from "@/components/devlog-feed";

export const metadata: Metadata = {
  title: "Dev Log",
  description: "Quick updates and thoughts on what I'm building.",
};

export default function DevLogPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-20">
      <h1 className="mb-4 text-4xl font-semibold tracking-tight">Dev Log</h1>
      <p className="mb-12 text-muted-foreground">
        Quick takes and raw thoughts on what I'm working on.
      </p>
      <DevLogFeed />
    </section>
  );
}
