## Why

The current site is an early Astro portfolio prototype whose generic hero, category cards, and film-roll gallery do not establish a distinctive visual identity or provide a scalable way to present finished photography. Redesigning it as a restrained Retro CRT photographic terminal creates a memorable portfolio while keeping the photographs—not the interface effects—as the primary visual focus.

## What Changes

- Replace the existing hero, feature-card, and film-roll presentation with a responsive single-page photographic terminal workspace.
- Introduce a dark phosphor-green visual system with restrained scanlines, glow, noise, terminal chrome, and accessible reduced-motion behavior.
- Add clickable command-style navigation and category filters without requiring visitors to type commands.
- Add a centralized, typed catalog for locally bundled portfolio photographs and their display metadata.
- Add a full-screen terminal-styled photo viewer with captions, previous/next navigation, keyboard support, and focus management.
- Optimize bundled portfolio images for responsive delivery while preserving natural photo color.
- Remove unused prototype components and the separate gallery route once equivalent single-page behavior is available.
- Keep the site static and hosting-provider-neutral; do not add accounts, uploads, visitor photo-library access, a backend, or Codex Sites hosting.

## Capabilities

### New Capabilities

- `terminal-portfolio-experience`: Responsive single-page terminal shell, visual system, navigation, content sections, accessibility, and motion behavior.
- `photography-catalog`: Typed local portfolio data, category filtering, responsive thumbnails, metadata, and empty-state behavior.
- `photo-viewer`: Immersive modal viewing, sequential navigation, keyboard interaction, captions, and close/focus behavior.

### Modified Capabilities

None. The repository does not currently contain OpenSpec capability specifications.

## Impact

- Reworks the Astro page composition, global styling, and React interaction boundaries.
- Replaces the current `HeroWithOverlayImage`, `FeatureGrid`, and `FilmRoll` UI flow and makes `/gallery` obsolete.
- Adds portfolio content metadata and optimized local image usage under the existing source tree.
- Updates component tests and may add interaction-focused tests for filtering and the photo viewer.
- Preserves the current Astro, React, Tailwind CSS, Vitest, and static asset toolchain without adding a server-side dependency.
