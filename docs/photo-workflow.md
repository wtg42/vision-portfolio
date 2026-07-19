# Local Photo Asset Workflow

Portfolio source photographs stay local. Git contains only the optimized WebP
variants used by the static site.

## Directory contract

| Path | Git | Purpose |
| --- | --- | --- |
| `photo-sources/inbox/` | Ignored | New or updated high-resolution photographs waiting for managed processing |
| `photo-sources/processed/<slug>/` | Ignored | Sources retained after successful processing, including superseded source versions |
| `photo-sources/.manifest.json` | Ignored | Versioned local ledger of source, pipeline, and derivative SHA-256 values |
| `src/assets/images/portfolio/<slug>/thumbnail.webp` | Tracked | Works-index image |
| `src/assets/images/portfolio/<slug>/full.webp` | Tracked | Photo-viewer image |

The entire `photo-sources/` tree is local and ignored. It is not an archive or
backup. Keep every original in a primary photo library with an independent
backup, such as Photos, Lightroom, a NAS, or external storage. The managed
processor creates inbox and processed directories when necessary, and the site
must build successfully when all local state is absent.

The manifest is reconstructible workflow state, not a substitute for the
original library. It records the current source for each stable slug, the
pipeline settings fingerprint, and the hashes and measurements of both WebP
variants.

## Add or update a photograph

1. Finish crop, color, and exposure work in the primary photo application.
2. Export or copy the high-resolution result into `photo-sources/inbox/`.
3. Choose a stable lowercase kebab-case slug.
4. Inspect current local state without changing files:

   ```sh
   npm run photos:status
   ```

5. Generate the two tracked variants, record the manifest entry, and move the
   source into slug-scoped processed storage:

   ```sh
   npm run photos:process -- \
     --input photo-sources/inbox/example.jpg \
     --slug example
   ```

6. Review the generated thumbnail and full image for crop, orientation, color,
   and detail.
7. Import both WebP files in `src/data/photos.ts` and add or update the catalog
   metadata.
8. Verify local state, asset policy, and the application:

   ```sh
   npm run photos:status
   npm run photos:verify
   npm run check
   npm test -- --run
   npm run build
   ```

9. Stage only the generated WebP files, catalog changes, tests, and intentional
   documentation. Confirm original files remain ignored with:

   ```sh
   git check-ignore -v photo-sources/*
   ```

`processed` and `published` are independent. Successful processing means the
source and WebP pair match the local manifest. A work becomes published only
after `src/data/photos.ts` imports its derivatives and provides reviewed
metadata.

## Status meanings

- `new`: inbox content is not represented in the manifest.
- `processed`: source bytes, pipeline fingerprint, and both derivatives match.
- `changed`: known source bytes or pipeline settings differ and regeneration is
  required.
- `broken`: a recorded source or derivative is missing, malformed, or has the
  wrong hash. The status command exits unsuccessfully.
- `published` / `not published`: independent catalog membership reported
  alongside the processing state.

The status command is read-only. It never creates directories, moves originals,
regenerates derivatives, repairs the manifest, or edits the catalog.

## Replacing an existing work

Submitting different source bytes for an existing slug fails safely by default.
After confirming the new source is intended to replace the current work, run:

```sh
npm run photos:process -- \
  --input photo-sources/inbox/example.jpg \
  --slug example \
  --replace
```

The new source becomes current in the manifest. Previous processed sources
remain below `photo-sources/processed/<slug>/` so automation never destroys a
local original. They may be removed manually only after the external primary
library and backup are confirmed.

Running the command again with identical source bytes and matching derivatives
is an idempotent no-op. The duplicate inbox file is left untouched so the
workflow never deletes a source implicitly.

## Recovery

The managed command stages the source destination, derivative pair, and next
manifest before committing them. If source movement, derivative replacement, or
manifest replacement fails, it restores the previous derivatives and manifest
and returns the input to inbox. Review the error, run `npm run photos:status`,
and retry after correcting the underlying filesystem or image problem.

The low-level command remains available for deliberate derivative-only work:

```sh
npm run photos:optimize -- \
  --input photo-sources/processed/example/<source-hash>.jpg \
  --slug example
```

Because it bypasses the local ledger, normal additions and replacements should
use `photos:process`; a derivative-only change will be reported by status until
the managed state is reconciled.

## Output policy

- Thumbnail: maximum width 960 px, WebP quality 80, maximum 500 KiB.
- Full view: maximum width 2200 px, WebP quality 88, maximum 2 MiB.
- Smaller sources are never enlarged.
- Outputs preserve aspect ratio, honor source orientation, use sRGB, and omit
  EXIF, GPS, camera, software, and capture-date metadata.
- Both variants are replaced as one operation; a failed conversion leaves the
  previous pair untouched.

## Taipei Skyline migration baseline

Measured on 2026-07-18:

| Scope | Before | After | Change |
| --- | ---: | ---: | ---: |
| Active tracked raster assets | 6,832,889 B (6.52 MiB) | 98,412 B (96.1 KiB) | -6,734,477 B (-98.56%) |
| Taipei Skyline portfolio asset | 6,519,130 B (6.22 MiB JPEG) | 98,412 B (two WebP variants) | -6,420,718 B (-98.49%) |
| Published Taipei Skyline variants | 105,262 B | 98,412 B | -6,850 B (-6.51%) |

The tracked-asset baseline includes the removed, unused 313,759 B
`Cerberus.png`. The published baseline is the thumbnail and full-view WebP pair
from the Cloudflare Pages production deployment immediately before this
migration. The new pair contains a 13,592 B thumbnail and an 84,820 B full-view
image.

## Rollback

Revert the catalog and derivative commit together. The optimizer never deletes
the local source. If the managed workflow code is rolled back, move the current
source from `photo-sources/processed/<slug>/` back into `photo-sources/inbox/`
before using the older command. The ignored manifest may remain as local
recovery evidence or be removed after an external backup is confirmed.

Removing an original from the current Git tree does not erase it from older Git
history; rewriting history is intentionally outside this workflow.
