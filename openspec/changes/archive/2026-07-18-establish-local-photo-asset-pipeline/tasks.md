## 1. Source Staging and Tooling

- [x] 1.1 Add the fully ignored `/photo-sources/` staging rule and document how the directory is created, used, and backed up outside Git.
- [x] 1.2 Add a direct pinned image-processing development dependency and npm commands for local optimization and CI-compatible asset verification.

## 2. Local Photo Optimizer

- [x] 2.1 Implement the photo optimizer CLI with explicit input and slug validation, deterministic destination paths, temporary output files, and atomic pair replacement.
- [x] 2.2 Normalize EXIF orientation and sRGB color, prevent enlargement, strip source metadata, and emit 960 px quality-80 thumbnail and 2200 px quality-88 full-view WebP variants with a size report.
- [x] 2.3 Add automated optimizer tests for valid output, small-source handling, invalid input, metadata removal, and protection against partial or unintended overwrite.

## 3. Asset Policy Verification

- [x] 3.1 Implement verification for catalog variant presence, WebP decoding, intrinsic dimensions, 500 KiB thumbnail and 2 MiB full-view budgets, forbidden metadata, ignored source staging, and prohibited tracked source formats.
- [x] 3.2 Add verification fixtures and failure-case tests, then run the asset policy command in the GitHub Actions quality workflow before the production build.

## 4. Catalog and Existing Asset Migration

- [x] 4.1 Preserve the current Taipei Skyline original in local staging, generate both derivatives, and visually compare crop, orientation, color, and detail with the existing rendering.
- [x] 4.2 Change catalog types and records to import explicit thumbnail and full-view assets, remove build-time `getImage()` generation, and update component/page tests for the new contract.
- [x] 4.3 Remove the 6.5 MB JPEG from the active Git tree after migration and either document a valid use for `Cerberus.png` or remove that unused tracked asset.

## 5. Acceptance and Documentation

- [x] 5.1 Run photo verification, Astro check, the non-watch test suite, and a clean production build; inspect output to confirm no original, forbidden metadata, server entrypoint, or unexpected oversized asset is published.
- [x] 5.2 Browser-test the migrated site at mobile, tablet, and desktop widths, including thumbnail loading, viewer full image, keyboard controls, category behavior, legacy redirect, natural photo rendering, and console output.
- [x] 5.3 Record actual before/after repository and delivery sizes, confirm `/photo-sources/` content remains untracked, and finalize the add-or-update photo workflow and rollback notes.
