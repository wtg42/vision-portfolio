## 1. Repository Baseline

- [x] 1.1 Audit the current working tree, confirm the redesigned application, `openspec/`, and project-local `.codex/` skills are intentional, and verify that no generated output, credentials, or unrelated local files will be committed.
- [ ] 1.2 Preserve ignore rules for `dist`, `.astro`, `node_modules`, logs, and environment files, then create an intentional baseline commit containing the completed redesign and its planning records.

## 2. Reproducible Build and Quality Gate

- [ ] 2.1 Add a repository-level Node.js 22 version declaration compatible with Astro's minimum version and matching `package.json` engine metadata.
- [ ] 2.2 Add a GitHub Actions workflow that uses the pinned Node version, installs with `npm ci`, and runs `npm run check`, `npm test -- --run`, and `npm run build` for pull requests and `main`.
- [ ] 2.3 Add static hosting headers that keep HTML revalidatable, apply immutable caching to `/_astro/*`, prevent MIME sniffing, use a conservative referrer policy, and disable unnecessary browser permissions without breaking the portfolio.
- [ ] 2.4 Add deployment documentation covering the desired Pages project name, repository, production branch, build command, output directory, Node version, preview behavior, acceptance checklist, and rollback procedure.

## 3. Local Deployment Verification

- [ ] 3.1 Run a clean `npm ci` followed by Astro check, the non-watch Vitest suite, and the production build, resolving every failure.
- [ ] 3.2 Inspect `dist` to confirm the root and legacy gallery outputs exist, static headers are copied, no Cloudflare Worker or server entrypoint is generated, and every asset remains within the hosting size limit.
- [ ] 3.3 Serve the production artifact locally and smoke-test the root page, recognized category query, legacy redirect, photo viewer, keyboard controls, and responsive layouts without browser errors or horizontal overflow.

## 4. GitHub and Cloudflare Integration

- [ ] 4.1 Commit the deployment preparation on a non-production branch, push it to GitHub, and confirm the complete GitHub Actions quality workflow passes.
- [ ] 4.2 Configure the workflow check as required for merges to `main` when repository permissions support branch protection; otherwise document the permission limitation and manual merge policy.
- [ ] 4.3 Create a Git-integrated Cloudflare Pages project for `wtg42/vision-portfolio` using `main`, `npm run build`, and `dist`, with no adapter, Functions, bindings, runtime secrets, or Codex Sites configuration.
- [ ] 4.4 Record the assigned project name and preview URL, and confirm a non-production branch deployment does not replace production and returns preview `noindex` protection.

## 5. Hosted Acceptance and Production Launch

- [ ] 5.1 Validate the preview URL at approximately 320 px, tablet, and desktop widths, including the root route, `/gallery` redirect, category query behavior, viewer open/close and navigation, keyboard focus, reduced motion, and console output.
- [ ] 5.2 Inspect preview response headers and network behavior to confirm immutable caching is limited to hashed Astro assets, document responses remain revalidatable, baseline protections are present, and the full-view photograph's throttled loading behavior is recorded.
- [ ] 5.3 Merge only after the required checks and preview acceptance pass, then verify Cloudflare publishes the accepted `main` commit to the production `pages.dev` hostname.
- [ ] 5.4 Repeat the critical route, interaction, responsive, header, and console checks on production and update the deployment documentation with the final hostname and verified settings.
- [ ] 5.5 Confirm the documented Cloudflare rollback or Git revert path can identify and restore the preceding accepted deployment, and keep custom-domain and DNS work deferred to a separate follow-up change.
