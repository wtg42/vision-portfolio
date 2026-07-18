## Why

The portfolio currently commits a 6.5 MB camera export with EXIF metadata and
depends on Cloudflare's build to derive web images from that original. A local,
repeatable asset pipeline is needed so private high-resolution sources remain
outside Git while only reviewed, web-ready derivatives enter the repository.

## What Changes

- Add a repository-local but Git-ignored staging directory for original or
  edited high-resolution photographs.
- Add a documented local command that validates, rotates, converts to sRGB,
  strips metadata, and emits stable thumbnail and full-view WebP derivatives.
- Store optimized derivatives under the tracked Astro asset tree and reference
  them explicitly from the typed photography catalog.
- Add verification for missing variants, invalid dimensions, oversized output,
  and accidental source-image tracking.
- Migrate the current Taipei Skyline work away from its tracked 6.5 MB JPEG
  source while preserving its visible crop, color, metadata, and viewer
  behavior.
- Audit the currently tracked but unused image asset and either document its
  purpose or remove it from the application asset set.
- **BREAKING**: portfolio development no longer adds high-resolution source
  images directly to the catalog or relies on the production build to create
  both delivery variants from one tracked source.

## Capabilities

### New Capabilities

- `local-photo-asset-pipeline`: Defines ignored source staging, deterministic
  local optimization, tracked derivative outputs, privacy safeguards, and
  asset verification.

### Modified Capabilities

- `photography-catalog`: Changes catalog image inputs from one tracked source
  optimized during every static build to explicit, pre-optimized thumbnail and
  full-view derivatives committed to the repository.

## Impact

- Affects `.gitignore`, local photo tooling and documentation, the photography
  catalog types and records, Astro image imports, tests, and CI verification.
- Removes the current high-resolution JPEG from the active Git tree and replaces
  it with smaller derivative assets; existing Git history is not rewritten.
- Adds a direct development dependency only if the selected image processor is
  not already available as a supported project dependency.
- Does not add visitor uploads, browser photo-library access, runtime image
  processing, server functions, or storage services.
