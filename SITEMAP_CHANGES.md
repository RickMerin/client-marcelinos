# Sitemap Implementation Notes

## What we made

We implemented an automated sitemap generation flow for the frontend project.

- Added a script that generates `sitemap.xml` with:
  - static pages (home, blog, rooms, venues, legal pages, booking page)
  - dynamic pages from API data (`blog-posts`, `rooms`, `venues`)
- Wired sitemap generation into the build process so it runs automatically on every `npm run build`.
- Added a `robots.txt` file that points search engines to the sitemap URL.
- Added env typing/example support for site URL configuration.

## Why we made it

The goal is to improve SEO crawlability and indexing.

- Search engines can discover important pages faster.
- New content (blog posts, rooms, venues) can be included in the sitemap automatically at build/deploy time.
- Helps maintain consistent technical SEO as content grows.

> Note: This is build-time dynamic (updates on next build/deploy), not real-time per request.

## Files added

- `generate-sitemap.mjs`
- `public/robots.txt`
- `public/sitemap.xml` (generated file)
- `SITEMAP_CHANGES.md` (this document)

## Files changed

- `package.json`
  - Updated `build` script to run sitemap generator before Vite build.
- `.env.example`
  - Added `VITE_SITE_URL` example.
- `src/vite-env.d.ts`
  - Added `VITE_SITE_URL` type for environment variables.

## How it works

1. `npm run build` runs `node ./generate-sitemap.mjs`.
2. The script reads env values (site URL and API URL/key).
3. It fetches dynamic entities from API:
   - `/blog-posts`
   - `/rooms`
   - `/venues`
4. It combines static + dynamic URLs and writes `public/sitemap.xml`.
5. Vite build proceeds and includes sitemap/robots files in final output.

## Expected behavior for new content

When a new blog post, room, or venue is added in the backend:

- It will be included in the sitemap on the next frontend build/deploy.
- If API is unreachable during build, only static URLs are included for that build.
