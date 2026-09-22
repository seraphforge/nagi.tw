# Nagi.tw personal site

Independent Astro app for `https://nagi.tw`, alongside the retained legacy Hexo site. The approved personal homepage was copied from Notes without changing its homepage CSS, global CSS, inline Pixel Penguin, typography, or responsive rules.

## Local development

```sh
npm install
npm run dev
npm run build
npm run validate
```

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`.

## Published Notes previews

The personal app owns no articles, content collection, search, archive, or multilingual article routes. During each static build it fetches `https://notes.nagi.tw/rss.xml` and renders the three newest RSS items as metadata-only previews. If the feed is unavailable, the build succeeds with an empty preview list and the existing Notes, Topics, and Archive links remain available.

The shared visual language currently consists of identical copies of `src/styles/global.css`; keep intentional future token changes synchronized between the sites. Homepage layout CSS remains scoped in `src/pages/index.astro`.

## Deployment remains unchanged

No deployment configuration was changed. The root GitHub Pages workflow still builds Hexo. Do not deploy the entire parent directory or its snapshot folder.

After separate approval, configure the main deployment to build this directory and publish only `nagi.tw/dist`; deploy Notes from its own repository and `dist`. Verify domain ownership, canonical URLs, sitemap/robots output, and any required legacy URL redirects before switching. Keep the original Hexo workflow and artifact available for rollback. There is no automatic cross-repository preview refresh yet.

The parent repository ignores directories named `public`; explicitly include this app's `public/robots.txt` when preparing a future commit, or approve a narrowly scoped parent ignore exception. No legacy ignore file was changed during migration.
