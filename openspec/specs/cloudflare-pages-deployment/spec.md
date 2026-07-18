# Cloudflare Pages Deployment Specification

## Purpose

Define the reproducible build, validation, preview, production, caching, security, acceptance, and documentation contract for deploying the static portfolio to Cloudflare Pages.

## Requirements

### Requirement: Reproducible deployment toolchain
The repository SHALL declare a Node.js 22 version compatible with the installed Astro release, SHALL install dependencies from the committed lockfile in automation, and SHALL keep generated build output outside source control.

#### Scenario: Automation prepares the project
- **WHEN** GitHub Actions or Cloudflare Pages starts a clean build
- **THEN** it uses the repository-declared Node.js version and installs the locked dependency graph with `npm ci`

#### Scenario: Developer reviews deployment source
- **WHEN** the repository working tree is inspected
- **THEN** `dist`, `.astro`, and `node_modules` are excluded while the intended application and OpenSpec source remain available for versioning

### Requirement: Automated pre-merge quality gate
The repository SHALL run Astro checks, the non-watch Vitest suite, and the Astro production build for pull requests and updates to the production branch.

#### Scenario: Deployment-bound change is proposed
- **WHEN** a pull request targets `main`
- **THEN** automation runs `npm run check`, `npm test -- --run`, and `npm run build` after a clean dependency installation

#### Scenario: Quality command fails
- **WHEN** any required check, test, or build exits unsuccessfully
- **THEN** the workflow reports failure and the change is not considered ready to merge

### Requirement: Static Cloudflare Pages build contract
The Cloudflare Pages project SHALL build the GitHub repository with `npm run build`, publish `dist`, and serve the portfolio without a Cloudflare runtime adapter, server function, backend service, or runtime secret.

#### Scenario: Cloudflare builds a repository commit
- **WHEN** an eligible Git branch is deployed
- **THEN** Pages produces and publishes the Astro static output using the documented root, build command, and output directory

#### Scenario: Deployment dependencies are inspected
- **WHEN** the Pages project and repository configuration are reviewed
- **THEN** no `@astrojs/cloudflare`, Worker entrypoint, Pages Function, runtime binding, or Codex Sites configuration is required

### Requirement: Isolated preview deployments
The Cloudflare Pages project SHALL create preview deployments for eligible non-production branches and repository pull requests without changing the production alias.

#### Scenario: Preview branch is pushed
- **WHEN** an eligible branch other than `main` is pushed
- **THEN** Cloudflare publishes a distinct preview URL while the production URL continues serving the accepted `main` deployment

#### Scenario: Preview URL is inspected by a crawler
- **WHEN** the preview deployment response headers are examined
- **THEN** the preview is marked to prevent search-engine indexing

### Requirement: Controlled production release
The Cloudflare Pages project SHALL use `main` as its production branch and SHALL expose an accepted `main` deployment on a Cloudflare-provided `pages.dev` hostname before custom-domain work begins.

#### Scenario: Accepted change reaches main
- **WHEN** required repository checks have passed and the change is merged to `main`
- **THEN** Cloudflare builds that commit and updates the production `pages.dev` deployment only after the Pages build succeeds

#### Scenario: Production deployment is rejected
- **WHEN** a newly published deployment fails acceptance
- **THEN** the production alias can be restored to a previously accepted deployment or the source commit can be reverted

### Requirement: Static asset caching and baseline response protection
The deployed site SHALL allow long-lived immutable caching only for content-hashed Astro assets and SHALL send baseline security and privacy headers that do not alter portfolio functionality.

#### Scenario: Browser requests a hashed Astro asset
- **WHEN** a request targets a built resource under `/_astro/`
- **THEN** the response permits long-lived public immutable caching

#### Scenario: Browser requests a portfolio document
- **WHEN** a visitor loads an HTML route
- **THEN** the response remains revalidatable and includes MIME-sniffing, referrer, and unnecessary browser-permission protections

### Requirement: Deployment acceptance coverage
The preview and production deployments SHALL be accepted only after route, redirect, interaction, responsive, accessibility, asset, console, and network checks pass against the real hosted URL.

#### Scenario: Reviewer validates the hosted portfolio
- **WHEN** deployment acceptance is performed
- **THEN** the root page, legacy gallery redirect, recognized category query, viewer controls, keyboard behavior, and responsive layouts operate without browser console errors or horizontal page overflow

#### Scenario: Reviewer evaluates image delivery
- **WHEN** the photo viewer is exercised with browser network throttling
- **THEN** thumbnails remain appropriately optimized and the full-view asset's measured loading behavior is recorded before any fidelity-changing optimization is approved

### Requirement: Reproducible external configuration
The repository SHALL document the Cloudflare project name, GitHub repository, production branch, build command, output directory, Node.js version, production hostname, preview behavior, validation procedure, and rollback procedure.

#### Scenario: Maintainer needs to audit or recreate deployment
- **WHEN** the deployment documentation is followed
- **THEN** the maintainer can identify all required Pages settings and repeat the build, validation, and rollback process without relying on undocumented environment variables
