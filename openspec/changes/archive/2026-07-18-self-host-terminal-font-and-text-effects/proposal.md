## Why

The terminal interface currently depends on whichever monospace font happens to
be installed on each visitor's device, so typography and line metrics vary
across platforms. Self-hosting an intentional terminal typeface also creates a
stable foundation for restrained phosphor, scanline, and masking treatments
without compromising the photographs or readable content.

## What Changes

- Vendor an approved IBM Plex Mono webfont and its license in the repository.
- Configure Astro's local font support so required files are self-hosted,
  hashed, cached, and selectively preloaded without third-party font requests.
- Define separate terminal-display and readable-text font tokens with suitable
  Traditional Chinese system fallbacks.
- Apply restrained gradient, outline, scanline, glow, and optional mask
  treatments to selected display headings rather than body text.
- Keep photographs free of terminal filters and preserve real semantic text
  instead of replacing headings with images, Canvas, or inaccessible duplicates.
- Provide solid-color and motionless fallbacks for unsupported CSS features and
  `prefers-reduced-motion: reduce`.
- Verify font loading, layout stability, contrast, responsive rendering, and
  browser-console behavior on local and hosted builds.

## Capabilities

### New Capabilities

- `self-hosted-terminal-typography`: Defines local font ownership, licensed
  storage, optimized Astro delivery, typography roles, and fallback behavior.

### Modified Capabilities

- `terminal-portfolio-experience`: Extends the terminal visual language with
  accessible, text-only post-processing effects while preserving legibility,
  reduced-motion behavior, and natural photograph rendering.

## Impact

- Affects `astro.config.mjs`, the shared layout head, global typography tokens
  and heading styles, local font assets and license records, visual regression
  checks, and relevant accessibility tests.
- Adds a small self-hosted font payload under hashed Astro assets while removing
  runtime dependence on platform-specific Latin monospace fonts.
- Does not add a CDN dependency, a full CJK webfont, Canvas or WebGL effects, or
  post-processing on portfolio photographs.
