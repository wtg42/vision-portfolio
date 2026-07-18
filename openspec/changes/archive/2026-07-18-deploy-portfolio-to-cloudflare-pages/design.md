## Context

The portfolio is an Astro 7 site that produces provider-neutral static files in `dist`. It has no backend, runtime environment variables, visitor uploads, or Cloudflare configuration. The repository already has a GitHub `origin` and uses `main`, but the redesign and OpenSpec records are still uncommitted, no GitHub Actions workflow exists, and the build environment is not pinned even though the installed Astro release requires Node.js 22.12 or newer.

The current production artifact is about 6.6 MB and its largest file is a full-view photograph of about 6.2 MB, below the Cloudflare Pages per-file limit but worth validating under a throttled connection. Deployment therefore spans repository hygiene, CI, an external GitHub-to-Cloudflare connection, and browser-level acceptance.

## Goals / Non-Goals

**Goals:**

- Make local, CI, and Cloudflare builds reproducible on a supported Node.js 22 release.
- Require Astro checks, the Vitest suite, and a production build before deployment-bound changes merge.
- Deploy the static `dist` output from GitHub to Cloudflare Pages with automatic previews and `main`-only production releases.
- Add conservative immutable caching for hashed Astro assets and baseline security/privacy response headers.
- Validate the real preview and production URLs across routes, interactions, viewports, keyboard use, and network delivery.
- Preserve a quick rollback path and document the external project settings needed to reproduce the deployment.

**Non-Goals:**

- Cloudflare Workers, Pages Functions, SSR, bindings, runtime secrets, analytics, a backend, or `@astrojs/cloudflare`.
- Codex Sites or provider-owned source configuration.
- A custom domain, DNS migration, apex/`www` redirects, or production analytics in the initial launch.
- Reworking the photography catalog or reducing full-view image fidelity without evidence from deployed performance checks.

## Decisions

### Use Cloudflare Pages Git integration for the initial static launch

Cloudflare Pages will connect directly to `wtg42/vision-portfolio`, use `main` as the production branch, execute `npm run build`, and publish `dist`. This is the smallest deployment surface for an already-static site and provides branch and pull-request previews without introducing a runtime adapter.

Workers Static Assets and direct Wrangler uploads were considered. Workers is more appropriate if server logic or bindings become necessary; direct upload is useful for custom CI ownership. Neither is needed for the current static portfolio, and a Git-integrated Pages project cannot later be converted into a Direct Upload project, so a future migration would create a separate project intentionally.

### Pin the build toolchain in the repository

Add a `.node-version` using Node.js 22 and declare a compatible Node range in `package.json`. CI will install from `package-lock.json` with `npm ci`. Repository-owned version declarations avoid relying on Cloudflare's rolling default build image and keep local and hosted behavior understandable.

### Use GitHub Actions as the pre-merge quality gate

A workflow will run `npm ci`, `npm run check`, `npm test -- --run`, and `npm run build` for pull requests and production-branch updates. The workflow check should be required before merging to `main`. Cloudflare will still perform its own clean production build from the accepted commit; CI validates the same source and lockfile before that commit reaches production.

The simpler alternative—letting Cloudflare run only `npm run build` with no independent CI—was rejected because it would not exercise the existing type/content checks and interaction tests before merge.

### Keep deployment configuration static and minimally provider-specific

No Cloudflare adapter or Worker configuration will be added. Provider-specific repository content is limited to static-host-compatible files such as `public/_headers`, plus documentation of dashboard settings. Hashed `/_astro/*` assets can receive long-lived immutable caching; HTML remains revalidatable. Baseline headers will prevent MIME sniffing, restrict unnecessary browser permissions, and use a conservative referrer policy without adding a brittle Content Security Policy before the deployed asset graph is observed.

### Treat `pages.dev` as the first production milestone

The first accepted production URL will use the Cloudflare-provided hostname. Custom-domain work will start only after route, interaction, responsive, keyboard, caching, console, and throttled-image checks pass. This separates application deployment risk from DNS and canonical-host decisions.

### Keep project planning reproducible in Git

The redesign implementation, `openspec/`, and the project-local `.codex/` OpenSpec skills will be reviewed and intentionally versioned before the deployment branch is pushed. Generated directories such as `dist`, `.astro`, and `node_modules` remain ignored.

## Risks / Trade-offs

- **[Uncommitted redesign causes Cloudflare to publish the old site]** → Review, commit, and push the full intended source and OpenSpec scope before connecting production.
- **[Cloudflare project name or GitHub authorization is unavailable]** → Confirm account access during setup and use an approved project-name variant if `vision-portfolio` is unavailable.
- **[Node.js drift breaks a hosted build]** → Pin Node.js 22 in the repository and use the same version in GitHub Actions.
- **[CI passes but Cloudflare-specific build fails]** → Keep Cloudflare's clean build enabled and treat its deployment status as a second production gate.
- **[The full-view photograph is slow on mobile networks]** → Test the deployed viewer with throttling; optimize only if measured latency is unacceptable, preserving the source original.
- **[Aggressive caching serves stale HTML]** → Apply immutable caching only to hashed `/_astro/*` assets and leave documents revalidatable.
- **[Public preview URLs expose unfinished work]** → Rely on Cloudflare preview `noindex` behavior and optionally enable Cloudflare Access later if previews need authentication.
- **[External dashboard state is not visible in Git]** → Record the final project, branch, build command, output directory, Node version, and hostname in repository documentation.

## Migration Plan

1. Review the dirty working tree, include the intended redesign and OpenSpec artifacts, preserve generated-file ignores, and create an intentional baseline commit.
2. Add the Node version declarations, GitHub Actions workflow, static response headers, and deployment documentation.
3. Run the complete clean-install quality sequence locally and verify the generated artifact size and routes.
4. Push a non-production branch and confirm GitHub Actions passes.
5. Create the Cloudflare Pages Git integration, configure the documented build settings, and inspect the branch preview.
6. Complete preview acceptance, merge through the protected quality gate, and verify the `main` production deployment on `pages.dev`.
7. If production validation fails, roll back to the previous Cloudflare deployment or revert the responsible Git commit, then keep the failed version out of the production alias.
8. After acceptance, open a separate change for custom-domain, DNS, canonical URL, and redirect decisions.

## Open Questions

- Whether `vision-portfolio.pages.dev` is available in the target Cloudflare account; an unavailable name requires a user-approved variant.
- Whether GitHub branch protection can be configured on the repository's current plan and permissions; if not, the CI check remains visible but cannot technically prevent a direct merge.
