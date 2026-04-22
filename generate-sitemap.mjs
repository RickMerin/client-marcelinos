import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseEnvFile(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((acc, line) => {
      const idx = line.indexOf("=");
      if (idx === -1) return acc;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
}

async function readEnv() {
  try {
    const raw = await readFile(path.join(__dirname, ".env"), "utf8");
    return parseEnvFile(raw);
  } catch {
    return {};
  }
}

const staticPages = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/rooms", changefreq: "weekly", priority: "0.9" },
  { path: "/venues", changefreq: "weekly", priority: "0.9" },
  { path: "/create-booking", changefreq: "weekly", priority: "0.8" },
  { path: "/testimonial", changefreq: "monthly", priority: "0.7" },
  { path: "/blog", changefreq: "daily", priority: "0.9" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms-and-conditions", changefreq: "yearly", priority: "0.3" },
  { path: "/rules-regulation", changefreq: "yearly", priority: "0.3" },
  { path: "/refund-policy", changefreq: "yearly", priority: "0.3" },
];

const today = new Date().toISOString().split("T")[0];

function resolveLastMod(value) {
  if (!value) return today;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return today;
  return date.toISOString().split("T")[0];
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function fetchApi(pathname, apiBaseUrl, apiKey) {
  if (!apiBaseUrl) return [];

  try {
    const response = await fetch(`${apiBaseUrl}${pathname}`, {
      headers: apiKey ? { "x-api-key": apiKey } : {},
    });

    if (!response.ok) {
      console.warn(`[sitemap] Skipped ${pathname}: HTTP ${response.status}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.warn(`[sitemap] Skipped ${pathname}: ${error.message}`);
    return [];
  }
}

function normalizePath(pathname) {
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function toUrlEntry(pathname, siteUrl, options = {}) {
  return {
    loc: `${siteUrl}${normalizePath(pathname)}`,
    lastmod: resolveLastMod(options.lastmod),
    changefreq: options.changefreq ?? "weekly",
    priority: options.priority ?? "0.5",
  };
}

async function getDynamicEntries(siteUrl, apiBaseUrl, apiKey) {
  const [blogPosts, rooms, venues] = await Promise.all([
    fetchApi("/blog-posts", apiBaseUrl, apiKey),
    fetchApi("/rooms", apiBaseUrl, apiKey),
    fetchApi("/venues", apiBaseUrl, apiKey),
  ]);

  const blogEntries = blogPosts
    .map((post) => {
      if (!post?.slug) return null;
      return toUrlEntry(`/blog/${post.slug}`, siteUrl, {
        lastmod: post.updated_at ?? post.published_at,
        changefreq: "monthly",
        priority: "0.7",
      });
    })
    .filter(Boolean);

  const roomEntries = rooms
    .map((room) => {
      const roomId = room?.slug ?? room?.id;
      if (!roomId) return null;
      return toUrlEntry(`/rooms/${roomId}`, siteUrl, {
        lastmod: room.updated_at,
        changefreq: "weekly",
        priority: "0.8",
      });
    })
    .filter(Boolean);

  const venueEntries = venues
    .map((venue) => {
      const venueId = venue?.slug ?? venue?.id;
      if (!venueId) return null;
      return toUrlEntry(`/venues/${venueId}`, siteUrl, {
        lastmod: venue.updated_at,
        changefreq: "weekly",
        priority: "0.8",
      });
    })
    .filter(Boolean);

  return [...blogEntries, ...roomEntries, ...venueEntries];
}

function buildSitemap(urlEntries) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const entry of urlEntries) {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    lines.push(`    <priority>${entry.priority}</priority>`);
    lines.push("  </url>");
  }

  lines.push("</urlset>");
  return `${lines.join("\n")}\n`;
}

async function main() {
  const fileEnv = await readEnv();
  const env = { ...fileEnv, ...process.env };
  const siteUrl = (env.VITE_SITE_URL || "https://marcelinos-resort-hotel.com").replace(
    /\/+$/,
    "",
  );
  const apiBaseUrl = (
    env.VITE_ENV === "production" ? env.VITE_API_URL_PROD : env.VITE_API_URL_DEV
  )?.replace(/\/+$/, "");
  const apiKey = env.VITE_API_KEY;

  const staticEntries = staticPages.map((page) =>
    toUrlEntry(page.path, siteUrl, {
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    }),
  );
  const dynamicEntries = await getDynamicEntries(siteUrl, apiBaseUrl, apiKey);

  const uniqueEntries = Array.from(
    new Map([...staticEntries, ...dynamicEntries].map((entry) => [entry.loc, entry])).values(),
  );

  const sitemapContent = buildSitemap(uniqueEntries);
  const publicDir = path.join(__dirname, "public");
  await mkdir(publicDir, { recursive: true });
  await writeFile(path.join(publicDir, "sitemap.xml"), sitemapContent, "utf8");

  console.log(`[sitemap] Generated ${uniqueEntries.length} URLs at public/sitemap.xml`);
}

main().catch((error) => {
  console.error("[sitemap] Failed to generate sitemap:", error);
  process.exitCode = 1;
});
