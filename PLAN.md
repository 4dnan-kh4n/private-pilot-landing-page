# PrivatePilot landing website

## Scope

Build an informational landing website with an extension ZIP download and clear manual installation instructions. Match the Sara-Pragya landing page's layout, dark palette, purple and teal accents, typography, orbit animation, scroll workflow, FAQ, navigation, and footer. Replace its branding and subject matter with accurate PrivatePilot content.

Reference: https://sara-pragya-web.vercel.app/
Reference source: C:/Users/mak22/Desktop/Sara-Pragya/apps/web
Extension source: C:/Users/mak22/Desktop/Private-Pilot/private-pilot-testing/extension
New website: C:/Users/mak22/Desktop/Private-Pilot/private-pilot-website

## Stack

- React for the interface, with Vite for development and production builds.
- Node.js and Express for serving the built website and extension download.
- HTML, CSS, and JavaScript; reuse relevant reference styling and React presentation components.
- No MongoDB, accounts, analytics, or stored visitor data are needed for this scope.

The reference uses Next.js. Port its landing presentation to React rather than copying its assessment application or backend.

## Phase gates

Complete one phase, report its result and checks, and wait for the user's explicit approval before starting the next phase.

### Phase 1 — Inspect and plan

- Inspect the existing extension and reference landing page.
- Run the existing project's extension tests, syntax checks, and full test suite.
- Record the design, scope, stack, download requirements, and current limitations in this file.
- Deliverable: this reviewable plan. No application or extension code changes.

### Phase 2 — Build the landing page

- Set up the separate React, Node.js, and Express website.
- Port the reference's landing layout, responsive styles, and relevant animations.
- Include PrivatePilot's introduction, privacy problem, features, controlled workflow, installation section, FAQ, and footer.
- Use the hero and navigation buttons to lead to the installation section until the real ZIP is ready in Phase 3.
- Keep claims accurate: a controlled privacy layer, heuristic detection, local OCR, and explicit confirmation for actions.
- Check the build and review desktop and mobile layouts locally.
- Deliverable: working local landing-page preview for approval.

### Phase 3 — Add and verify the extension download

- Package the existing extension runtime files into a versioned ZIP with a clearly named extension folder.
- Include manifest.json, all runtime scripts and styles, and the required local Tesseract worker, WebAssembly files, and English language data.
- Include installation instructions and the current assistant limitation; exclude development tests and unrelated website/backend files.
- Never include .env, credentials, node_modules, logs, screenshots, recordings, or placeholder mappings.
- Serve the actual ZIP through Express and connect the download buttons.
- Verify the archive's contents, downloadable response, and manifest-relative runtime paths.
- Document: download, extract, open chrome://extensions, enable Developer mode, Load unpacked, choose the folder containing manifest.json, review site access, and reload the target webpage.
- Deliverable: functioning download and verified archive for approval.

### Phase 4 — Final checks and handoff

- Review navigation, FAQ, animations, keyboard access, reduced motion, mobile layout, privacy wording, and installation instructions.
- Run website checks and the three original project check commands again.
- Provide changed files, results, local run instructions, and manual testing steps.
- Deliverable: local website ready for review. Publishing is a separate, explicitly authorized step.

## Distribution limitation discovered during inspection

The extension constructs its assistant endpoint from the active webpage's origin in extension/sidepanel.js. The assistant currently works on pages served by the existing PrivatePilot backend; downloading and installing the extension does not provide an assistant service for arbitrary websites.

Local DOM redaction and the optional local OCR scan do not need that backend. Explain this distinction beside installation instructions and in the FAQ. Changes to the assistant's routing, deployment, or extension architecture are outside this landing-page scope and require a separately explained and approved phase.

## Privacy boundaries

- The privacy risk starts when a browser assistant is allowed to read an active logged-in page; sharing a URL alone does not expose private page content.
- PrivatePilot does not claim to intercept or universally protect against closed third-party browser assistants.
- Chrome does not guarantee extension execution order before another browser agent reads the page.
- Detection is heuristic; OCR may miss blurred, stylised, or obscured text.
- Raw page context, screenshots, raw OCR text, cookies, passwords, OTPs, and placeholder mappings must not be uploaded.
- Demonstrations use fictional data only.
- Describe normal HTTP and HTTPS page support and Chrome's protected-page restrictions accurately.
- Do not alter the existing authentication, profile access, secrets, or extension behavior for this landing page.
- No pushes, deployment, secret changes, or file deletion without explicit user authorization.

## Phase 1 verification — 1 October 2026

- Existing Git working tree was clean before adding this plan.
- Live reference page and relevant local React components were inspected.
- npm run test:extension: 14 tests passed.
- npm run check:extension: passed.
- npm test: 18 tests passed and exited successfully with temporary test-only environment settings.
- Initial sandbox runs could not spawn Node test processes; test reruns used execution permission.
- The first full run passed all assertions but remained open because server.js creates the default app on import, which can start a configured MongoDB session store. The successful rerun used empty database and LLM settings plus a dummy test session secret for that process only. No .env file was displayed or edited.
- Only this plan was added in Phase 1. The user subsequently approved Phase 2.

## Phase 2 verification — 1 October 2026

- Built the separate React/Vite frontend and Node.js/Express static server; no database, account system, or visitor-data collection.
- Adapted the reference palette, layout, orbit, changing hero word, navigation hover, scroll-driven feature cards, workflow timeline, FAQ, and footer to PrivatePilot.
- Added installation guidance, an explicit pending-ZIP status, and accurate assistant/backend and privacy limitations.
- npm run build and npm run check: passed.
- npm test in this website: one server/asset/security-boundary test passed.
- Existing project npm run test:extension: 14 passed; npm run check:extension: passed; npm test: 18 passed with temporary test-only environment settings.
- Browser review: desktop hero and navigation, feature-card reveal, FAQ pointer and keyboard activation, single-open FAQ behavior, mobile menu opening/closing, and 390px/320px reflow; no horizontal overflow or browser console errors observed.
- Reduced-motion CSS and animation preferences are implemented; the operating system preference was not changed during review. Manual toggle steps are in README.md.
- Local production preview: http://127.0.0.1:4173/.
- Review screenshot: ../tmp/landing-review/phase-2-desktop.jpg (ignored, not part of source changes).
- The existing extension, demo website, .env files, and reference project were not modified. Dependencies and build output are ignored by the existing repository rules.
- The user subsequently approved Phase 3. Nothing has been pushed or deployed.

## Phase 3 verification — 1 October 2026

- Added native Windows/.NET packaging with an explicit runtime file list and a bundled INSTALL.txt guide. No packaging dependency was added.
- Generated privatepilot-0.1.0.zip: 17 entries, 13,471,510 bytes (13.5 MB). It contains all 16 original runtime files, including five local OCR assets, plus the installation guide in privatepilot-extension/.
- Packaging verifies every source-file checksum, the manifest's entry points, and the side-panel asset references before publishing the local archive. Verify-only mode also checks the release metadata.
- Generated releases are ignored by Git; extension/vendor remains included in the original source. No extension tests, source development README, demo/backend files, dependencies, secrets, logs, screenshots, recordings, or runtime mappings are packaged.
- Express serves one stable download URL with the versioned attachment filename; the page displays the actual manifest version and ZIP size. Vite forwards development downloads to that same local server.
- npm run build, npm run check, and npm run check:package: passed.
- Website npm test: 2 passed, including download HEAD/GET headers, length, ZIP signature, checksum, and source-file restrictions.
- Existing project npm run test:extension: 14 passed; npm run check:extension: passed; npm test: 18 passed with temporary test-only environment settings.
- Extracted the release into the ignored review directory; manifest and guide paths are correct, and all 11 packaged JavaScript files passed node --check.
- Browser review confirmed all four header/mobile/hero/card download links point to the same versioned package. The in-app browser saved the ZIP through its download API; the saved file's byte count and SHA-256 match the release.
- The browser's download-event wait did not report completion after the initial button click, so direct download and filesystem checksum verification were used to confirm the actual artifact.
- Mobile 390px layout has no horizontal overflow. The assistant-backend limitation remains visible beside installation and in the bundled guide.
- Loading the extracted extension in Chrome and a live OCR scan remain manual review steps in README.md; no browser extension was installed automatically.
- Local preview: http://127.0.0.1:4173/. Download: http://127.0.0.1:4173/downloads/privatepilot.zip.
- The existing extension, authenticated demo application, and .env files are unchanged. Nothing has been pushed or deployed.
- The user subsequently approved Phase 4 (final checks and handoff).

## Phase 4 verification — 1 October 2026

- Final website build, syntax check, and archive verification passed; website npm test: 2 passed.
- Existing project npm run test:extension: 14 passed; npm run check:extension: passed; npm test: 18 passed and exited with temporary test-only settings. No secrets were displayed or edited.
- Reviewed privacy wording, installation steps, assistant-backend requirement, and all section/download links. No functional change was needed.
- Browser review confirmed the keyboard skip link focuses main content, Enter/Space opens FAQs with one answer open, and mobile navigation closes after selecting Install.
- Desktop, 320px, and 768px layouts had no horizontal overflow; the previous 390px review also passed. No browser console errors were observed. Temporary viewport overrides were reset.
- Reduced-motion support was reviewed in source; an actual operating-system preference toggle, Chrome loading, and a live OCR scan remain manual checks. These limits are recorded in README.md.
- Updated README.md and this plan for the final handoff. The existing extension and authenticated demo are unchanged; generated archives, builds, and review screenshots remain ignored. No database was added and nothing was pushed or deployed.
- Local preview: http://127.0.0.1:4173/. Download: http://127.0.0.1:4173/downloads/privatepilot.zip.
- Final screenshot: ../tmp/landing-review/phase-4-desktop.jpg. All planned phases are complete for the user's final local review.
