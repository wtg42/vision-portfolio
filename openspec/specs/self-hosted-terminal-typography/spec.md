# Self-Hosted Terminal Typography Specification

## Purpose

Define licensed, repository-owned terminal typography with deterministic local delivery, bounded payloads, intentional language roles, and resilient fallback behavior.

## Requirements

### Requirement: Licensed repository-owned terminal font
The system SHALL store the required IBM Plex Mono WOFF2 asset or assets, the applicable OFL license, and source/version provenance within the repository.

#### Scenario: Developer audits the terminal font
- **WHEN** the committed font directory is inspected
- **THEN** it contains only the normal files needed for supported weights 400 and 500 together with license and provenance records

### Requirement: Private and deterministic font delivery
The system SHALL load terminal webfonts from local Astro-managed assets and SHALL NOT require a browser-time font CDN, remote font stylesheet, or network access during the production build.

#### Scenario: Visitor opens the deployed portfolio
- **WHEN** the page requests its terminal font
- **THEN** the request targets the portfolio's own origin and a hashed Astro asset

#### Scenario: Production builds offline from dependencies
- **WHEN** the application builds with its repository and installed dependencies but no font-provider network access
- **THEN** the font resources are emitted successfully from local files

### Requirement: Bounded font loading
The system SHALL use WOFF2, include only normal weights required by the interface, keep the combined committed webfont payload at or below 150 KiB, and preload no more font variants than are necessary for above-the-fold text.

#### Scenario: Font output is inspected
- **WHEN** a production build completes
- **THEN** unused styles and weights are absent, the payload meets the budget, and font assets receive the project's immutable hashed-asset cache policy

### Requirement: Intentional typography roles
The system SHALL provide an IBM Plex Mono terminal-display stack for commands, navigation, controls, metadata, and display headings and a readable Traditional Chinese system stack for long-form descriptions.

#### Scenario: Mixed Latin and Traditional Chinese content renders
- **WHEN** the portfolio displays terminal labels and Chinese descriptive copy
- **THEN** terminal labels use the self-hosted face while Chinese paragraphs use an available readable system fallback without missing glyphs

### Requirement: Resilient font fallback
The system SHALL keep all content visible while the webfont is unavailable or loading and SHALL preserve usable line wrapping, control dimensions, and navigation without synthesized styles.

#### Scenario: Font request is delayed or blocked
- **WHEN** the self-hosted font has not loaded
- **THEN** a local fallback renders immediately without hidden text, clipped controls, or horizontal page overflow

#### Scenario: Font finishes loading
- **WHEN** the terminal font replaces its fallback
- **THEN** headings and controls remain within their intended responsive layout without changing semantic content or focus
