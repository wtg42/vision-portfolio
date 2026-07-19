# Local Photo Processing State Specification

## Purpose

Define local, content-aware processing state for original photographs while keeping private source files and workflow metadata outside Git.

## Requirements

### Requirement: Ignored local processing ledger
The system SHALL maintain a versioned local manifest within the Git-ignored photo source tree, keyed by stable work slug and recording the current source SHA-256, relative processed-source path, original filename, processing time, pipeline version, and hashes and measurements for both derivative variants.

#### Scenario: A processed source is recorded
- **WHEN** managed processing completes successfully for a source and slug
- **THEN** the manifest contains a complete entry that identifies the exact source and derivative bytes without becoming tracked by Git

#### Scenario: CI runs without local state
- **WHEN** a fresh clone has neither local sources nor a manifest
- **THEN** tracked asset verification and the production build continue to operate without the local processing ledger

#### Scenario: Manifest schema is unsupported
- **WHEN** a local manifest uses an unknown schema version or invalid structure
- **THEN** stateful photo commands fail with a diagnostic and do not rewrite or discard the manifest

### Requirement: Read-only processing status
The system SHALL provide a local status command that inspects inbox sources, processed sources, manifest entries, derivative assets, pipeline settings, and catalog membership without modifying any file.

#### Scenario: New source is waiting
- **WHEN** an inbox file's SHA-256 is not represented by a valid manifest entry
- **THEN** status reports the file as new and does not move or optimize it

#### Scenario: Processed entry is consistent
- **WHEN** the current source, pipeline fingerprint, and both derivative hashes match a manifest entry
- **THEN** status reports the slug as processed

#### Scenario: Recorded content drifted
- **WHEN** a known slug's source hash or pipeline fingerprint differs from its manifest record
- **THEN** status reports the slug as changed and identifies the differing field

#### Scenario: Recorded state is inconsistent
- **WHEN** a recorded source or derivative is missing, malformed, or hash-mismatched
- **THEN** status reports the slug as broken, identifies the inconsistency, and exits unsuccessfully

### Requirement: Idempotent content-aware processing
The system SHALL use SHA-256 source identity and the stable slug to avoid unnecessary regeneration and to distinguish repeated input from replacement content.

#### Scenario: Identical content is processed again
- **WHEN** the requested slug, source SHA-256, pipeline fingerprint, and derivative hashes already match
- **THEN** processing succeeds as a no-op and reports that the work is already processed

#### Scenario: Changed content targets an existing slug
- **WHEN** a source with a different SHA-256 is submitted for a slug that already has a current manifest entry
- **THEN** processing exits without changing sources, derivatives, or manifest unless explicit replacement intent is supplied

#### Scenario: Replacement is explicitly requested
- **WHEN** changed source content targets an existing slug with explicit replacement intent
- **THEN** the new content is processed transactionally and the manifest identifies it as the current source while the prior local source is not automatically deleted

### Requirement: Processing and publication state remain distinct
The system SHALL derive processing state from the local ledger and derivative integrity while deriving publication state from tracked photography catalog membership.

#### Scenario: Work is processed but absent from the catalog
- **WHEN** a slug has valid local processing state and derivatives but no catalog entry
- **THEN** status reports it as processed and not published

#### Scenario: Published work has broken local state
- **WHEN** the catalog references a slug whose local manifest state exists but is inconsistent
- **THEN** status reports publication and the broken local state independently without editing the catalog
