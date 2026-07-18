## Context

The catalog currently imports `src/assets/images/DSC_1587.jpg`, a 6.5 MB,
5568 × 1856 camera export that retains EXIF metadata. `src/pages/index.astro`
uses Astro `getImage()` during every build to derive a 960 px thumbnail and a
2200 px full-view WebP. This makes the private source file a required,
Git-tracked build input and sends unnecessary data through repository clones and
hosted builds.

The new workflow must preserve the current static deployment, typed catalog,
lazy-loading behavior, natural photograph rendering, and viewer interaction. It
must also remain approachable for adding a small number of manually curated
portfolio works.

## Goals / Non-Goals

**Goals:**

- Keep original and high-resolution edited photographs in a predictable local
  directory that is ignored by Git and unnecessary for CI or production builds.
- Produce consistent, reviewed thumbnail and full-view WebP files locally before
  they are committed.
- Normalize orientation and color while removing EXIF, GPS, camera, software,
  and date metadata from committed images.
- Make catalog records explicitly reference both delivery variants.
- Detect missing, malformed, unexpectedly large, or accidentally tracked source
  assets before merge.
- Reduce repository and build input size without changing the visible Taipei
  Skyline presentation.

**Non-Goals:**

- Archiving or backing up original photographs.
- Rewriting existing Git history to erase the already committed JPEG.
- Automating color grading, artistic crops, focal-point selection, or photo
  curation.
- Runtime image transformation, visitor uploads, browser photo-library access,
  Cloudflare Images, R2, or a media backend.
- Generating AVIF, responsive `srcset` families, or multiple art-directed crops
  in this change.

## Decisions

### Use a completely ignored root staging directory

Originals will be staged under `/photo-sources/`, and `.gitignore` will ignore
the entire directory. A tracked workflow document outside that directory will
explain that the optimizer creates it when absent and that it is not a backup.

Keeping the directory outside `src/` and `public/` prevents Astro from treating
sources as build inputs or copying them into output. A partially tracked folder
with `.gitkeep` was rejected because it weakens the rule that the source tree is
strictly local.

### Commit two final delivery variants per work

Each work will own stable files at:

```text
src/assets/images/portfolio/<slug>/thumbnail.webp
src/assets/images/portfolio/<slug>/full.webp
```

The default thumbnail will fit within 960 px width at WebP quality 80, and the
full variant within 2200 px width at quality 88. The processor will not enlarge
smaller inputs. Initial file budgets are 500 KiB for a thumbnail and 2 MiB for a
full variant; these are validation ceilings, not quality targets.

Committing final variants rather than an intermediate web master makes CI fully
independent of private sources and image-codec differences, minimizes Git
growth, and removes repeated hosted transformations. The trade-off is two files
per work and a required local regeneration step when the image changes.

### Use a project-owned Node CLI with a direct image dependency

A tracked `scripts/optimize-photo.mjs` command, exposed through an npm script,
will accept an input path and stable slug. It will use a direct, pinned `sharp`
development dependency instead of relying on Astro's transitive dependencies.

The pipeline will:

1. validate the input and slug;
2. honor EXIF orientation;
3. convert pixels to sRGB;
4. resize without enlargement;
5. encode the two WebP variants;
6. omit source metadata;
7. write through temporary files and replace outputs only after both succeed;
8. report dimensions and before/after byte sizes.

A narrow CLI is preferred over a watch process or GUI because the collection is
curated, the transformation must be reviewable, and no daemon is needed.

### Make verification separate from generation

`npm run photos:verify` will operate only on tracked catalog inputs and therefore
run in CI. It will verify that every catalog work imports two WebP files, each
file is decodable, dimensions do not exceed its target, byte budgets are met,
and forbidden metadata is absent. It will also confirm `/photo-sources/` is
ignored and fail if catalog source formats or known raw extensions are tracked
under the portfolio asset directory.

Generation remains a deliberate local action; CI will never synthesize missing
assets from unavailable originals.

### Change the catalog contract to explicit variants

`PhotoRecord` will replace its singular `image: ImageMetadata` field with
`thumbnail: ImageMetadata` and `full: ImageMetadata`. The page will pass their
URLs and intrinsic dimensions directly into `PhotoViewModel`, removing the
build-time `getImage()` loop while keeping the full image absent from the DOM
until the viewer opens.

This preserves the current component contract at the rendering boundary while
making missing derivatives compile-time or build-time failures.

## Risks / Trade-offs

- **[Risk] Untracked originals are mistaken for backups** → Document the folder
  as disposable staging and require originals to remain in the photographer's
  primary library and backup system.
- **[Risk] Re-encoding reduces photographic quality** → Preserve the current
  tested dimensions and quality settings, require visual comparison during
  migration, and allow future per-work overrides only through an explicit
  design extension.
- **[Risk] Metadata survives conversion** → Verify output metadata rather than
  assuming encoder defaults, and fail the asset check when forbidden fields are
  present.
- **[Risk] A failed conversion leaves mismatched variants** → Write both outputs
  to temporary paths and replace the destination pair only after success.
- **[Risk] Platform codec versions produce different bytes** → Commit and review
  generated outputs; CI validates artifacts but does not regenerate them.
- **[Risk] Removing the current JPEG does not remove it from history** → State
  this explicitly and avoid destructive history rewriting unless privacy needs
  later justify a dedicated repository migration.
- **[Trade-off] Two tracked files per work require extra catalog imports** →
  Accept the small authoring cost in exchange for explicit delivery behavior and
  much smaller repository inputs.

## Migration Plan

1. Add the ignored source directory rule, optimizer, verifier, dependency, and
   workflow documentation without removing the current image.
2. Copy or move the current JPEG into local `/photo-sources/`, generate the two
   derivatives, and visually compare them with the current local production
   rendering.
3. Change catalog imports and types to the derivative pair, update tests, and
   remove build-time image generation.
4. Remove the 6.5 MB JPEG from the active Git tree and resolve the unused
   `Cerberus.png` asset.
5. Run asset verification, Astro check, tests, build, responsive browser QA, and
   inspect the built output and metadata.
6. Commit the derivative assets and pipeline together so no intermediate commit
   leaves the build without valid images.

Rollback uses a Git revert of the migration commit. The ignored local original
must not be deleted by automation, so it remains available to regenerate or
compare outputs. Existing Git history is preserved.

## Open Questions

None required before implementation. Per-work crops, additional formats, and
remote original backup can be evaluated in later changes.
