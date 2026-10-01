# PrivatePilot landing website

A React landing page with a small Node.js and Express server. No database, sign-in, analytics, or visitor-data storage. The presentation is adapted from the user-supplied Sara-Pragya landing source.

## Run locally

Use Node.js 22.12+ or 24+ on Windows with its bundled PowerShell/.NET, and open a terminal in this folder:

```powershell
npm install
npm run build
npm start
```

Open http://127.0.0.1:4173. The server binds to the local computer for this review phase. Set `PORT` to change its port.

For frontend editing, keep `npm start` running on port 4173 in one terminal, then run `npm run dev` in another and open http://127.0.0.1:5173. Vite forwards extension downloads to the Express server.

`npm run build` packages and verifies the existing extension before building React. The packer uses native Windows APIs; a non-Windows build needs a portable packaging step.

## Deploy the landing website on Vercel

The website folder includes its own `.gitignore` and `vercel.json`. Vercel builds the React page and serves its verified ZIP as a static download. Express remains the local server. No database, `.env`, or LLM keys are needed for the landing deployment; this deployment does not host the extension's assistant backend.

Before pushing this folder to GitHub, run on the current Windows checkout:

```powershell
npm run build
npm run build:vercel
npm test
```

The first command packages and verifies the original extension. It also prepares `public/downloads/privatepilot.zip` and `src/release.json`. These two safe release files must be committed with `package-lock.json`, `vercel.json`, and the website source. The ZIP is an intentional distribution asset; dependencies, private configuration, temporary archives in `/downloads/`, build output, logs, and review media remain ignored.

1. Push the contents of `private-pilot-website` to your GitHub repository. The website can be a standalone repository; the Vercel build does not need its sibling extension/demo source.
2. In the Vercel dashboard, select **Add New → Project**, find that repository, and select **Import**. If it is missing, grant Vercel access to that repository through the GitHub connection.
3. Choose a project name, such as `privatepilot`.
4. Set **Framework Preset** to `Vite`.
5. Set **Root Directory** to the repository root (`./`) if it contains only this website. If the repository includes the parent Private-Pilot folder contents, select `private-pilot-website` instead. Do not select `private-pilot-testing`.
6. Confirm **Build Command** = `npm run build:vercel`, **Output Directory** = `dist`, and **Install Command** = `npm ci`. These are supplied by `vercel.json`; avoid overriding them with the Windows packaging command.
7. Use Node.js `24.x` in Build and Deployment settings. Leave environment variables empty.
8. Select **Deploy**, wait until the deployment shows **Ready**, and open the assigned `.vercel.app` URL.
9. Test desktop/mobile layout, navigation, animation Pause/Play, FAQ, and the extension download. Extract the downloaded ZIP and confirm it contains `privatepilot-extension/manifest.json` and `INSTALL.txt`; follow that guide for Chrome loading. Verify that raw/source routes such as `/.env`, `/server.js`, and `/api/profile` remain unavailable.

Subsequent pushes to the connected production branch trigger another deployment. For extension updates, run `npm run package:extension` in the original Windows checkout and push both the refreshed public ZIP and `src/release.json` together. `build:vercel` checks the ZIP's size/signature/checksum and fails if it differs from its metadata.

For a fresh standalone website checkout without the sibling extension source, use `npm ci`, `npm run build:vercel`, then `npm exec vite -- preview --host 127.0.0.1 --port 4173 --strictPort` for local review. The original `npm run build` packaging path requires the sibling extension folder.

If a Vercel build mentions PowerShell, change its Build Command to `npm run build:vercel`. If it reports a missing release file, confirm the public ZIP and `src/release.json` are present on GitHub. A successful local build verifies the deployable files; hosted routing and headers must still be checked after your actual deployment.

Deployment preparation checks passed: the portable build, syntax checks, archive verification, 3 website tests (including the built static ZIP), 14 extension tests, and 18 project tests. A temporary Vite static preview served the page and exact 13,471,491-byte ZIP with a matching SHA-256, without Express; that preview was stopped afterward. No GitHub push or Vercel deployment was performed.

References: [Vercel Git imports](https://vercel.com/docs/git), [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [build settings](https://vercel.com/docs/builds/configure-a-build), and [Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## Check

```powershell
npm run build
npm run check
npm run check:package
npm test
```

The server tests expect a completed build. They check the landing page, bundled assets, security headers, private/source-file restrictions, and the downloaded ZIP's size, filename, and SHA-256 checksum. `check:package` inspects every ZIP entry, compares its bytes with the source, and checks the manifest and side-panel references.

## Website manual review

1. Open the landing page and review its layout, palette, local-redaction hero animation, typography, feature cards, workflow, and FAQ.
2. Select About, Workflow, Install, and FAQ; confirm each goes to its section without the sticky header covering the title.
3. Select Install to read the instructions. The header and hero Download extension buttons and the installation card Download extension ZIP button download the actual archive.
4. Scroll through the feature cards and workflow; confirm the cards appear and the active workflow stage responds to scrolling.
5. Expand and collapse FAQs with the pointer and with Tab plus Enter/Space; confirm only one answer is open at a time.
6. Review at 390px and 320px widths. Open the mobile navigation, select a section, and confirm the menu closes.
7. Enable the operating system's reduced-motion setting; confirm animated effects stop and all content stays readable.
8. Review the privacy boundaries and assistant-backend requirement beside installation.

## Extension release and installation review

Download: http://127.0.0.1:4173/downloads/privatepilot.zip

The browser saves `privatepilot-0.1.0.zip` for the current manifest version. Every build reads the source manifest's version and produces:

- `downloads/privatepilot-VERSION.zip`: 16 original runtime files plus an installation guide.
- `downloads/release.json`: local version, filename, byte size, and SHA-256 checksum used by the Express server.
- `src/release.json` and `public/downloads/privatepilot.zip`: the matching safe metadata and verified download included in Git for Vercel. The page uses this metadata; Vite copies the public archive into `dist/downloads/privatepilot.zip`.

The local `/downloads/` files are ignored by Git. The public release ZIP and source metadata are intentionally included. The explicit file list excludes extension tests, original development README, demo/backend files, secrets, logs, screenshots, recordings, dependencies, and placeholder mappings. The five required Tesseract/English data files are included.

To rebuild or check the archive separately:

```powershell
npm run package:extension
npm run check:package
```

1. Open the landing page and click Download extension or Download extension ZIP. Confirm the saved file has the versioned ZIP filename and the size shown on the page.
2. Extract it. Confirm `privatepilot-extension/manifest.json` and `privatepilot-extension/INSTALL.txt` exist.
3. Open `chrome://extensions`, enable Developer mode, and select Load unpacked.
4. Choose the extracted `privatepilot-extension` folder, rather than the ZIP, parent folder, or manifest file.
5. Review the broad permissions in extension Details. Choose On all sites for the local guard on normal HTTP and HTTPS webpages, then reload a fictional-data test page.
6. Open PrivatePilot's side panel, review local redaction, and optionally run a visual scan. Follow the guide's assistant/backend limitation. Browser-internal and protected pages remain restricted.

Chrome loading and a live OCR scan are manual checks; automated packaging checks verify the source bytes and all required local paths. No browser extension is installed automatically by this website.

## Current scope

All four implementation phases are complete for local review: the informational landing page, extension release packaging, ZIP download, and final checks. There is no assistant endpoint in this landing website. The existing extension and authenticated demo application are unchanged.

The extension's local DOM redaction and optional OCR can run without the assistant backend. Its current assistant request targets the active webpage's PrivatePilot endpoint, so the assistant needs a page served by the existing PrivatePilot backend. The landing page explains this limitation.

Screenshots for local visual review are saved outside this project and are not part of the website, download, or Git changes. No source has been pushed or deployed.

## Final verification — 1 October 2026

- Website build, server/config syntax check, and archive verification passed; both website tests passed.
- Existing project: 14 extension tests and 18 total project tests passed; extension syntax checks passed. Temporary test-only database/LLM settings were used without changing `.env`.
- Browser review confirmed valid section links, keyboard skip-to-content, Enter/Space FAQ controls, single-open FAQ behavior, mobile menu closing, and zero horizontal overflow at desktop, 320px, and 768px widths. Earlier checks also covered 390px. No browser console errors were observed.
- The downloaded 13.5 MB ZIP was verified against source bytes and extracted successfully. Chrome loading, a live OCR scan, and an actual operating-system reduced-motion toggle remain manual checks above.

Main files: `src/main.jsx` (page and copy), `src/styles.css` (layout), `src/animations.jsx` (presentation), `server.js` (static site and download), `scripts/package-extension.ps1` (verified packaging), `scripts/INSTALL.txt` (bundled guide), and `test/server.test.js` (server/download checks). The root `.gitignore` adds only the generated release directory.

## Requested presentation update — 1 October 2026

Removed the sentence beneath the feature cards. Adapted Sara-Pragya's mouse-wheel easing and section-link scrolling in `src/browser-effects.js`, and connected it through `src/animations.jsx` and `src/main.jsx`. Native touch scrolling, reduced motion, browser zoom, and skip-link focus are preserved. `src/styles.css` hides the OS cursor only while the visible custom cursor is active; leaving the window restores it.

Build and syntax checks passed. All 3 website tests passed, including the new scroll/cursor regression check in `test/browser-effects.test.js`. The original 14 extension tests, extension syntax checks, and 18 project tests passed. Browser review confirmed the removed sentence, wheel and section scrolling, one visible custom cursor with computed native cursor `none`, skip-link focus, and no console errors. No extension or backend behavior changed.

To review: refresh the local website, scroll with the wheel, select About or Workflow, move over links/buttons, and confirm there is only one cursor. Try touch scrolling and the OS reduced-motion preference for the native fallbacks.

## Product wording and mobile workflow update — 1 October 2026

Updated product wording throughout the landing page, page description, and bundled installation guide. Removed the two standalone placeholder badges beneath Why PrivatePilot. Privacy limits and assistant-backend requirements remain accurate. The mobile workflow now connects the centres of the stage circles using CSS segments, with the line starting at the first circle and ending at the last; desktop presentation is preserved.

Build, syntax, package verification, all 3 website tests, 14 extension tests, and 18 project tests passed. Browser measurements confirmed alignment within 0.01px and no horizontal overflow at 320px and 390px widths. Refresh the page with Ctrl + Shift + R and review the workflow at those widths. The updated ZIP includes the revised guide.

The mobile progress dot is restored in `src/animations.jsx` and `src/styles.css`. It follows the existing scroll progress, shares the corrected line's centre, and stops at the first/last stage centres. Reduced-motion preferences still disable the moving dot. Browser review confirmed its position changes with scrolling and alignment at 320px/390px; build, syntax checks, 3 website tests, 14 extension tests, and 18 project tests passed. To review, refresh and scroll the mobile workflow in both directions.

## Project-related hero animation — 1 October 2026

Replaced the decorative orbit with a fictional application form: a local scan highlights values, names/email/account values become placeholders, and a redacted context packet moves to the controlled PrivatePilot assistant. This is an illustrative animation; it never reads a real tab or sends data. The assistant card contains placeholders only throughout the cycle. The diagram sits beside the hero on desktop and below its text on mobile, with an accessible description, keyboard-operated Pause/Play control, and a static redacted view for reduced-motion settings.

Changed `src/animations.jsx`, `src/main.jsx`, and `src/styles.css`; no dependencies or backend/extension behavior changed. Build, syntax, archive verification, 3 website tests, 14 extension tests, and 18 project tests passed. Browser review covered desktop/320px/390px layouts, changing raw/redacted phases, and Pause/Play. To review, refresh, watch a full nine-second cycle, try Pause/Play using Tab and Enter, and check the OS reduced-motion preference manually.
