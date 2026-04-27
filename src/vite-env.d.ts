/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  /** Build-time robots directive for index.html (e.g. index, follow or noindex, nofollow). */
  readonly VITE_ROBOTS_CONTENT?: string;
  /** When false, generate-sitemap emits Disallow: / in public/robots.txt. */
  readonly VITE_INDEXABLE?: string;
  readonly VITE_ENV: string;
  readonly VITE_API_URL_DEV: string;
  readonly VITE_API_URL_PROD: string;
  readonly VITE_API_KEY: string;
  /** Comma-separated production host(s) where indexing is allowed (e.g. marcelinos.com). All other domains get noindex. */
  readonly VITE_PRODUCTION_HOST?: string;
  readonly VITE_WS_HOST?: string;
  readonly VITE_WS_PORT?: string;
  readonly VITE_WS_KEY?: string;
  readonly VITE_WS_SCHEME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
