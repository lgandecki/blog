import { DevLogEntry, type DevLogPost } from "./devlog-entry";
import { getDevLogPosts } from "@/app/(main)/devlog/utils";

interface DevLogFeedProps {
  limit?: number;
  posts?: DevLogPost[];
}

export async function DevLogFeed({ limit, posts: providedPosts }: DevLogFeedProps) {
  const allPosts = providedPosts ?? getDevLogPosts();
  const sortedPosts = allPosts.sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
  );
  const posts = limit ? sortedPosts.slice(0, limit) : sortedPosts;

  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No dev log entries yet.</p>
    );
  }

  return (
    <div className="devlog-feed">
      {posts.map((post) => (
        <DevLogEntry key={post.slug} post={post} />
      ))}
    </div>
  );
}
