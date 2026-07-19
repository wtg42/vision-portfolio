## MODIFIED Requirements

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
