/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: string;
  readonly VITE_API_URL_DEV: string;
  readonly VITE_API_URL_PROD: string;
  readonly VITE_WS_HOST?: string;
  readonly VITE_WS_PORT?: string;
  readonly VITE_WS_KEY?: string;
  readonly VITE_WS_SCHEME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
