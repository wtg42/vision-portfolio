# Photography Catalog Specification

## Purpose

Define the typed local photography collection, filtering behavior, optimized image delivery, and accessible presentation of portfolio works.

## Requirements

### Requirement: Typed local portfolio catalog
The system SHALL define portfolio works in one typed local catalog using stable identifiers, titles, categories, imported image metadata, and meaningful alternative text, with optional location, year, and description fields.

#### Scenario: Developer adds a portfolio work
- **WHEN** a valid image import and catalog record are added
- **THEN** the work becomes available to the generated portfolio without changes to gallery component structure

#### Scenario: Optional metadata is absent
- **WHEN** a work does not define location, year, or description
- **THEN** the interface omits that field without showing fabricated content or an empty label

### Requirement: Curated built-in photography
The system SHALL display only photographs explicitly included in the portfolio catalog and SHALL NOT duplicate a work to simulate a larger collection.

#### Scenario: Initial catalog contains one work
- **WHEN** the site is built with only the current city photograph
- **THEN** the works section renders one intentional portfolio entry without cloned placeholders

### Requirement: Category filtering
The system SHALL provide an `all` filter and controls for non-empty catalog categories, and SHALL filter works without a full page navigation.

#### Scenario: Visitor selects a category
- **WHEN** the visitor activates a visible category filter
- **THEN** only works assigned to that category remain in the works index and the selected control is exposed programmatically

#### Scenario: URL contains a recognized category
- **WHEN** the root page loads with a supported `category` query value
- **THEN** that category is selected as the initial filter

#### Scenario: URL contains an unknown category
- **WHEN** the root page loads with an unsupported `category` query value
- **THEN** the catalog falls back to `all`

### Requirement: Responsive optimized image delivery
The system SHALL generate separate optimized thumbnail and full-view assets from each catalog source image during the static build.

#### Scenario: Works index initially loads
- **WHEN** the page renders the catalog
- **THEN** cards use appropriately sized optimized image assets and non-featured images are lazy-loaded

#### Scenario: Full-view image is not requested
- **WHEN** no viewer is open
- **THEN** full-view image elements are absent from the document

### Requirement: Informative image cards
The system SHALL present each work as a keyboard-reachable control with its title, category, and meaningful image alternative text.

#### Scenario: Assistive technology reads a work
- **WHEN** a visitor encounters a portfolio card
- **THEN** the work title, category, and image description communicate the card's identity and purpose

### Requirement: Catalog empty state
The system SHALL provide an intentional terminal-style empty state when the catalog or current filter has no works.

#### Scenario: No works match
- **WHEN** the active catalog result is empty
- **THEN** the works region reports that no matching entries were found without throwing an error or leaving an unexplained blank area
