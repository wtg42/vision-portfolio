# Local Photo Asset Workflow

Portfolio source photographs stay local. Git contains only the optimized WebP
variants used by the static site.

## Directory contract

| Path | Git | Purpose |
| --- | --- | --- |
| `photo-sources/` | Ignored | Temporary local staging for original or edited high-resolution photographs |
| `src/assets/images/portfolio/<slug>/thumbnail.webp` | Tracked | Works-index image |
| `src/assets/images/portfolio/<slug>/full.webp` | Tracked | Photo-viewer image |

The `photo-sources/` directory is not an archive or backup. Keep every original
in a primary photo library with an independent backup, such as Photos,
Lightroom, a NAS, or external storage. The optimizer creates the staging
directory when necessary, and the site must build successfully when it is
absent.

## Add or update a photograph

1. Finish crop, color, and exposure work in the primary photo application.
2. Export or copy the high-resolution result into `photo-sources/`.
3. Choose a stable lowercase kebab-case slug.
4. Generate the two tracked variants:

   ```sh
   npm run photos:optimize -- --input photo-sources/example.jpg --slug example
   ```

5. Review the generated thumbnail and full image for crop, orientation, color,
   and detail.
6. Import both WebP files in `src/data/photos.ts` and add or update the catalog
   metadata.
7. Verify the asset policy and application:

   ```sh
   npm run photos:verify
   npm run check
   npm test -- --run
   npm run build
   ```

8. Stage only the generated WebP files, catalog changes, tests, and intentional
   documentation. Confirm original files remain ignored with:

   ```sh
   git check-ignore -v photo-sources/*
   ```

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
the local source, so a retained original can be regenerated or compared after a
rollback. Removing an original from the current Git tree does not erase it from
older Git history; rewriting history is intentionally outside this workflow.
