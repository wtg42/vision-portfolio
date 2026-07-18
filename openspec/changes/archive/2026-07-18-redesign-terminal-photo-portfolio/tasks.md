## 1. Portfolio Data and Image Pipeline

- [x] 1.1 Define `PhotoRecord`, category labels, and serializable `PhotoViewModel` types, then seed the catalog with the existing city photograph without duplicating placeholders.
- [x] 1.2 Add the Astro build-time transform that produces optimized thumbnail and full-view URLs while omitting unavailable optional metadata.
- [x] 1.3 Verify generated image dimensions, formats, lazy-loading attributes, and that full-view image elements are not rendered while the viewer is closed.

## 2. Terminal Portfolio Foundation

- [x] 2.1 Update the shared layout with `zh-Hant`, portfolio title and description, theme color, semantic landmarks, and a visible-on-focus skip link.
- [x] 2.2 Implement the server-rendered `PortfolioTerminal` shell with Vision identity, command-style section navigation, introduction, works section, about statement, and status footer.
- [x] 2.3 Replace the DaisyUI look with custom terminal design tokens, responsive editorial layouts, phosphor and amber states, restrained CRT overlays, visible focus styles, and reduced-motion overrides.
- [x] 2.4 Confirm terminal effects never tint, blend, dim, or animate the photograph pixels.

## 3. Catalog Browsing

- [x] 3.1 Implement the `all` filter plus derived non-empty category controls, including programmatic selected state and no-page-reload updates.
- [x] 3.2 Initialize filtering from a recognized `category` query value and fall back to `all` for missing or unknown values.
- [x] 3.3 Implement accessible photo cards with titles, categories, meaningful alternative text, keyboard activation, and a terminal-style empty result state.

## 4. Photo Viewer

- [x] 4.1 Implement the modal terminal viewer with the optimized full-view image, title, available metadata, close control, and responsive mobile/desktop layout.
- [x] 4.2 Implement non-wrapping previous/next navigation within the active filtered order, including disabled edge controls and Left/Right Arrow behavior.
- [x] 4.3 Implement Escape close, focus entry and containment, focus restoration to the originating card, and viewer closure before category changes.

## 5. Route and Toolchain Migration

- [x] 5.1 Replace the current home composition with the new single-page experience and convert `/gallery` into a static redirect that preserves a recognized category query.
- [x] 5.2 Remove obsolete Hero, feature-card, film-roll, and welcome component usage and their superseded tests after equivalent behavior is covered.
- [x] 5.3 Remove DaisyUI and the Node adapter integration, then configure Astro to emit provider-neutral static output without adding hosting-specific files.
- [x] 5.4 Leave visitor photo-library access, uploads, contact collection, backend services, and Codex Sites configuration absent from the implementation.

## 6. Verification

- [x] 6.1 Add Vitest and React Testing Library coverage for terminal content, category filtering, URL initialization, unknown-category fallback, and empty results.
- [x] 6.2 Add interaction tests for opening and closing the viewer, metadata omission, edge controls, arrow navigation, Escape, filter invalidation, and focus restoration.
- [x] 6.3 Run the complete test suite and Astro production build, resolving all failures and confirming static output.
- [x] 6.4 Perform visual QA at approximately 320 px, tablet, and desktop widths, plus keyboard-only and reduced-motion checks, and confirm there is no horizontal overflow.
