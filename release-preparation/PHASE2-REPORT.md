# Phase 2 — Release preparation, 2026-09-18

Design V1 remains frozen. No application source, article, active workflow, DNS record, Git index, or commit was changed. Deployment workflows are supplied as inert `.yml.draft` files outside `.github/workflows`. This document proposes future actions; none of its commit/push/deploy steps has been executed.

## 1. Article discrepancy: resolved, not an accidental Phase 1 exclusion

| Evidence point | Retained zh/en/ja | Public zh/en/ja | Public total |
|---|---|---|---:|
| Notes committed source, HEAD `b756309` | 13 / 7 / 11 | 12 / 6 / 10 | 28 |
| Pre-split snapshot, September 16 | 13 / 7 / 11 | 11 / 5 / 9 | 25 |
| Current source and generated article pages | 12 / 6 / 10 | 11 / 5 / 9 | 25 |

The published selector is `published !== false`; missing `published` defaults to public. Applying it to committed source reproduces the earlier 28 exactly. Three historically public-eligible routes are absent now:

- `/articles/taiwan-student-cybersecurity-growing-apart/`
- `/articles/taiwan-student-cybersecurity-growing-apart/en/`
- `/articles/taiwan-student-cybersecurity-growing-apart/ja/`

These three editions were already marked unpublished in the pre-split snapshot. Their later deletion is explicitly recorded as an author request in `notes.nagi.tw/migration-report.md` and `docs/superpowers/plans/2026-09-17-notes-taxonomy.md`. No public route from the pre-split snapshot disappeared in Phase 1. There is evidence of an intentional publication/removal decision, not accidental loss. No article was restored or edited in this audit.

This is **not merely a validator-definition difference** when comparing the older public source to today: one three-language article intentionally left the public set. Separately, the current migration report's **28 retained files** includes three unpublished `from-nihscsed-to-control-team` editions; calling that current inventory “28 public” would be a counting-label mistake. Current public count is **25 editions, 11 logical articles**. Retained count is **28 editions, 12 logical articles**.

The exact 28 historical routes and 25 current routes are listed side by side in [article-routes.md](article-routes.md). [article-inventory.json](article-inventory.json) records filenames, languages, publication state, and routes at all three evidence points. Historical counts reconstruct source eligibility; the audit does not claim all 28 were deployed live, because no matching historical live-build artifact was identified.

## 2. Git release plan

Actual repositories:

- Parent: `C:\Users\0ping\Desktop\Seraph.tw`, remote `https://github.com/seraphforge/seraphforge.tw.git`, branch `main`. `nagi.tw/` belongs here; it has no independent `.git` directory.
- Notes: `C:\Users\0ping\Desktop\Seraph.tw\notes.nagi.tw`, remote `https://github.com/seraphforge/notes.nagi.tw.git`, branch `main`.
- Both indexes are empty of staged changes. Both working trees retain their pre-existing dirty changes. Full status inventories are local audit outputs at `.tmp/phase2-parent-status.txt` and `.tmp/phase2-notes-status.txt`.

Recommended logical commits, only after approval:

| Repository / group | Include | Exclude |
|---|---|---|
| Parent P1: release boundaries | Reviewed UTF-8 `.gitignore` repair/additions below | All other legacy files |
| Parent P2: Design V1 personal Astro app | `nagi.tw/.gitignore`, `astro.config.mjs`, `package.json`, `package-lock.json`, `tsconfig.json`, `README.md`; `src/pages/index.astro`, `src/layouts/BaseLayout.astro`, `src/styles/global.css`; all three `src/components/*.astro`; `src/data/notes-preview.json`, `src/lib/previews.ts`; `scripts/sync-notes.mjs`, `scripts/validate-build.mjs`; `public/robots.txt` | Snapshots, generated builds, local dependencies, release audit JSON |
| Parent P3: reviewed release documentation | `nagi.tw/PHASE1-REPORT.md`, this report, route reconciliation, reviewed workflow drafts if desired | Machine-specific inventory/status files and screenshots |
| Parent P4: switch publishing workflow | Replace `.github/workflows/pages.yml` with the approved personal workflow; retain old workflow in the recovery archive | Any second active publisher for the same Pages site |
| Notes N1: prior approved content classification | Existing `articles/` frontmatter diffs, three documented removals, `migration-report.md` | Any article-body rewriting; inspect this commit independently |
| Notes N2: Notes Astro application | `.gitignore`, `astro.config.mjs`, `package.json`, `package-lock.json`, `tsconfig.json`, `src/`, `scripts/`, `README.md`, reviewed `docs/`; `public/robots.txt`, `public/assets/images/{casper.png,cybersec-2026.jpg,seraph.png}` and the corresponding old `assets/images/` deletions | Generated output and local dependencies |
| Notes N3: independent publishing | Approved Notes draft installed as `.github/workflows/pages.yml` | Parent workflow/files |

Keep N1's existing article changes separate from this release-preparation work. They were not made during Phase 1 or Phase 2. Review bodies against the approved snapshot, not an assumption that all article diffs are newly authorized. Stage explicit paths only, always with the correct repository working directory; never use parent `git add .` or `git add -A`. Review `git diff --cached --name-status`, `git diff --cached --check`, and the complete staged diff before each commit. Do not accidentally stage the nested repository as a gitlink/submodule.

Do NOT include parent `_config.yml`, `scaffolds/`, `sitemap_template.xml`, `source/`, `themes/`, root Hexo package files, or any other legacy edits in P1–P4. Keep the legacy source in place. Existing `.kilo/`, penguin screenshots, `.tmp/`, caches, logs, `.astro/`, `dist/`, `node_modules/`, Hexo `public/`, `.deploy_git/`, `qa-screenshots/`, and backups are not release source. The app `public/robots.txt` and Notes `public/assets/` ARE source assets and must be included.

### Exact ignore recommendation — not applied

The parent `.gitignore` ends with a malformed NUL-containing `.tmp/` line. Re-save it as valid UTF-8, preserving its valid existing rules, remove that malformed line, then append:

```gitignore
# Local migration/audit work and independent nested repository
/.tmp/
/.kilo/
/notes.nagi.tw/
/penguin-desktop.png
/penguin-mobile.png

# Astro-generated files (the app already has equivalent rules)
/nagi.tw/node_modules/
/nagi.tw/dist/
/nagi.tw/.astro/

# Override legacy public/ ignore for personal source assets
!/nagi.tw/public/
!/nagi.tw/public/**

# Regenerable local release evidence
/nagi.tw/release-preparation/article-inventory.json
/nagi.tw/release-preparation/url-audit.json
```

The nested Notes ignore file already excludes `node_modules/`, `dist/`, `.astro/`, `.env`, and `.env.*` while allowing `.env.example`. Recommend adding `*.log`, `/qa-screenshots/`, and `/.tmp/`. Do not add `public/`. These recommendations are deliberately not active yet. Verify with `git check-ignore -v` and `git add --dry-run` before staging the approved release.

## 3. Deployment architecture

Recommendation: two independent GitHub Pages deployments in the two existing repositories. This uses the existing GitHub ownership and avoids moving either working tree or adding a new hosting account. The personal deployment replaces the parent's Pages publisher at cutover; Notes deploys independently. A third dedicated personal repository would isolate Hexo further but adds a repository migration and is unnecessary for this release.

| Setting | Personal | Notes |
|---|---|---|
| Repository | `seraphforge/seraphforge.tw` | `seraphforge/notes.nagi.tw` |
| Build root | `nagi.tw/` | Repository root `.` |
| Install | `npm ci` | `npm ci` |
| Build | `npm run build` | `npm run build` |
| Output, relative to repo | `nagi.tw/dist/` | `dist/` |
| Node | Node 24.x in draft CI | Node 24.x in draft CI |
| Dependency minimum | Installed Astro 7.3.2 declares Node `>=22.12.0`, npm `>=9.6.5` | Same |
| Local verified runtime | Node 24.13.0 | Node 24.13.0 |
| Application env variables | None | None |
| Platform permissions | Built-in GitHub token; deployment `pages: write`, `id-token: write`; checkout `contents: read` | Same |
| Custom domain | `nagi.tw` | `notes.nagi.tw` |
| Astro `site` | `https://nagi.tw` | `https://notes.nagi.tw` |

No repository-name `base` is needed when serving at these custom-domain roots. Testing under the temporary `github.io/repository/` path is not a substitute for a custom-domain smoke test because root-relative assets/routes target `/`.

Prepared configuration: [personal-pages.yml.draft](personal-pages.yml.draft) and [notes-pages.yml.draft](notes-pages.yml.draft). Both are manual-only, restricted to `main`, with a `deploy` input defaulting to false. Builds validate and upload only their own `dist`. Selecting false does not invoke the deploy job. They use independent repository environments named `github-pages`. No PAT or custom secret is required. Configure environment reviewers/branch protection before first production dispatch. No workflow has been installed or run. GitHub workflow execution remains an untested external step; local YAML parsing is not equivalent to a successful Actions run. The structure follows [GitHub's Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

### Observed GitHub state and release gates

Both remotes exist, are public, unarchived, and use `main`. Read-only API checks found an active parent `Pages` workflow at `.github/workflows/pages.yml`, plus the dynamic `pages-build-deployment` workflow. The local `Pages` workflow builds Hexo using Node 20 and fires on pushes to `main`. The latest observed successful Pages run was on `gh-pages`, commit `f1219becae149a68cd4a5108a30dfcbba8f80707`, August 22, 2026: [run 32567549656](https://github.com/seraphforge/seraphforge.tw/actions/runs/32567549656). Notes has no registered workflows or workflow runs yet.

Unauthenticated `/pages` API reads returned 404 for both repositories. This does not prove Pages is disabled; exact current publishing source, custom domain, HTTPS settings, and environment protection remain unverified. Inspect them while authenticated before cutover. Do not assume the checked-in Hexo workflow is the sole current publisher. Before pushing a release to parent `main`, disable the old automatic publisher and ensure the release replaces rather than supplements it. Changing the Pages source from `gh-pages` to GitHub Actions is a later approved setup action.

### Eventual DNS, not changed

| Name | Type | Value |
|---|---|---|
| `@` (nagi.tw) | A | `185.199.108.153` |
| `@` | A | `185.199.109.153` |
| `@` | A | `185.199.110.153` |
| `@` | A | `185.199.111.153` |
| `notes` | CNAME | `seraphforge.github.io` |

Optional IPv6 for `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`. Use all four if enabling it. Optional `www` is a separate approval decision; do not add it in this plan's initial cutover. Verification may require a GitHub-provided TXT record at `_github-pages-challenge-seraphforge.nagi.tw`; obtain its actual value from account Pages settings rather than inventing it. Preserve unrelated mail/TXT records. Do not point the Notes CNAME at `nagi.tw` or include a repository path. Configure/verify domain ownership and the matching repository custom domains before changing traffic records. These values follow [GitHub custom-domain guidance](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) and [domain verification guidance](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).

## 4. Cross-site validation

Fresh local builds passed: personal 1 page; Notes 83 pages; both zero Astro errors, warnings, or hints. All 84 generated HTML pages have a canonical URL on their own origin and a matching `og:url`. Sitemap locations use the correct site origins; robots files declare the matching sitemap indexes. Notes RSS has exactly 25 article item URLs, all matching current published routes. The personal feed link points to `https://notes.nagi.tw/rss.xml`; Notes' `/rss.xml` discovery link correctly resolves to its own origin.

Personal Notes destinations are absolute `https://notes.nagi.tw/...`. Notes personal links currently spell `https://nagi.tw` without the final slash; browsers resolve that to `https://nagi.tw/`, so this is equivalent and is not a configuration error. No source was changed to normalize it. No wrong-origin canonical, OG, sitemap, RSS, or application navigation URL was found. Existing external article references are not rewritten. Detailed observed absolute URLs are in the local `url-audit.json`.

Personal metadata/story-link validation, Notes route/build validation, editorial UI/encoding checks, and taxonomy validation of 1,466 internal references passed. All 25 current article files exist in the build. Source-hash verification confirms preserved article, UI, legacy, and deployment files and unchanged Git HEAD/index states. Runtime/visual checks from approved Phase 1 remain applicable because application source is unchanged; they are not falsely reported as rerun during Phase 2.

## 5. Legacy recovery and archival

Retain the entire legacy implementation, existing `gh-pages` history, deployment configuration, dependency lock, and current dirty-source snapshots. Before cutover, export the exact currently serving artifact and record its hash, commit, publishing source, domain, DNS values, and TLS state. Existing dirty-source snapshots are not by themselves proof of a known-good production artifact.

After Astro has passed production QA and the agreed observation period, create an immutable legacy source/archive tag or dedicated archive branch from a reviewed recovery copy, including intentionally preserved dirty legacy changes in a separate archive commit. Export a Git bundle plus a verified static artifact off the working machine. Keep an archive README with the Node/Hexo versions and restore instructions. Do not archive the whole `seraphforge.tw` GitHub repository while it hosts the active personal site. A separate read-only legacy archive repository is optional later work. Disable legacy auto-deployment but retain its configuration in the archive. Delete nothing.

The personal Astro app only serves its homepage. Legacy Hexo URLs are not implemented by it. Before changing any hostname that currently serves Hexo, inventory its live deep links and explicitly approve their preservation/redirect policy. No redirects are prepared or installed in this phase. This is a cutover gate, separate from the fully preserved current Notes route set.

## 6. Exact ordered release checklist — future execution after approval

### A. Final local validation

1. Record current Git HEADs/statuses, verify both indexes, create fresh source snapshots, and export the live legacy artifact/DNS/settings for rollback.
2. Confirm this discrepancy resolution and accept the exact 25-route public inventory. Do not restore the intentionally withdrawn editions.
3. Apply only the approved ignore repair and workflow installation. Preserve Design V1 source hashes and all article bytes. Resolve the legacy deep-link policy and authenticated Pages-setting checks before any cutover.
4. In clean release checkouts under Node 24, run `npm ci` in each build root. This clean install is a release gate; this audit used the existing installed dependencies. In Notes run `npm run build`, `npm run validate`, `node scripts/validate-ui.mjs`, and `node scripts/validate-taxonomy.mjs`.
5. Validate saved personal metadata against the freshly built Notes index. If mismatched, stop for review instead of silently changing frozen homepage text. In personal run `npm run build`, `npm run validate`, then `node scripts/validate-build.mjs ../notes.nagi.tw/dist/search-index.json` with sibling checkout paths (or pass the actual Notes index path).
6. Serve both outputs locally. Run Notes runtime validation with `NAGI_TEST_URL` pointing to its preview server; rerun the six-width baseline visual comparison, Penguin interaction, navigation, and preview languages. Confirm the deployment artifacts contain only intended public files.

### B. Git commits

7. Create local release branches in each repository. Stage the explicit P1–P4 and N1–N3 groups above separately. Inspect every staged diff and article-body hashes. Commit only after approval; record exact commit IDs and keep legacy edits unstaged in the original workspace. Do not make a submodule/gitlink for Notes.

### C. Git pushes

8. Push release branches only after approval; no force push. Confirm no branch-wide external automation deploys those branches. Review remote diffs and checks before merging. Before parent `main` receives any release commit, disable the old push-triggered Hexo workflow; retain the existing serving artifact. Ensure the manual Astro workflow replaces it. Push/merge Notes and personal independently and record both release SHAs.

### D. Deployment setup

9. While authenticated, record and verify Pages source/domain settings in both repositories. Configure GitHub Actions as the source and protected `github-pages` environments. Confirm that `gh-pages`/Hexo cannot publish concurrently. If disabling the old workflow also disabled the replacement at the same path, re-enable it only after verifying that the remote file is now the manual Astro workflow. Run each manual workflow with `deploy=false`, inspect artifact contents and validation results. Do not promote a failed build.

### E. Custom domains

10. Verify domain ownership using the actual GitHub-issued TXT challenge. Assign `notes.nagi.tw` to Notes and `nagi.tw` to the parent. Check for existing claims and record rollback values. No CNAME source file is required for custom Actions publishing. Any domain reassignment affecting the old site is part of the scheduled cutover, not an incidental setup step.

### F. DNS and initial publication

11. At the approved cutover, dispatch Notes with `deploy=true`, update its CNAME as specified, and complete Notes HTTPS/smoke checks below before publishing personal links to it. Then dispatch personal with `deploy=true` and update apex records. Preserve unrelated DNS records and the recorded previous values. Confirm propagation with `Resolve-DnsName nagi.tw -Type A` and `Resolve-DnsName notes.nagi.tw -Type CNAME`; check AAAA too if enabled. Initial domain/DNS/certificate provisioning may require propagation time.

### G. HTTPS verification

12. For each hostname, wait for a valid certificate covering the exact name, enable Enforce HTTPS, and confirm HTTP redirects to HTTPS, successful HTTPS responses, and no mixed content. Do not declare cutover complete while certificates or DNS checks fail.

### H. Production smoke test

13. Test both homepages at desktop/mobile widths; compare Design V1 geometry/colors/typography/Penguin; test menu and language/fallback behavior. Fetch all 25 routes in `article-routes.md` and confirm expected titles, language, canonical/OG URLs, and images. Confirm category/deep-link filters, empty states, topics, archive, Experience, RSS, robots, sitemaps, and both directions of cross-site navigation. Confirm unpublished/withdrawn routes and metadata are absent. Test agreed legacy deep-link handling. Record deployed commit IDs and evidence.

### I. Rollback procedure

14. If either release fails, stop new production dispatches. Roll back only the affected deployment by uploading the previously verified artifact through the approved Pages workflow, or restore the recorded publishing source and preserved `gh-pages` commit for legacy recovery. Avoid rebuilding old dependencies during an incident. Restore prior custom-domain/DNS settings only if they changed, then verify DNS/TLS/routes again. Keep the other healthy site untouched. Use forward fixes/reverts in Git later; never reset, clean, force-push, or overwrite the dirty workspace to roll back production. If no previous Notes deployment exists, remove the failed release from service or restore its recorded pre-release state; do not claim a nonexistent previous Notes artifact.

### J. Legacy archival

15. After successful production smoke tests and the agreed observation period, perform the reviewed legacy archive/tag/bundle/artifact process above, document restoration, and verify an isolated restore. Preserve legacy files and history; do not delete or redirect them as part of archival without separate approval.

## Approval boundary

Phase 2 creates only this release package and local audit artifacts. No articles or UI were modified; no active deployment configuration was installed; no DNS, deployment, commit, push, reset, clean, or stash occurred. Remaining pre-release gates are authenticated Pages settings, clean-install/CI artifact validation, the legacy deep-link decision, and approval to execute the ordered checklist.
