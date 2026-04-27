import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname), "");
  const siteUrl = (env.VITE_SITE_URL || "https://marcelinos-resort-hotel.com").replace(
    /\/+$/,
    "",
  );
  const robotsContent = (env.VITE_ROBOTS_CONTENT || "index, follow").trim();

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "inject-index-html-seo-placeholders",
        enforce: "pre",
        transformIndexHtml(html) {
          return html
            .replaceAll("__VITE_ROBOTS_CONTENT__", robotsContent)
            .replaceAll("__VITE_SITE_URL__", siteUrl);
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Avoid warning for large main chunk; routes are already lazy-loaded
      chunkSizeWarningLimit: 1300,
    },
  };
});
