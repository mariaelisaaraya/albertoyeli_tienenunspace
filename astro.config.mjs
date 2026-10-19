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
const site = "https://TU-USUARIO.github.io";
const base = "/albertoyeli";

// https://astro.build/config
export default defineConfig({
  site,
  base,
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react(), sitemap()],
});
