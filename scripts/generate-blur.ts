import fs from "fs";
import path from "path";
import { getPlaiceholder } from "plaiceholder";

const POSTS_DIR = path.join(process.cwd(), "app", "(main)", "blog", "posts");

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

async function generateBlurDataURL(imageUrl: string): Promise<string | null> {
  try {
    console.log(`  Fetching: ${imageUrl.slice(0, 60)}...`);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`  Failed to fetch: ${response.status}`);
      return null;
    }
    const buffer = await response.arrayBuffer();
    const { base64 } = await getPlaiceholder(Buffer.from(buffer));
    return base64;
  } catch (error) {
    console.error(`  Error generating blur:`, error);
    return null;
  }
}

async function main() {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));

  console.log(`Found ${files.length} MDX files\n`);

  for (const file of files) {
    const slug = file.replace(".mdx", "");
    const mdxPath = path.join(POSTS_DIR, file);
    const blurPath = path.join(POSTS_DIR, `${slug}.blur`);

    // Check if blur file already exists
    if (fs.existsSync(blurPath)) {
      console.log(`✓ ${slug} (blur exists, skipping)`);
      continue;
    }

    // Read MDX and parse frontmatter
    const content = fs.readFileSync(mdxPath, "utf-8");
    const frontmatter = parseFrontmatter(content);

    if (!frontmatter.heroImage) {
      console.log(`- ${slug} (no heroImage)`);
      continue;
    }

    console.log(`⟳ ${slug}`);
    const blur = await generateBlurDataURL(frontmatter.heroImage);

    if (blur) {
      fs.writeFileSync(blurPath, blur);
      console.log(`  ✓ Generated blur (${blur.length} chars)\n`);
    } else {
      console.log(`  ✗ Failed to generate blur\n`);
    }
  }

  console.log("\nDone!");
}

main();
