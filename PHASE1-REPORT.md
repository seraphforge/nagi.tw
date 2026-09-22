# Phase 1 site split verification — 2026-09-18

The requested split was already present when this turn began. It was retained and freshly verified, not recreated. The saved pre-split Notes homepage is the visual reference. No design normalization was performed.

## Safety snapshots

- Fresh snapshot: `../.tmp/site-split-backup-2026-09-18T04-59-08-042Z/`.
- Both actual repositories were captured: the parent Seraph.tw repository (which contains nagi.tw) and the nested notes.nagi.tw repository. nagi.tw is not a separate Git repository.
- Snapshot contains file copies with SHA-256 manifests, deletion states, HEAD identifiers, Git index copies, staged/unstaged binary diffs, and complete Git status. 484 parent and 72 Notes file states were captured and verified. The ignored personal `public/robots.txt` was copied separately.
- Existing pre-split baseline: `../.tmp/site-split-backup-2026-09-16T17-22-15-957Z/`, including `notes-rendered/` and original homepage source.
- Generated dependencies/caches are not part of the source snapshot. No reset, clean, stash, commit, push, or deployment occurred.

## Files

Existing personal-site implementation retained:

- `.gitignore`, `astro.config.mjs`, `package.json`, `package-lock.json`, `tsconfig.json`, `README.md`, `public/robots.txt`.
- `src/pages/index.astro`, `src/layouts/BaseLayout.astro`, `src/styles/global.css`.
- `src/components/SiteHeader.astro`, `SiteFooter.astro`, `NotesPreview.astro`.
- `src/data/notes-preview.json`, `src/lib/previews.ts`.
- `scripts/sync-notes.mjs`, `scripts/validate-build.mjs`.

Existing Notes split implementation retained: `src/pages/index.astro` supplies the Notes-specific introduction, latest writing, category links, topic link, archive link, and personal-site backlink. Existing article components, bodies, routes, taxonomy, and language behavior were preserved.

Changes made during this turn:

- Modified `../notes.nagi.tw/scripts/validate-ui.mjs`: replaced an obsolete `.index-tools` assertion with checks for the existing category navigation and its five filter buttons. No rendered UI change.
- Created this report and `../.tmp/site-split-verify-current.mjs`.
- Created the fresh snapshot; regenerated both `dist/` directories and visual QA outputs under `../.tmp/site-split-qa/`.

## Dependency separation

The personal homepage imports a local metadata adapter and JSON snapshot rather than `astro:content`, Notes article loaders, or Markdown. Saved previews contain titles, descriptions, dates, language availability, topic metadata, and absolute `https://notes.nagi.tw/articles/...` URLs. No article bodies or article routing system are copied into the personal app.

`sync:notes` optionally consumes Notes' generated public search index and writes only selected/recent preview metadata. Normal personal builds require neither a Notes checkout nor a network request. The current saved metadata and all story links match the freshly built Notes public index. Language selection and fallback are retained.

## Fidelity and verification

- Homepage scoped CSS exactly matches the pre-split source; global CSS remains identical between apps; Penguin SVG is identical to the baseline.
- Effective board width retained: `min(calc(100vw - clamp(3rem, 5vw, 5rem)), 1760px)`, then the original 1040px/720px responsive caps and gutters. No 1180px normalization.
- Original colors retained, including paper `#F7F8F6`, ink `#17252B`, surface/ice `#DCECEF`, accent `#3A8FA3`, lime `#C9DBA7`, yellow `#EEE3B8`, clay `#D8B6A4`.
- Personal visual regression passed at 1920, 1440, 1024, 768, 390, and 320px. Eight region geometry checks are identical; five region screenshots match within the existing 0.01% antialias tolerance (maximum channel delta 16). Header navigation intentionally contains personal-site destinations and is excluded from the region pixel comparison.
- Penguin interaction, Chinese/English/Japanese previews and fallback, and mobile navigation pass. Screenshot report: `../.tmp/site-split-qa/report.json`.
- Personal `npm.cmd run build`: PASS; 1 page; zero errors/warnings/hints. Structure, canonical, cross-site URLs, anchors, isolation, and public-preview validation: PASS.
- Notes `npm.cmd run build`: PASS; 83 pages; zero errors/warnings/hints.
- Notes build validation: PASS; 25 public article editions (11 Chinese, 5 English, 9 Japanese), 11 public groups and one retained unpublished group. Core pages, topic routes, RSS, sitemap, public search index, and three images validated.
- Notes taxonomy validation: PASS, including 1,466 internal references. UI structure and encoding checks: PASS after correcting the stale test assertion.
- Notes runtime validation: PASS for category filters/deep links, language transitions/persistence/fallback, desktop/mobile homepage, indexes, topics, archive, and article routing.
- Fresh snapshot preservation check: all original source/deletion states unchanged except the explicitly listed UI validation script. All article files, legacy files, deployment files, both Git indexes, and both HEADs are unchanged.

The old preservation helper was also attempted; it compares against September 16 and flags intervening pre-existing changes (first: Notes build validation). That result is not evidence of changes made in this turn. The fresh September 18 snapshot is the preservation reference for this work.

## Git status

Both repositories remain dirty. The parent still has its pre-existing modified Hexo files and untracked personal app, nested Notes directory, and other pre-existing files. Notes still has its pre-existing modified article metadata/files, three deleted article editions, three deleted old asset paths, modified README/migration report, and untracked Astro application files. None were staged or reverted.

Full post-verification status listings are saved in the fresh snapshot at `main/status-after.txt` and `notes/status-after.txt`. The new report is included in the parent's untracked `nagi.tw/` directory. No independent nagi.tw Git repository was initialized.

## Remaining deployment work — not performed

After separate approval, choose the personal site's repository/build-root arrangement; configure nagi.tw to build this app and publish only its `dist/`; configure Notes to publish its own `dist/`; verify domain/DNS ownership, canonical URLs, robots/sitemaps, and legacy redirects. Preserve the Hexo deployment as a rollback option. Explicitly include personal `public/robots.txt` in a future commit because the parent ignore rules exclude directories named `public`. Refresh and validate preview metadata before publishing. No deployment configuration was changed.
