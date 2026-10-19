// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// ---------------------------------------------------------------------------
// GitHub Pages: ajustá estos dos valores antes de deployar.
//
// - Repo de proyecto (https://<usuario>.github.io/<repo>/):
//     site: "https://<usuario>.github.io",
//     base: "/<repo>",
//
// - Dominio personalizado o Pages de usuario/org (https://<usuario>.github.io/):
//     site: "https://tu-dominio.com",
//     base: "/",
//
// Ver README.md > "Deploy en GitHub Pages" para el detalle.
// ---------------------------------------------------------------------------
const site = "https://mariaelisaaraya.github.io";
const base = "/albertoyeli_tienenunspace";

// https://astro.build/config
export default defineConfig({
  site,
  base,
  redirects: {
    "/episodios/004-space-9-de-octubre": `${base}/episodios/004-space-2-de-octubre/`,
    "/episodios/000-el-space-que-nunca-fue": `${base}/episodios/001-el-space-que-nunca-fue/`,
    "/episodios/001-episodio-1": `${base}/episodios/001-el-space-que-nunca-fue/`,
    "/episodios/001-eli-y-alberto-hacen-un-space-parte-2": `${base}/episodios/002-eli-y-alberto-hacen-un-space-parte-2/`,
    "/episodios/002-episodio-2": `${base}/episodios/002-eli-y-alberto-hacen-un-space-parte-2/`,
    "/episodios/002-x402": `${base}/episodios/003-x402/`,
    "/episodios/003-space-principios-de-octubre": `${base}/episodios/003-x402/`,
  },
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: "redirect-local-home",
        configureServer: {
          order: "post",
          handler(server) {
            return () => {
              // Run before Astro checks and strips the base path.
              server.middlewares.stack.unshift({
                route: "",
                /**
                 * @param {import("node:http").IncomingMessage} req
                 * @param {import("node:http").ServerResponse} res
                 * @param {() => void} next
                 */
                handle(req, res, next) {
                  if (req.url === "/" || req.url?.startsWith("/?")) {
                    res.writeHead(302, { Location: `${base}/${req.url.slice(1)}` });
                    res.end();
                    return;
                  }
                  next();
                },
              });
            };
          },
        },
      },
    ],
  },

  integrations: [
    react(),
    sitemap(),
    {
      name: "isolate-vite-caches",
      hooks: {
        "astro:config:setup": ({ command, updateConfig }) => {
          // Builds also optimize React; keep their production runtime out of dev.
          updateConfig({ vite: { cacheDir: `node_modules/.vite/${command}` } });
        },
      },
    },
  ],
});
