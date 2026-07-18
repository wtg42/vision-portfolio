## MODIFIED Requirements

### Requirement: Typed local portfolio catalog
The system SHALL define portfolio works in one typed local catalog using stable identifiers, titles, categories, imported thumbnail and full-view image metadata, and meaningful alternative text, with optional location, year, and description fields.

#### Scenario: Developer adds a portfolio work
- **WHEN** valid pre-optimized thumbnail and full-view imports and a catalog record are added
- **THEN** the work becomes available to the generated portfolio without changes to gallery component structure or runtime image processing

#### Scenario: Optional metadata is absent
- **WHEN** a work does not define location, year, or description
- **THEN** the interface omits that field without showing fabricated content or an empty label

#### Scenario: Required image variant is absent
- **WHEN** a catalog record does not provide either a valid thumbnail or full-view import
- **THEN** type checking, asset verification, or the production build fails before deployment

### Requirement: Responsive optimized image delivery
The system SHALL deliver explicit, pre-optimized thumbnail and full-view assets committed for each catalog work and SHALL NOT require private source photographs or image encoding during the static build.

#### Scenario: Works index initially loads
- **WHEN** the page renders the catalog
- **THEN** cards use the work's appropriately sized thumbnail asset and non-featured images are lazy-loaded

#### Scenario: Full-view image is not requested
- **WHEN** no viewer is open
- **THEN** full-view image elements are absent from the document

#### Scenario: Static build runs without local sources
- **WHEN** CI builds a checkout that contains tracked derivatives but no ignored source directory
- **THEN** all catalog routes and viewer assets build successfully without generating new image variants
