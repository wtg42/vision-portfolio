# Cloudflare Pages Deployment

This portfolio is deployed as provider-neutral Astro static output. Cloudflare
Pages builds the repository; no Cloudflare adapter, Worker, Pages Function,
runtime binding, secret, or Codex Sites configuration is required.

## Build contract

| Setting | Value |
| --- | --- |
| Cloudflare project | `vision-portfolio` (desired; confirm availability) |
| GitHub repository | `wtg42/vision-portfolio` |
| Production branch | `main` |
| Root directory | `/` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js | `22.16.0` from `.node-version` |
| Runtime variables | None |
| Production hostname | Pending initial Pages deployment |

Cloudflare's Git integration builds `main` for production and eligible
non-production branches for previews. Pull requests should merge only after
the `Quality Gate / Check, test, and build` workflow and the Pages preview
deployment succeed.

## Local verification

Run the same quality sequence used by automation:

```sh
npm ci
npm run check
npm test -- --run
npm run build
```

Then preview the generated artifact:

```sh
npm run preview
```

Confirm that:

- `dist/index.html`, `dist/gallery/index.html`, and `dist/_headers` exist.
- No `_worker.js` or server entrypoint is generated.
- Every generated file is smaller than the Cloudflare Pages per-file limit.
- `/`, `/gallery`, and `/?category=Urban` behave as expected.
- The photo viewer opens, navigates, closes with Escape, and restores focus.
- Approximately 320 px, tablet, and desktop widths have no horizontal page
  overflow.
- Keyboard focus and reduced-motion behavior remain usable.
- The browser console contains no errors.

## Preview acceptance

For the branch or pull-request preview URL:

1. Repeat the local route, interaction, responsive, keyboard, and console
   checks against the hosted site.
2. Confirm preview responses include `X-Robots-Tag: noindex`.
3. Confirm HTML responses remain revalidatable.
4. Confirm `/_astro/*` responses include
   `Cache-Control: public, max-age=31556952, immutable`.
5. Confirm document responses include `X-Content-Type-Options`,
   `Referrer-Policy`, and `Permissions-Policy`.
6. Open the full-view photograph with browser network throttling and record
   its transferred size and loading time before approving any image-quality
   reduction.

## Production release

Merge the accepted branch to `main`. Cloudflare Pages performs a clean build
and updates the production `pages.dev` alias only if that build succeeds.
Repeat the critical preview checks against the final production hostname and
replace the pending hostname in this document.

Custom-domain, DNS, canonical-host, and apex/`www` redirect work is explicitly
deferred to a separate change after the `pages.dev` release is accepted.

## Rollback

For an application regression:

1. In Cloudflare, open the Pages project and select **Deployments**.
2. Identify the last accepted production deployment by Git commit.
3. Use Cloudflare's rollback control to restore that deployment.
4. Revert the faulty Git commit on a branch, let the quality gate and preview
   pass, and merge the revert to bring `main` back in sync with production.

If dashboard rollback is unavailable, revert the faulty commit first; the
resulting successful `main` build becomes the new production deployment.

Record any repository permission that prevents the quality workflow from
being configured as a required branch-protection check. Until that permission
is available, treat a green quality workflow as a mandatory manual merge
policy.
