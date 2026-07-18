## Context

The global stylesheet currently defines a system-only monospace stack beginning
with `SFMono-Regular`, so the exact Latin typeface and metrics vary by operating
system. Traditional Chinese glyphs already fall through to an implicit system
font. The hero uses color, outline, and glow, while reduced-motion handling
globally suppresses animations; there are no downloaded fonts or text masks.

The project uses Astro 7, whose local Fonts API can register repository-owned
files, emit font CSS and preload hints, optimize fallbacks, and publish font
files under hashed Astro assets. Cloudflare already applies immutable caching to
`/_astro/*`.

## Goals / Non-Goals

**Goals:**

- Give the terminal interface consistent Latin letterforms and metrics with a
  self-hosted, licensed IBM Plex Mono webfont.
- Keep font delivery private, reproducible, cacheable, and independent of a
  third-party runtime CDN.
- Separate terminal-display typography from long-form reading typography and
  retain high-quality Traditional Chinese system fallbacks.
- Add restrained post-processing to selected headings while preserving semantic
  text, contrast, responsive layout, and reduced-motion behavior.
- Keep photographs natural and visually dominant.

**Non-Goals:**

- Hosting a full CJK webfont or forcing Chinese glyphs into a monospace design.
- Replacing body copy, headings, or controls with images, duplicated accessible
  text, Canvas, SVG text, or WebGL.
- Applying masks, tint, scanlines, blur, blend modes, or glow to photographs.
- Building a general theme editor, user-controlled effect settings, or multiple
  font themes.
- Using Google Fonts, another browser-time CDN, or remote CSS.

## Decisions

### Vendor a minimal official IBM Plex Mono WOFF2 set

The implementation will obtain the normal IBM Plex Mono webfont from an official
IBM release, verify its license and metadata, and commit only the WOFF2 file or
files needed to cover weights 400 and 500. The adjacent OFL license and a short
source/version record will also be committed.

A single normal variable WOFF2 is preferred when its verified size is no larger
than the equivalent two static files. Otherwise, static 400 and 500 WOFF2 files
will be used. The combined font payload budget is 150 KiB. Italics and unused
weights are excluded.

IBM Plex Mono was selected over JetBrains Mono because its less code-editor-like
forms fit an editorial photography archive, and over a pixel font because it
remains readable for navigation and metadata.

### Use Astro's local Fonts API

`astro.config.mjs` will register the local file through Astro's local provider
with `font-display: swap`, an explicit normal style, and only the supported
weight range. `Layout.astro` will emit the shared `<Font>` resource and preload
only the single file or minimal variant needed by above-the-fold terminal text.

This is preferred over handwritten public URLs because Astro can publish hashed
assets, generate optimized fallback metrics, and centralize preload behavior.
It is preferred over a provider download at build time because repository-owned
font bytes make offline and hosted builds deterministic.

### Define explicit display and reading tokens

Global CSS will replace the ambiguous `--mono` token with:

- `--font-terminal`: IBM Plex Mono followed by the existing reliable monospace
  fallbacks, for navigation, commands, labels, controls, metadata, and display
  headings.
- `--font-reading`: Traditional Chinese system sans fallbacks such as
  `PingFang TC` and `Noto Sans TC`, followed by `system-ui` and sans-serif, for
  longer Chinese descriptions and about copy.

The HTML remains readable before the webfont arrives. Existing font synthesis
will stay disabled so browsers do not invent unavailable styles.

### Build effects from paint-only CSS layers

The actual heading glyphs remain the foreground content. Effects will use:

1. a solid phosphor color as the universal fallback;
2. `background-clip: text` inside `@supports` for a restrained phosphor
   gradient and scanline texture;
3. existing text stroke where appropriate;
4. bounded `text-shadow` or `drop-shadow()` for phosphor bloom;
5. an optional CSS-gradient `mask-image` on the outlined `PORTFOLIO` word for
   subtle signal dropout.

No raster noise asset is needed initially. Paint-only properties avoid changing
layout geometry. Effects are limited to the hero identity and selected section
headings; commands and body copy remain clean.

`background-clip` is the primary glyph fill technique. `mask-image` is
secondary because it removes parts of a glyph and therefore carries greater
legibility risk.

### Treat motion and feature support as progressive enhancement

Feature queries will enable clipped fills and masks only when supported. Without
them, headings retain their solid color, outline, and readable contrast.

Any scanline movement will be slow, non-flashing, and limited to background
position or opacity. Under `prefers-reduced-motion: reduce`, it will render at a
static position with no flicker, glitch, or animated mask. Effects must not
change text content, accessible names, focus order, pointer targets, or document
flow.

### Verify typography on real build outputs

Acceptance will inspect local and Cloudflare outputs for:

- no third-party font or stylesheet requests;
- successful self-hosted WOFF2 loading and immutable asset caching;
- font payload and preload count;
- stable hero and section layout at approximately 320, 768, and 1440 px;
- solid and reduced-motion fallbacks;
- readable Chinese fallback rendering;
- unchanged photo pixels and viewer behavior;
- no console, accessibility, Astro check, test, or build regressions.

## Risks / Trade-offs

- **[Risk] Font swap causes visible layout shift** → Use Astro optimized
  fallbacks, preload only the above-the-fold font, and compare heading wrapping
  and measured layout before and after load.
- **[Risk] The webfont or license source is ambiguous** → Retrieve from the
  official IBM project, record version and source, retain the OFL file, and
  inspect the downloaded metadata before committing.
- **[Risk] Masked text loses contrast or strokes** → Keep masks subtle and
  limited to large display text, preserve a solid fallback, and test contrast
  and zoom at every target viewport.
- **[Risk] Animated effects distract from photographs** → Use slow paint-only
  movement on the hero only, keep section treatments mostly static, and disable
  all nonessential motion for reduced-motion users.
- **[Risk] GPU compositing or repaint cost harms scrolling** → Avoid large
  blurred layers, raster noise, SVG displacement, and full-page filters; inspect
  browser behavior and remove any effect that creates jank.
- **[Trade-off] Chinese and Latin use different families** → Accept the
  intentional editorial contrast rather than shipping a multi-megabyte CJK font,
  and tune line-height and spacing for mixed-script copy.
- **[Trade-off] Repository size increases slightly** → Enforce a 150 KiB font
  budget and immutable caching in exchange for consistent typography.

## Migration Plan

1. Obtain and inspect the official IBM Plex Mono WOFF2 candidate and license;
   record its source, version, weights, and byte size.
2. Add the local font configuration and shared layout resource while retaining
   the complete existing fallback stack.
3. Introduce terminal and reading tokens, update selectors by role, and verify
   the layout before adding post-processing.
4. Add effects progressively: gradient fill and bloom first, then outline
   treatment, optional subtle mask, and motion fallback.
5. Run static checks, tests, production build, font/network inspection,
   responsive and reduced-motion browser QA, and hosted preview acceptance.
6. Compare the deployed version with the previous accepted production and merge
   only if typography improves without reducing photo prominence or readability.

Rollback is a Git revert to the system stack and previous heading CSS. Since the
font and effects are static assets and styles, no data or runtime migration is
required.

## Open Questions

None required before implementation. A full self-hosted Traditional Chinese
family, alternative terminal faces, and stronger interactive glitch effects are
deferred to separate visual experiments.
