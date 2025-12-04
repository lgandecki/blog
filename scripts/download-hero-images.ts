import fs from "fs";
import path from "path";

const POSTS_DIR = path.join(process.cwd(), "app", "(main)", "blog", "posts");
const OUTPUT_DIR = path.join(process.cwd(), "hero-images-archive");

function parseFrontmatter(content: string): Record<string, string> {
  const match = /---\s*([\s\S]*?)\s*---/.exec(content);
  if (!match) return {};

  const frontmatter: Record<string, string> = {};
  match[1].split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      const value = rest.join(":").trim().replace(/^['"](.*)['"]$/, "$1");
      frontmatter[key.trim()] = value;
    }
  });
  return frontmatter;
}

function getExtensionFromUrl(url: string): string {
  // Try to get extension from URL path
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(ext)) {
    return ext;
  }
  // Default to .jpg if we can't determine
  return ".jpg";
}

async function downloadImage(url: string, outputPath: string): Promise<boolean> {
  try {
    console.log(`  Downloading: ${url.slice(0, 60)}...`);
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`  Failed to fetch: ${response.status}`);
      return false;
    }
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    const sizeKB = Math.round(buffer.byteLength / 1024);
    console.log(`  ✓ Saved (${sizeKB} KB)`);
    return true;
  } catch (error) {
    console.error(`  Error downloading:`, error);
    return false;
  }
}

async function main() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  console.log(`Found ${files.length} MDX files`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const slug = file.replace(".mdx", "");
    const mdxPath = path.join(POSTS_DIR, file);

    // Read MDX and parse frontmatter
    const content = fs.readFileSync(mdxPath, "utf-8");
    const frontmatter = parseFrontmatter(content);

    if (!frontmatter.heroImage) {
      console.log(`- ${slug} (no heroImage)`);
      continue;
    }

    const ext = getExtensionFromUrl(frontmatter.heroImage);
    const outputPath = path.join(OUTPUT_DIR, `${slug}${ext}`);

    // Check if already downloaded
    if (fs.existsSync(outputPath)) {
      console.log(`✓ ${slug} (already exists, skipping)`);
      skipped++;
      continue;
    }

    console.log(`⟳ ${slug}`);
    const success = await downloadImage(frontmatter.heroImage, outputPath);
    if (success) {
      downloaded++;
    } else {
      failed++;
    }
    console.log("");
  }

  console.log(`\nDone!`);
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed: ${failed}`);
}

main();
