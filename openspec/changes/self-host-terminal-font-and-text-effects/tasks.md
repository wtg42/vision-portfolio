## 1. Font Acquisition and Records

- [x] 1.1 Retrieve IBM Plex Mono from the official IBM project, inspect candidate WOFF2 metadata and weights, compare variable versus static payloads, and select only normal 400/500 coverage within 150 KiB.
- [x] 1.2 Add the selected local WOFF2 asset or assets with the OFL license and a provenance record containing the source, version, supported weights, and measured byte size.

## 2. Astro Font Delivery and Typography Roles

- [x] 2.1 Register the repository-owned font with Astro's local Fonts API using explicit normal weights and `font-display: swap`, then emit the shared font resource with only the necessary above-the-fold preload.
- [x] 2.2 Replace the ambiguous global mono token with terminal-display and readable-text stacks, retaining reliable monospace and Traditional Chinese system fallbacks without font synthesis.
- [x] 2.3 Assign commands, navigation, controls, metadata, and headings to the terminal stack and long-form Chinese descriptions to the reading stack; update typography tests or assertions for the new roles.

## 3. Accessible Terminal Text Effects

- [x] 3.1 Add a progressively enhanced phosphor gradient and bounded bloom to the semantic hero identity while preserving a solid-color fallback.
- [x] 3.2 Refine the outlined `PORTFOLIO` word with a subtle CSS-generated scanline or signal-dropout mask that does not compromise glyph recognition.
- [x] 3.3 Apply only restrained, mostly static treatment to selected section headings and confirm no effect selector, overlay, filter, or compositing layer touches photograph pixels.
- [x] 3.4 Add feature-query fallbacks and reduced-motion rules that freeze scanline and mask states, eliminate flicker or glitch motion, and preserve contrast and semantic text.

## 4. Local and Hosted Acceptance

- [x] 4.1 Add or update automated checks for semantic heading text, single accessible names, font configuration, local-only resource URLs, fallback tokens, and effect scoping.
- [x] 4.2 Run Astro check, the non-watch test suite, and a clean production build; verify WOFF2-only output, combined payload at or below 150 KiB, minimal preload count, hashed font URLs, and no third-party font request.
- [x] 4.3 Browser-test font loading and layout at approximately 320, 768, and 1440 px, including fallback-before-load behavior, Traditional Chinese copy, zoom, keyboard focus, photo viewer, reduced motion, unsupported-effect fallback, horizontal overflow, and console output.
- [ ] 4.4 Validate the hosted preview's font response, immutable cache policy, layout stability, motion preference, and unchanged natural photograph rendering before production merge.
