# Photo Viewer Specification

## Purpose

Define an accessible, responsive terminal-styled viewer for examining portfolio photographs and navigating the active filtered collection.

## Requirements

### Requirement: Immersive terminal photo viewer
The system SHALL open a modal terminal-styled viewer containing the selected photograph in natural color, its title, available metadata, a close control, and sequential navigation controls.

#### Scenario: Visitor opens a work
- **WHEN** the visitor activates a portfolio card
- **THEN** a modal viewer opens for that work and presents the corresponding optimized full-view image

#### Scenario: Work has partial metadata
- **WHEN** the selected work omits optional metadata
- **THEN** the viewer displays only available fields without empty placeholders

### Requirement: Filter-aware sequential navigation
The system SHALL navigate previous and next within the current filtered work order and SHALL disable navigation beyond either end rather than wrapping.

#### Scenario: Visitor advances to the next work
- **WHEN** a next work exists and the visitor activates the next control
- **THEN** the viewer updates to that work and its associated image and metadata

#### Scenario: Visitor reaches an edge
- **WHEN** the selected work is the first or last item in the current result set
- **THEN** the unavailable previous or next control is disabled

### Requirement: Keyboard viewer operation
The system SHALL support Escape to close and Left Arrow or Right Arrow to navigate when the corresponding work exists.

#### Scenario: Visitor presses Escape
- **WHEN** the viewer is open and the visitor presses Escape
- **THEN** the viewer closes

#### Scenario: Visitor presses an arrow key
- **WHEN** the viewer is open and the visitor presses an enabled navigation arrow key
- **THEN** the viewer selects the adjacent work in the indicated direction

### Requirement: Modal focus management
The system SHALL move focus into the viewer when opened, contain keyboard focus while open, and restore focus to the originating work card when closed.

#### Scenario: Viewer opens and closes with a keyboard
- **WHEN** a keyboard visitor opens a work and subsequently closes the viewer
- **THEN** focus enters the viewer on open and returns to the same work card on close

### Requirement: Responsive viewer presentation
The system SHALL keep the full photograph, essential metadata, and close control usable without two-dimensional scrolling on supported mobile and desktop viewports.

#### Scenario: Viewer opens on mobile
- **WHEN** the viewport is narrow and a visitor opens a work
- **THEN** the image scales within the viewport and viewer controls remain visible and operable

### Requirement: Filter changes invalidate an open viewer
The system SHALL close the viewer before applying a category change so that the selected work cannot remain outside the active result set.

#### Scenario: Visitor changes category while a work is selected
- **WHEN** a category filter is activated while the viewer is open
- **THEN** the viewer closes and the newly filtered catalog becomes active
