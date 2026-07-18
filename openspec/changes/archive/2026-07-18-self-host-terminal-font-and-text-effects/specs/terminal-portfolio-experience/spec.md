## MODIFIED Requirements

### Requirement: Photographs remain the visual focus
The system SHALL use a dark phosphor-green terminal interface with restrained post-processing limited to selected text while preserving every portfolio photograph's natural color, contrast, opacity, and unmasked pixels.

#### Scenario: Portfolio photograph is rendered
- **WHEN** a photograph appears in a card or viewer
- **THEN** terminal scanlines, text masks, tinting, glow, blur, blend modes, and noise are not applied to the photograph pixels

#### Scenario: Processed heading appears near a photograph
- **WHEN** a heading uses a gradient, outline, scanline, glow, or mask treatment
- **THEN** the effect remains confined to the text layer and does not overlay or visually recolor the photograph

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
