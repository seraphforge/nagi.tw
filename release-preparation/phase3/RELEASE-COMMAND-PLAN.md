# Release command plan — DO NOT RUN until final approval

This is the requested future command/action sequence. No staging, commit, push, settings change, DNS change, deployment, or redirect activation occurred during preparation.

Run commands one block at a time in PowerShell. Stop on any error or unexpected staged diff. This plan commits the two approved release sets separately; the parent legacy changes remain unstaged. If branch protection requires PRs, stop before direct pushes and use reviewed release branches/PRs instead; do not bypass protections.

Prerequisites: accept the Phase 3 report, including the D-class legacy page disposition and the choice of a real HTTP redirect layer. Preserve the known-good legacy deployment artifact/commit and current DNS/Pages settings. Check that each repository is still on `main`, and fetch/review upstream changes before staging. Do not merge unrelated remote changes without another validation pass.

```powershell
$releaseRoot = 'C:\Users\0ping\Desktop\Seraph.tw'
$notesRoot = Join-Path $releaseRoot 'notes.nagi.tw'
$releasePackage = Join-Path $releaseRoot 'nagi.tw/release-preparation/phase3'
function Assert-ReleaseCommand {
  if ($LASTEXITCODE -ne 0) { throw "Command failed: $LASTEXITCODE. Stop release." }
}
git -C $releaseRoot branch --show-current
git -C $notesRoot branch --show-current
# Both must be main. Review fetched changes before continuing.
git -C $releaseRoot fetch origin
Assert-ReleaseCommand
git -C $notesRoot fetch origin
Assert-ReleaseCommand
git -C $releaseRoot log --oneline HEAD..origin/main
git -C $notesRoot log --oneline HEAD..origin/main
# Both ranges must be empty. Otherwise stop and reconcile safely.
node (Join-Path $releasePackage 'verify-staging-inputs.mjs')
Assert-ReleaseCommand
```

## 1. Stage personal site

Install only the prepared control files after approval. The current Hexo workflow must first be preserved in the recovery package; this installation replaces its publishing role without deleting Hexo source.

```powershell
Copy-Item -LiteralPath (Join-Path $releasePackage 'parent.gitignore.final') -Destination (Join-Path $releaseRoot '.gitignore')
Copy-Item -LiteralPath (Join-Path $releasePackage 'workflows/personal-pages.yml') -Destination (Join-Path $releaseRoot '.github/workflows/pages.yml')
# Install the Notes candidates now too so the read-only combined guard can verify both.
New-Item -ItemType Directory -Force -Path (Join-Path $notesRoot '.github/workflows') | Out-Null
Copy-Item -LiteralPath (Join-Path $releasePackage 'notes.gitignore.final') -Destination (Join-Path $notesRoot '.gitignore')
Copy-Item -LiteralPath (Join-Path $releasePackage 'workflows/notes-pages.yml') -Destination (Join-Path $notesRoot '.github/workflows/pages.yml')
node (Join-Path $releasePackage 'verify-staging-inputs.mjs') --installed
Assert-ReleaseCommand
git --literal-pathspecs -C $releaseRoot add --pathspec-from-file="${releasePackage}/staging-parent.txt"
Assert-ReleaseCommand
git -C $releaseRoot diff --cached --check
Assert-ReleaseCommand
git -C $releaseRoot diff --cached --name-status
git -C $releaseRoot diff --cached --stat
git -C $releaseRoot diff --cached
```

Review against all 19 entries in `staging-parent.txt`. No `source/`, `themes/`, `_config.yml`, scaffolds, generated files, or `notes.nagi.tw` gitlink may appear. Literal pathspec mode also makes this pattern safe for Astro's bracketed filenames in the Notes manifest.

## 2. Commit personal site

```powershell
git -C $releaseRoot commit -m 'release: prepare Design V1 personal Astro site'
Assert-ReleaseCommand
git -C $releaseRoot rev-parse HEAD
git -C $releaseRoot status --short
```

Record the personal commit SHA. Remaining dirty legacy paths are expected, not a reason to stage them.

## 3. Stage Notes

```powershell
node (Join-Path $releasePackage 'verify-staging-inputs.mjs') --installed
Assert-ReleaseCommand
git --literal-pathspecs -C $notesRoot add --pathspec-from-file="${releasePackage}/staging-notes.txt"
Assert-ReleaseCommand
git -C $notesRoot diff --cached --check
Assert-ReleaseCommand
git -C $notesRoot diff --cached --name-status
git -C $notesRoot diff --cached --stat
git -C $notesRoot diff --cached
```

Review against the 73 exact manifest paths. This release includes the already-approved frontmatter/taxonomy changes, deletion of the three withdrawn editions, and relocation of three assets into `public/assets/images/`. Confirm no article-body edit was introduced. No snapshots, `dist`, dependencies, or caches may appear. These Notes changes were already present before Phase 3.

## 4. Commit Notes

```powershell
git -C $notesRoot commit -m 'release: prepare Notes Astro site and approved publication set'
Assert-ReleaseCommand
git -C $notesRoot rev-parse HEAD
git -C $notesRoot status --short
```

Record the Notes commit SHA; public counts must remain 11 zh, 5 en, 9 ja. The manifests are complete release boundaries, not a request to stage unrelated changes. If smaller history is preferred, split the approved Notes content-metadata/deletion group from its app group before these steps, then re-review staged diffs.

## 5. Push Notes

Confirm remote protections and the intended commit first. The prepared workflow has no push trigger.

```powershell
git -C $notesRoot push origin main
Assert-ReleaseCommand
```

## 6. Push personal site

Before this push, open the parent GitHub Actions page and disable the old **Pages** workflow after recording its state. Ensure no concurrent Hexo/`gh-pages` publication is in progress; do not push to `gh-pages`. The retained live artifact stays recoverable. Confirm the commit being pushed includes the manual-only replacement workflow.

```powershell
git -C $releaseRoot push origin main
Assert-ReleaseCommand
```

Never force-push. A rejected push is a stop condition.

## 7. Enable/configure GitHub Pages

1. Open each repository's **Settings → Pages**. Record existing publishing source, custom domain, and HTTPS state. Choose **GitHub Actions** as source. Ensure the old branch-based publisher no longer competes with Actions.
2. Configure `github-pages` environment protection for the approved `main` branch and reviewers. If the replaced parent workflow remains disabled, re-enable it only after inspecting the remote manual Astro YAML. Confirm Notes has its own workflow/environment.
3. In each repository's Actions tab, select its Astro Pages workflow, **Run workflow**, branch `main`, `deploy=false`. Inspect Node/npm versions, clean install, validation output and artifact contents. This is the first actual Ubuntu CI run; stop if it fails.
4. Inspect artifacts: personal must contain only its five generated files, Notes its expected 92 files, subject to legitimate platform output differences that require review. Reject any Markdown source, snapshot, private article, or workspace-root artifact. No source CNAME file is required for Actions publishing.

## 8. Configure custom domains

1. Verify `nagi.tw` in the GitHub account's Pages settings using the actual generated TXT token. Add only the issued challenge record; do not invent its value.
2. Set Notes repository custom domain to `notes.nagi.tw` and parent repository custom domain to `nagi.tw`.
3. Resolve existing domain claims before continuing. Schedule any reassignment that affects the old site as part of cutover. Do not accidentally configure a user-site-wide domain instead of these repository-specific domains.

## 9. DNS changes and approved publication

At the scheduled cutover, publish Notes first: run **Notes Astro Pages**, branch `main`, `deploy=true`, and approve its environment. Set `notes` CNAME to `seraphforge.github.io`. Complete Notes HTTPS and smoke tests before personal publication.

Then publish personal with **Personal Astro Pages**, branch `main`, `deploy=true`, and approve its environment. For direct GitHub Pages hosting set apex A records:

```text
@  A  185.199.108.153
@  A  185.199.109.153
@  A  185.199.110.153
@  A  185.199.111.153
notes  CNAME  seraphforge.github.io
```

Keep unrelated DNS records. Optional apex IPv6 must use all four addresses in the Phase 2 report or remain disabled; do not retain stale AAAA targets. Do not add wildcard records. If a proxy/redirect provider is chosen, follow its approved origin/TLS configuration instead of treating these direct-DNS values as the complete edge setup.

```powershell
Resolve-DnsName nagi.tw -Type A
Resolve-DnsName nagi.tw -Type AAAA
Resolve-DnsName notes.nagi.tw -Type CNAME
```

## 10. HTTPS verification

Wait for exact-host certificates, enable **Enforce HTTPS** in both repositories, then:

```powershell
curl.exe --fail --silent --show-error --head https://notes.nagi.tw/
curl.exe --fail --silent --show-error --head https://nagi.tw/
curl.exe --silent --show-error --head http://notes.nagi.tw/
curl.exe --silent --show-error --head http://nagi.tw/
```

Require valid TLS, HTTPS 200, HTTP-to-HTTPS redirects to the correct host, and no mixed content. Do not use `--insecure`. Check Notes first before exposing personal cross-site links.

## 11. Production smoke test

```powershell
node (Join-Path $releasePackage 'production-smoke.mjs') https://nagi.tw https://notes.nagi.tw
Assert-ReleaseCommand
```

Also manually test desktop/mobile Design V1, Penguin hover/click/keyboard behavior, menu, preview languages, all article languages, category filters/deep links/empty states, Topics, Archive, Experience, image loading, Notes backlink, RSS, sitemap and robots. Search validation means the 11-group/25-edition public search index; there is no Search page/input in frozen V1. Confirm withdrawn/unpublished routes return 404, not a redirect to public content. Record release SHAs and evidence.

## 12. Enable legacy redirects only after destinations are live

This step requires an approved redirect-capable host/proxy; GitHub Pages cannot interpret a provider `_redirects` file or return arbitrary 301s from static HTML. No redirect is bundled in either Astro artifact.

For a separately approved Cloudflare Bulk Redirect deployment on `nagi.tw`:

1. Configure and verify the proxy/origin/TLS layer for `nagi.tw` without changing the frozen UI. Ensure domain/account ownership and applicable redirect limits are confirmed. This has NOT been provisioned by Phase 3.
2. Create a Bulk Redirect List and import `legacy-redirects.csv` (no header). Review all 73 exact-source rules: status 301; preserve query string; no subdomain matching, subpath matching, or path-suffix preservation. Match scheme/host/path exactly. Never add a catch-all article redirect.
3. Test every destination directly first. C-class deny entries must have no redirect; D-class rows are not in the redirect CSV. Resolve the 130 D-class HTML-page retirement/preservation decisions before declaring legacy preservation complete.
4. Only then enable the associated Bulk Redirect Rule. Revalidate TLS and canonical hosts through the proxy.
5. Verify every emitted candidate:

```powershell
node (Join-Path $releasePackage 'production-smoke.mjs') https://nagi.tw https://notes.nagi.tw --redirects
Assert-ReleaseCommand
curl.exe --silent --show-error --head 'https://nagi.tw/2026/08/17/frc-engineering-team/?utm_source=legacy'
```

Expect HTTP 301 and the correct Chinese FRC destination; verify query preservation. Old fragment anchors require manual review because HTML heading IDs can differ. Independently test the observed `seraphforge.github.io/seraphforge.tw/...` and historical root-level canonical aliases in the JSON map. The custom-domain edge cannot control `github.io`; verify GitHub's actual domain routing before claiming those aliases preserved. If they do not reach the controlled host, stop and obtain an approved separate solution for that hostname. Do not substitute a 200-status meta-refresh page and call it a permanent HTTP redirect.

If any smoke test fails, disable the new redirect rule first and restore the last verified artifact/settings as documented in Phase 2. Do not reset the local repositories or delete Hexo. Archive/freeze legacy only after the successful observation period, keeping its source, lockfile, workflow, deployment artifact and history recoverable.
