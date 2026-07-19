# Local Photo Asset Pipeline Specification

## Purpose

Define a safe, repeatable local workflow for staging original photographs, generating tracked web derivatives, and verifying asset policy without exposing private source files.

## Requirements

### Requirement: Git-ignored local source staging
The system SHALL provide a documented repository-local source directory that is fully ignored by Git, excluded from Astro build inputs, and unnecessary for CI and production builds.

#### Scenario: Developer stages an original photograph
- **WHEN** a developer places a high-resolution or raw photograph in the local source directory
- **THEN** Git ignores the file and the production build does not copy or reference it

#### Scenario: Repository is freshly cloned
- **WHEN** a developer or CI runner checks out the repository without local sources
- **THEN** verification and the production build can run using only tracked derivative assets

### Requirement: Repeatable local derivative generation
The system SHALL provide a documented low-level optimization command and a managed processing command that accept a supported source image and stable work slug and produce a thumbnail WebP and full-view WebP at deterministic tracked paths.

#### Scenario: Developer optimizes a valid source
- **WHEN** the developer supplies a readable source image and valid unused or existing work slug to the low-level optimizer
- **THEN** the command produces both named WebP variants and reports their dimensions and byte sizes

#### Scenario: Developer processes an inbox source
- **WHEN** the developer supplies a readable source inside the ignored inbox and a valid slug to the managed processing command
- **THEN** the command generates and validates both variants, records their state, and moves the source into slug-scoped processed storage

#### Scenario: Source is smaller than a target
- **WHEN** a source dimension is below the configured thumbnail or full-view bound
- **THEN** the corresponding derivative preserves that smaller dimension rather than enlarging the source

### Requirement: Privacy-preserving image normalization
The system SHALL honor source orientation, convert output pixels to sRGB, preserve the source aspect ratio, and omit EXIF, GPS, camera, software, and capture-date metadata from committed derivatives.

#### Scenario: Source contains camera metadata
- **WHEN** a developer optimizes a photograph that includes EXIF or GPS fields
- **THEN** the visible orientation and color remain valid while the committed derivatives contain none of the forbidden source metadata

### Requirement: Atomic and safe derivative output
The optimizer MUST validate its source and slug before writing, and managed processing MUST coordinate derivatives, source placement, and the local manifest so a failed operation does not leave partially committed workflow state.

#### Scenario: Input is invalid
- **WHEN** the input path, file format, slug, or decoded pixels are invalid
- **THEN** the command exits unsuccessfully without changing existing tracked derivatives, source placement, or manifest state

#### Scenario: One encode fails
- **WHEN** either derivative cannot be encoded or validated
- **THEN** neither destination variant is replaced and the source remains in its prior location

#### Scenario: Workflow commit fails
- **WHEN** committing the prepared derivatives, processed source, or manifest fails
- **THEN** the prior derivatives and manifest are restored, the source remains or is restored under inbox, and temporary state is cleaned

#### Scenario: Managed processing succeeds
- **WHEN** both derivatives and the next manifest state pass validation and all workflow commits succeed
- **THEN** the derivative pair, processed source location, and manifest entry become current together

### Requirement: Tracked asset verification
The system SHALL provide a CI-compatible verification command that checks every catalog work for decodable thumbnail and full-view WebP assets, valid dimensions, configured byte budgets, forbidden metadata, and prohibited tracked source formats.

#### Scenario: Catalog asset pair is valid
- **WHEN** every work references two compliant derivatives and the local source directory is ignored
- **THEN** asset verification succeeds without requiring original photographs

#### Scenario: Asset policy is violated
- **WHEN** a variant is missing, malformed, oversized, contains forbidden metadata, exceeds its dimension bound, or a prohibited source file is tracked in the portfolio asset tree
- **THEN** verification fails with the affected work or path and reason

### Requirement: Original-photo ownership guidance
The system SHALL document that the ignored source directory is development staging rather than durable backup and SHALL identify the tracked derivative workflow for adding or updating a work.

#### Scenario: Developer prepares a new work
- **WHEN** the developer follows the photo workflow documentation
- **THEN** the original remains in an external primary library or backup while only validated web derivatives and catalog metadata are staged for Git
