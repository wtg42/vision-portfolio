## Why

The local photo optimizer can safely generate web derivatives, but it does not record which source content has already been processed or whether a source changed afterward. As the local staging directory grows, developers need a deterministic way to distinguish new, unchanged, changed, and broken work without relying on filenames or memory.

## What Changes

- Split the ignored local photo staging area into `inbox` and `processed` states.
- Add an ignored, versioned local manifest that records source SHA-256, stable slug, processing time, pipeline version, and derivative hashes.
- Add a status command that classifies local sources and derivative state without changing files.
- Add a higher-level process command that generates and validates derivatives, updates the manifest, and moves the source only after the complete operation succeeds.
- Require explicit replacement when changed source content targets an existing slug.
- Keep optimization state separate from publication state; catalog membership remains the source of truth for whether a work is published.
- Migrate the existing Taipei Skyline source into the managed processed state.

## Capabilities

### New Capabilities

- `local-photo-processing-state`: Tracks local source identity and processing state through ignored inbox, processed storage, a SHA-256 manifest, and read-only status reporting.

### Modified Capabilities

- `local-photo-asset-pipeline`: Extends local derivative generation with a transactional process workflow, explicit replacement protection, and post-success source movement while preserving the existing low-level optimizer and CI independence.

## Impact

- Affects `photo-sources/`, the local photo CLI scripts, photo-pipeline library code, package scripts, tests, and `docs/photo-workflow.md`.
- Adds no runtime service, browser API, or production dependency; source files and the manifest remain ignored and local.
- Does not change published catalog metadata automatically and does not make the repository-local source area a durable photo backup.
