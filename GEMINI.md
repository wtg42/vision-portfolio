# Project Overview

This is an Astro-based web project designed as a vision portfolio or gallery. It leverages React for interactive components, Tailwind CSS and DaisyUI for styling, and Vitest for unit testing. The project integrates with `@astrojs/db` for database functionalities and `@astrojs/node` for server-side rendering.

# Building and Running

All commands are run from the root of the project using `npm`.

## Installation

To install project dependencies:

```bash
npm install
```

## Development Server

To start the local development server at `localhost:4321`:

```bash
npm run dev
```

## Building for Production

To build the production-ready site to the `./dist/` directory:

```bash
npm run build
```

## Previewing Production Build

To preview the built site locally before deployment:

```bash
npm run preview
```

## Running Tests

To execute unit tests using Vitest:

```bash
npm run test
```

## Astro CLI Commands

To run various Astro CLI commands (e.g., `astro add`, `astro check`):

```bash
npm run astro ...
```

For help with Astro CLI commands:

```bash
npm run astro -- --help
```

# Development Conventions

*   **Project Structure:** Follows a standard Astro project layout with `src/pages` for routes, `src/components` for reusable UI elements (including React components), `src/layouts` for page layouts, and `src/styles` for global CSS.
*   **Component Development:** React components are used for interactive UI elements, as seen in `src/components/FeatureGrid.tsx`.
*   **Styling:** Utilizes Tailwind CSS for utility-first styling and DaisyUI for pre-built UI components and themes. The `retro` theme is applied globally.
*   **Testing:** Vitest is configured for unit testing, using `jsdom` for a browser-like environment and `@testing-library/react` for testing React components. Test files are typically located in `__tests__` directories alongside the components they test.
*   **Database Integration:** The project includes `@astrojs/db` for database interactions, with configuration in `db/config.ts` and seeding in `db/seed.ts`.
*   **TypeScript:** The project is configured to use TypeScript for type checking, enhancing code quality and maintainability.
