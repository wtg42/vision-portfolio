## 1. Local State Model

- [x] 1.1 Add inbox, processed, and manifest path helpers while preserving full Git ignore coverage and CI operation without `photo-sources/`.
- [x] 1.2 Implement SHA-256 file hashing, the version 1 manifest schema validator, pipeline settings fingerprinting, and atomic manifest read/write helpers.
- [x] 1.3 Implement read-only status classification for new, processed, changed, and broken state plus independent catalog publication reporting.

## 2. Managed Processing Workflow

- [x] 2.1 Refactor derivative preparation and commit boundaries so the existing low-level optimizer retains its current CLI behavior.
- [x] 2.2 Implement the transactional managed-processing coordinator with inbox validation, idempotent no-op behavior, explicit `--replace` protection, processed-source placement, backups, and rollback cleanup.
- [x] 2.3 Add `photos:process` and `photos:status` CLI entry points, package scripts, actionable summaries, and non-zero exits for invalid or inconsistent state.

## 3. Automated Verification

- [x] 3.1 Add tests for manifest validation and version rejection, source and derivative hashing, pipeline fingerprint drift, status classification, and publication-state separation.
- [x] 3.2 Add tests for first-time processing, identical-content no-op, changed-content replacement protection, explicit replacement, retained superseded sources, and processed path layout.
- [x] 3.3 Add failure-injection tests proving derivative, source, and manifest state roll back at every transaction boundary and the low-level optimizer remains compatible.

## 4. Migration and Documentation

- [x] 4.1 Bootstrap the ignored `taipei-skyline.jpg` into `processed/taipei-skyline/`, create its local manifest record, and confirm its tracked derivatives remain policy-compliant.
- [x] 4.2 Update the photo workflow documentation with inbox, status, process, replacement, publication, recovery, backup, and optional superseded-source cleanup guidance.
- [x] 4.3 Run `photos:status`, `photos:verify`, Astro check, all tests, production build, OpenSpec strict validation, and Git ignore verification.
