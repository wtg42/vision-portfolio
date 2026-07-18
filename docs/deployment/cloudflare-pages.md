# Cloudflare Pages Deployment

This portfolio is deployed as provider-neutral Astro static output. Cloudflare
Pages builds the repository; no Cloudflare adapter, Worker, Pages Function,
runtime binding, secret, or Codex Sites configuration is required.

## Build contract

| Setting | Value |
| --- | --- |
| Cloudflare project | `vision-portfolio` |
| GitHub repository | `wtg42/vision-portfolio` |
| Production branch | `main` |
| Root directory | `/` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js | `22.16.0` from `.node-version` |
| Runtime variables | None |
| Production hostname | `https://vision-portfolio.pages.dev` |

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

The accepted preview for commit `3722e29` was
`https://0f45f54b.vision-portfolio.pages.dev`, with the branch alias
`https://codex-deploy-cloudflare-page.vision-portfolio.pages.dev`. The
full-view WebP transferred 90,962 bytes in 0.215 seconds during the recorded
limited-rate request. HTML returned revalidation caching and
`X-Robots-Tag: noindex`; the hashed Astro stylesheet returned immutable
caching. The preview remained separate from the production alias.

The photo-pipeline and self-hosted typography preview for commit `d883e4a` was
`https://3f584f1c.vision-portfolio.pages.dev`, with the branch alias
`https://codex-photo-pipeline-termina.vision-portfolio.pages.dev`. GitHub's
Quality Gate and Cloudflare Pages checks both passed. The preview returned
revalidatable, `noindex` HTML and immutable caching for hashed assets. Its
normal 400 and 500 IBM Plex Mono WOFF2 responses used `font/woff2`, matched the
committed SHA-256 hashes, totaled 99,648 bytes, and used one preload for the
above-the-fold 500 face. Hosted CSS retained the solid feature fallback,
reduced-motion animation freeze, and explicit natural-photo rules. The
full-view WebP matched the committed 84,820-byte asset byte-for-byte.

## Production release

Merge the accepted branch to `main`. Cloudflare Pages performs a clean build
and updates the production `pages.dev` alias only if that build succeeds.
Repeat the critical preview checks against the final production hostname and
replace the pending hostname in this document.

The first accepted production release is Git commit
`52e14a18550ca4c88939d6818466c0781eff40f6`, Cloudflare deployment
`ea489a1a-45fe-46e9-8f3a-ef691f16c83c`, at
`https://vision-portfolio.pages.dev`. The build used Node.js `22.16.0`,
generated static output without Functions, and published successfully.
Responsive checks at approximately 320, 768, and 1440 px, the legacy gallery
redirect, category filtering, viewer keyboard behavior, focus restoration,
and console output all passed. Production HTML is revalidatable and omits
the preview-only `X-Robots-Tag`; hashed Astro assets remain immutable.

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

Because this is the first accepted production deployment, there is no earlier
accepted release to restore yet. Treat deployment
`ea489a1a-45fe-46e9-8f3a-ef691f16c83c` and commit `52e14a1` as the rollback
baseline for the next release. The Cloudflare deployment history and the Git
history both expose these identifiers; do not restore the earlier
`e60a337` deployment because its server-mode output returned 404 on Pages.

Record any repository permission that prevents the quality workflow from
being configured as a required branch-protection check. Until that permission
is available, treat a green quality workflow as a mandatory manual merge
policy.
