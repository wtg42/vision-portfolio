// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  fonts: [
    {
      provider: fontProviders.local(),
      name: "IBM Plex Mono",
      cssVariable: "--font-ibm-plex-mono",
      weights: [400, 500],
      styles: ["normal"],
      formats: ["woff2"],
      fallbacks: [
        "SFMono-Regular",
        "Cascadia Code",
        "Roboto Mono",
        "Consolas",
        "Liberation Mono",
        "PingFang TC",
        "Noto Sans TC",
        "Microsoft JhengHei",
        "monospace",
      ],
      options: {
        variants: [
          {
            src: [
              "./src/assets/fonts/ibm-plex-mono/IBMPlexMono-Regular.woff2",
            ],
            weight: 400,
            style: "normal",
            display: "swap",
          },
          {
            src: [
              "./src/assets/fonts/ibm-plex-mono/IBMPlexMono-Medium.woff2",
            ],
            weight: 500,
            style: "normal",
            display: "swap",
          },
        ],
      },
    },
  ],

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },
});
