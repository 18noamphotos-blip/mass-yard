/**
 * Static build for GitHub Pages (https://18noamphotos-blip.github.io/mass-yard/).
 * Separate from vite.config.ts so the Grok/Vercel build is untouched:
 * no Nitro server, no PGlite/auth dev plugins, no Grok PWA head injection.
 * The "/" route is prerendered to static HTML via TanStack Start.
 *
 *   npm run build:pages   ->  dist/client  (deployable static site)
 */
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";

const BASE = "/mass-yard/";

/**
 * On Grok/Vercel the PWA manifest is served dynamically by
 * server/middleware/grok-pwa.ts. There is no server on Pages, so emit a
 * static, base-aware copy into the client build instead.
 */
function staticManifestPlugin(): Plugin {
  return {
    name: "pages:static-manifest",
    applyToEnvironment: (env) => env.name === "client",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "__grok/manifest.webmanifest",
        source: JSON.stringify(
          {
            name: "Mass Yard",
            short_name: "Mass Yard",
            id: BASE,
            start_url: BASE,
            scope: BASE,
            display: "standalone",
            background_color: "#121614",
            theme_color: "#121614",
            icons: [{ src: `${BASE}__grok/icon-180.png`, sizes: "180x180", type: "image/png" }],
          },
          null,
          2,
        ),
      });
    },
  };
}

export default defineConfig({
  base: BASE,
  resolve: { tsconfigPaths: true },
  // The client and SSR builds hash styles.css?url differently, so the
  // prerendered HTML would point at a CSS file that doesn't exist. A stable,
  // unhashed name for CSS keeps both builds in agreement.
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (info) =>
          info.names?.some((n) => n.endsWith(".css")) ? "assets/[name].css" : "assets/[name]-[hash][extname]",
      },
    },
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      prerender: { enabled: true, crawlLinks: false },
      pages: [{ path: "/" }],
    }),
    viteReact(),
    staticManifestPlugin(),
  ],
});
