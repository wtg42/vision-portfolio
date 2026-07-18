## Context

The site currently uses Astro 7 with React, Tailwind CSS, and DaisyUI. Its two routes render a generic full-screen hero and a separate film-roll gallery; most static UI is shipped as `client:only` React, the gallery repeats one source photograph, and portfolio content has no data model. The redesign must work with the photographs committed to the repository, remain deployable as static files on common free hosting providers, and avoid collecting visitor data.

## Goals / Non-Goals

**Goals:**

- Establish a distinctive “1980s CRT workstation × contemporary photography editorial” identity.
- Keep photographs in natural color and make them visually dominant over terminal decoration.
- Provide an accessible, responsive, keyboard-operable single-page browsing experience.
- Make adding a portfolio photograph a small, typed data-entry change rather than a component rewrite.
- Generate appropriately sized image assets during the Astro build and defer larger viewer images until requested.
- Produce a provider-neutral static build suitable for Cloudflare Pages, Vercel, GitHub Pages, or Netlify.

**Non-Goals:**

- A real command parser, shell emulator, account system, CMS, database, analytics, or server API.
- Uploading visitor files or requesting access to a visitor's photo library or filesystem.
- Contact forms, email collection, or social-profile integration in this change.
- Codex Sites configuration or deployment.
- Applying CRT color filters to the portfolio photographs themselves.

## Decisions

### Use a single SSR-rendered React island inside a static Astro page

`index.astro` will prepare serializable photo view models and render one `PortfolioTerminal` component with `client:load`. React will own category state, the lightbox, focus restoration, and keyboard events, while Astro still emits meaningful initial HTML for SEO and no-JavaScript reading. This keeps interactive state in one boundary and preserves the existing Vitest/React Testing Library setup.

Alternatives considered:

- Multiple `client:only` components would duplicate state and omit useful server-rendered HTML.
- A full vanilla-script implementation would reduce runtime size but require replacing the established React component-test workflow for little benefit at this scale.

### Build a restrained custom terminal design system

Global CSS custom properties will define a near-black green background, phosphor-green primary text, muted green secondary text, amber status accents, panel borders, spacing, and glow strength. The UI will use a local system monospace stack, avoiding a render-blocking external font request. Scanlines, vignette, noise, cursor pulse, and glow will be implemented with non-interactive pseudo-elements; effects remain low-opacity and are disabled or made static under `prefers-reduced-motion: reduce`.

Photographs will never inherit blend modes, tint filters, opacity, or phosphor color treatment. DaisyUI styling will be removed from the page and its dependency/plugin can be removed because the design requires bespoke terminal chrome.

### Use a typed local catalog with a build-time view-model transform

`src/data/photos.ts` will export `PhotoRecord[]`. Each record contains:

- `id`: stable kebab-case identifier
- `title`: display title
- `category`: `landscape`, `portraits`, or `urban`
- `image`: imported Astro `ImageMetadata`
- `alt`: meaningful visual description
- optional `location`, `year`, and `description`

`index.astro` will transform each record at build time into a serializable `PhotoViewModel` containing optimized thumbnail and full-view URLs plus display metadata. Missing optional metadata is omitted from the interface rather than replaced with invented values. The current `DSC_1587.jpg` will seed the catalog as an Urban work; `Cerberus.png` will not appear because it is not a photography portfolio asset.

The filter bar always includes `all` and derives other visible filters from categories that actually contain works. A valid `?category=` value initializes the selected filter; unknown values fall back to `all`.

### Optimize thumbnails and viewer assets separately

Astro's image pipeline will generate modern optimized output from committed source images. Cards receive an approximately 800-pixel-wide thumbnail and the viewer receives an approximately 1920-pixel-wide image, constrained by the original dimensions. Non-featured thumbnails use native lazy loading. The full-view asset is only inserted into the DOM while the viewer is open, preventing every large image from loading on initial navigation.

Source originals remain version-controlled for this initial small curated collection. If the repository later grows substantially, image storage policy can be revisited separately.

### Make terminal commands discoverable controls, not hidden syntax

The top-level interface will present `visitor@vision:~$` and command-like controls such as `./works`, `./about`, and category tokens. They will be semantic links or buttons with visible focus states. Activating them scrolls to content or filters the catalog; visitors never need to infer or type a command.

The single page will contain a compact boot/header introduction, a works index, an about statement based on the existing portfolio copy, and a minimal status footer. The old `/gallery` route will redirect to `/?category=<existing value>` so bookmarks remain useful during the transition.

### Use the native dialog model with explicit React focus handling

The photo viewer will behave as a modal dialog with a large natural-color image, metadata panel, close control, and previous/next controls. Arrow keys navigate within the currently filtered sequence without wrapping; unavailable edge controls are disabled. Escape closes the viewer, focus returns to the card that opened it, and changing filters closes any open viewer to avoid an invalid selection.

### Keep document metadata and language accurate

The document language will be `zh-Hant`. The layout will provide a descriptive title, description, theme color, viewport metadata, and a visible skip link. Terminal UI labels remain concise English while introductory prose may remain Traditional Chinese.

## Risks / Trade-offs

- **CRT effects reduce legibility or distract from photographs** → Keep effects subtle, exclude image elements from effects, test contrast, and honor reduced-motion preferences.
- **Large committed originals increase repository and transfer size** → Generate optimized build outputs, lazy-load thumbnails, and establish a later threshold for external image storage if the catalog grows.
- **One current photograph makes the first gallery visually sparse** → Design the catalog to look intentional with one item and scale cleanly to 6–12 works without placeholder duplication.
- **Hydration delays interactive controls** → Server-render the complete catalog and use `client:load`; controls remain visible and content remains readable before hydration.
- **Static hosting handles redirects differently** → Implement `/gallery` as a framework-level static redirect and verify the generated output rather than relying on provider-specific configuration.

## Migration Plan

1. Add the typed catalog and build-time optimized photo view models.
2. Build the new single-page terminal experience alongside the old components.
3. Replace the home composition, redirect `/gallery`, and remove obsolete component usage.
4. Remove unused DaisyUI and Node adapter configuration after the static build succeeds.
5. Run unit tests, accessibility-oriented interaction tests, and the production build.
6. Roll back by reverting the implementation commit; source photographs and the previous Git history remain intact.

## Open Questions

None required for implementation. Additional photograph titles and optional metadata can be supplied later without changing the interface contract.
