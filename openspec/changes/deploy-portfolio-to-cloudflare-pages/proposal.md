## Why

The redesigned portfolio currently exists only in the local working tree, so the public cannot review or visit the finished experience. A repeatable Cloudflare Pages deployment path is needed now to turn the provider-neutral Astro build into a public, previewable site without introducing a backend or Cloudflare-specific runtime dependency.

## What Changes

- Prepare the repository for reproducible CI builds by defining a supported Node.js version and keeping generated output out of version control.
- Add automated quality checks for type/content validation, unit tests, and the production build before changes are merged to the production branch.
- Connect the GitHub repository to Cloudflare Pages with `main` as production, `npm run build` as the build command, and `dist` as the static output directory.
- Enable branch and pull-request preview deployments while keeping production releases tied to reviewed `main` commits.
- Verify the deployed portfolio's routes, redirect behavior, photo interactions, responsive layout, asset delivery, and error-free browser execution.
- Launch first on the project-provided `pages.dev` hostname; defer custom-domain and DNS work until the initial production deployment is accepted.
- Keep the site static: do not add `@astrojs/cloudflare`, Wrangler Worker code, Pages Functions, backend services, runtime secrets, or Codex Sites configuration.

## Capabilities

### New Capabilities

- `cloudflare-pages-deployment`: Reproducible GitHub-based quality checks, preview builds, production deployment, and post-deployment acceptance for the static portfolio on Cloudflare Pages.

### Modified Capabilities

None.

## Impact

- Repository configuration may gain a pinned Node.js version, package metadata, and a GitHub Actions workflow.
- Cloudflare Pages will be connected to `wtg42/vision-portfolio` and receive permission to build commits and report deployment status.
- The production artifact remains the existing Astro-generated `dist` directory; no application API, persistent data, visitor uploads, or runtime environment variables are introduced.
- The current redesign, OpenSpec documents, and deployment preparation must be intentionally committed and pushed before Cloudflare can build the intended version.
