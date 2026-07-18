# Terminal Portfolio Experience Specification

## Purpose

Define the terminal-inspired, photo-first portfolio experience, including responsive accessibility, metadata, static delivery, privacy, and legacy navigation behavior.

## Requirements

### Requirement: Single-page terminal portfolio
The system SHALL present the photography portfolio as one responsive page containing an introduction, discoverable command-style navigation, a works section, an about statement, and a status footer.

#### Scenario: Visitor opens the portfolio
- **WHEN** a visitor loads the root URL
- **THEN** the page displays the Vision Portfolio identity, introductory content, works index, and terminal-inspired navigation without requiring typed input

#### Scenario: Visitor follows a section command
- **WHEN** a visitor activates a command-style section control
- **THEN** focus or viewport moves to the corresponding section using semantic link or button behavior

### Requirement: Photographs remain the visual focus
The system SHALL use a dark phosphor-green terminal interface with restrained post-processing limited to selected text while preserving every portfolio photograph's natural color, contrast, opacity, and unmasked pixels.

#### Scenario: Portfolio photograph is rendered
- **WHEN** a photograph appears in a card or viewer
- **THEN** terminal scanlines, text masks, tinting, glow, blur, blend modes, and noise are not applied to the photograph pixels

#### Scenario: Processed heading appears near a photograph
- **WHEN** a heading uses a gradient, outline, scanline, glow, or mask treatment
- **THEN** the effect remains confined to the text layer and does not overlay or visually recolor the photograph

### Requirement: Responsive terminal layout
The system SHALL provide intentional layouts for narrow mobile screens, tablet widths, and desktop screens without horizontal page overflow.

#### Scenario: Visitor uses a narrow mobile viewport
- **WHEN** the viewport is approximately 320 CSS pixels wide
- **THEN** terminal controls remain operable, text remains readable, photographs fit the viewport, and the page does not scroll horizontally

#### Scenario: Visitor uses a wide desktop viewport
- **WHEN** the viewport provides sufficient horizontal space
- **THEN** the works index uses a multi-column editorial layout while preserving readable line lengths

### Requirement: Accessible visual effects and navigation
The system SHALL provide visible keyboard focus, sufficient interface contrast, a skip link, semantic landmarks, reduced-motion behavior, and progressive solid-color fallbacks for decorative terminal text effects.

#### Scenario: Reduced motion is requested
- **WHEN** the visitor's environment reports `prefers-reduced-motion: reduce`
- **THEN** boot, flicker, cursor, scanline, mask, and transition animations are disabled or rendered as static states

#### Scenario: Text masking is unsupported
- **WHEN** the browser does not support the selected text clipping or masking feature
- **THEN** every affected heading remains visible with a solid phosphor color or existing outline and retains sufficient contrast

#### Scenario: Visitor navigates with a keyboard
- **WHEN** the visitor tabs through the page
- **THEN** every interactive control receives a visible focus indicator in a logical order

#### Scenario: Assistive technology reads a processed heading
- **WHEN** a screen reader or text extraction tool encounters a heading with decorative effects
- **THEN** it receives the original semantic text once, without an image replacement or duplicate accessible copy

### Requirement: Accurate document metadata
The system SHALL identify the document as Traditional Chinese and provide a descriptive page title, description, viewport, and theme color.

#### Scenario: Search engine or assistive technology reads the page
- **WHEN** document metadata is inspected
- **THEN** the language is `zh-Hant` and the title and description identify the page as the Vision photography portfolio

### Requirement: Static and privacy-preserving delivery
The system SHALL build as provider-neutral static output and SHALL NOT request visitor filesystem or photo-library access, upload visitor files, or depend on a backend service.

#### Scenario: Production build completes
- **WHEN** the Astro production build runs
- **THEN** it emits deployable static files without requiring a Node server runtime

#### Scenario: Visitor browses the portfolio
- **WHEN** the visitor views or filters works
- **THEN** no permission prompt, file picker, account, or upload request is presented

### Requirement: Legacy gallery navigation
The system SHALL preserve the old gallery entry point by redirecting it to the single-page works experience and retaining a recognized category selection when supplied.

#### Scenario: Visitor opens a legacy category URL
- **WHEN** the visitor opens `/gallery?category=Urban`
- **THEN** the visitor reaches the root works experience with the Urban filter selected
