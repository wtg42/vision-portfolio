## Context

The repository already has a local Sharp-based optimizer that accepts an explicit source path and slug, validates two WebP variants, and replaces their destination directory atomically. Original photographs live in the ignored `photo-sources/` directory, while CI and production use only tracked derivatives.

The missing layer is local workflow state. Output-directory existence cannot prove which source bytes produced a derivative, detect a changed original, or explain a missing/mismatched result. The solution must remain local, work without a source directory in CI, avoid uploading private originals, and preserve the existing catalog as the publication source of truth.

## Goals / Non-Goals

**Goals:**

- Make new, previously processed, changed, and inconsistent photo work identifiable from local content and recorded state.
- Move a source from inbox to processed storage only after derivative generation and state recording succeed.
- Make repeated processing idempotent and require explicit intent before replacing an existing slug.
- Preserve the existing derivative safety, privacy normalization, output paths, and CI verification.
- Provide a recoverable migration for the existing Taipei Skyline source.

**Non-Goals:**

- Treating `photo-sources/` as a durable photo archive or backup.
- Uploading originals or the manifest to Git, Cloudflare, or another service.
- Automatically inventing portfolio titles, categories, descriptions, or catalog entries.
- Automatically committing or deploying processed work.
- Batch-assigning slugs to arbitrary camera filenames in the first version.

## Decisions

### Use ignored inbox, processed storage, and a local versioned manifest

The workflow will use:

```text
photo-sources/
├── inbox/
├── processed/
│   └── <slug>/
└── .manifest.json
```

The whole tree remains ignored. The manifest will contain a schema version and entries keyed by stable slug. Each entry records the current source SHA-256, relative processed path, original filename, processing timestamp, pipeline version, and SHA-256 plus dimensions and bytes for both derivative variants.

Keying by slug aligns state with the tracked output directory and catalog work identity. Source hashes detect byte-level identity independently of filenames. A JSON manifest is inspectable and can be atomically replaced without adding a database dependency.

Alternatives considered:

- Output existence alone cannot distinguish stale derivatives from current ones.
- Filename-only records cannot detect changed content and collide with common camera names.
- A tracked manifest would expose local source workflow details and make fresh clones appear to require unavailable originals.

### Keep optimization and publication as separate states

`photos:status` will derive processing state from the ignored source tree, manifest, and derivative hashes. It will separately report whether `src/data/photos.ts` references the slug. A manifest entry means derivatives were successfully produced from known source bytes; it does not mean the work is published.

This prevents a locally processed photograph from appearing published before its human-authored title, category, alt text, location, and description are reviewed.

### Add a stateful coordinator without removing the low-level optimizer

The existing `photos:optimize -- --input ... --slug ...` command remains available for explicit low-level regeneration. A new command will provide the managed workflow:

```sh
npm run photos:process -- --input photo-sources/inbox/example.jpg --slug example
```

The process command will validate that the input is inside `inbox`, compute its SHA-256, inspect any existing slug record, prepare derivatives, validate their policy, commit workflow state, and report the next catalog step.

If the same slug and source hash are already recorded with matching derivatives, the command exits successfully as a no-op. If the slug exists with a different source hash, it exits without changes unless `--replace` is supplied.

### Commit source state, derivatives, and manifest as one recoverable transaction

The pipeline library will separate derivative preparation from final commit so the coordinator can stage:

- the complete derivative directory,
- the next manifest file, and
- the processed-source destination.

All paths are within the repository filesystem. Commit uses rename-based swaps with backups. If any rename or validation step fails, the coordinator restores the prior derivative directory and manifest and leaves or restores the input under `inbox`. Temporary and backup paths are cleaned after success or rollback.

The current source is stored below `processed/<slug>/` with a content-derived filename. On an explicit replacement, the previous source is retained as superseded local material rather than deleted automatically; the manifest points only to the current source.

### Make status read-only and deterministic

`npm run photos:status` will not create, move, optimize, or repair files. It will scan the manifest, inbox, processed tree, tracked derivative directories, and catalog imports and report:

- `new`: inbox content hash has no manifest match;
- `processed`: manifest source and derivative hashes match;
- `changed`: a known slug's current source bytes differ from its manifest record;
- `broken`: recorded source or derivative files are missing, malformed, or hash-mismatched;
- `published`: an additional flag derived from catalog membership.

Unrecognized files and malformed manifest data produce actionable diagnostics and a non-zero exit where integrity is uncertain.

### Version the manifest and pipeline fingerprint

The first manifest schema uses version `1`. Each record includes a pipeline version or deterministic settings fingerprint covering output format, bounds, quality, color normalization, and metadata policy. A future settings change can therefore report an entry as needing regeneration even when source bytes are unchanged.

Unsupported manifest versions fail safely instead of being rewritten implicitly.

## Risks / Trade-offs

- **[Ignored manifest can be lost]** → Document that it is reconstructible local workflow state, not the only copy of original photographs; provide status diagnostics and an explicit migration/bootstrap path.
- **[Rename transaction is not a database transaction]** → Keep all managed paths on one filesystem, use staged paths and backups, test failures at each commit boundary, and restore prior state on error.
- **[Processed storage can accumulate superseded originals]** → Retain them intentionally to avoid destructive automation and document optional manual cleanup after external backups are confirmed.
- **[Direct use of the low-level optimizer can bypass manifest state]** → Status detects derivative hash drift and reports `broken`; documentation recommends the managed process command for normal work.
- **[Catalog parsing may become brittle]** → Reuse the existing asset-verification conventions and treat publication reporting as advisory rather than mutating catalog code.

## Migration Plan

1. Add the directory helpers, manifest schema parser/writer, hashing, status classifier, and transactional coordinator with unit tests.
2. Add `photos:status` and `photos:process` package scripts while retaining `photos:optimize`.
3. Bootstrap `photo-sources/taipei-skyline.jpg` through the managed workflow with slug `taipei-skyline`, confirming generated derivative hashes remain policy-compliant.
4. Move the source into `processed/taipei-skyline/`, create the local manifest entry, and update workflow documentation.
5. Run photo verification, unit tests, Astro checks, and a production build.

Rollback reverts tracked code and documentation. Because the source tree and manifest are ignored, rollback instructions will move any current processed source back to inbox if the older workflow is required; no command will delete the source automatically.

## Open Questions

None for the first version. Automatic batch slug assignment and optional manifest reconstruction can be considered in a later change.
