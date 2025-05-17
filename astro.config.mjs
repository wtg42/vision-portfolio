// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import node from "@astrojs/node";

import db from "@astrojs/db";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), db()],

  adapter: node({
    mode: "standalone",
  }),

  vite: {
    plugins: [tailwindcss()],
  },
});