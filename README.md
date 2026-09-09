# Multipuls v3

A complete static multiplication trainer, prepared for GitHub Pages and installation on a phone. No build step, backend, account system, API keys or package installation is needed to publish it.

This release starts from the v2.3 interface: the freestanding green X, mint app name, matching Settings/Share controls, 13 languages, and the start-style pause screen. It adds durable session storage and offline support.

## Deploy on GitHub Pages

1. Extract the release ZIP on your computer.
2. Create or open a public GitHub repository named `Multipuls`. For a new repository, enable **Add README** so the default branch exists. Public repositories support Pages on GitHub Free. [GitHub: create a Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).
3. In the repository, choose **Add file → Upload files**. Upload the extracted files and folders into the repository root, then commit the upload to `main`. The root file list must show `index.html`, `app.js`, `styles.css`, `manifest.webmanifest`, `service-worker.js`, `storage.js`, `share.js`, `pwa.js`, `assets/`, and `icons/`. The tests and documentation can be uploaded with them. [GitHub: upload files](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).
4. Open **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose **main**, select **/(root)** and save. [GitHub: publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
5. Wait for deployment, then use **Visit site** on the Pages settings screen. Publication can take up to 10 minutes. The Actions tab shows deployment status. [GitHub: view the published site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#viewing-your-published-site).

For the account `mynameisedward-swe` and repository `Multipuls`, the expected address after deployment is [Multipuls on GitHub Pages](https://mynameisedward-swe.github.io/Multipuls/). This ZIP does not create the repository or publish that URL. Paths are relative, so the files also work under a different repository name without editing asset paths. The Share button automatically uses the actual deployed app address.

The ZIP contents match the repository structure directly; there is no extra enclosing project directory inside the archive.

## First published check

Confirm that **v3** appears beside the app name. Play a few questions, change a setting, pause, and reload: the saved round should offer **Continue playing / Fortsätt spela** with your scores and choices intact. Share should open the device's sharing sheet with the app link, or copy just the link if native sharing is unavailable.

Open the site online once and allow its initial loading to finish. Reload it once while online, then try it in airplane mode: the app should load and let you play offline. Sharing a link to another person naturally still needs whatever connection the selected messaging app uses.

On iPhone, open the published address in Safari. Use **Safari's Share menu → Add to Home Screen**, enable **Open as Web App** if offered, and tap **Add**. [Apple's instructions](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios).

Repeat the pause, close/reopen and offline checks from the Home Screen app. Safari and installed-app storage can depend on the browser/app context, so start and resume your test in the same context.

## Sessions and settings

The app saves after answers, new questions and settings changes. Snapshots include selected tables, difficulty, mastery goal, language, overall statistics, every pair's streak/errors/response times, and history for temporarily deselected tables. The unfinished question is deliberately excluded. Reopening an active round therefore returns paused with no timeout penalty and no added response time. A completed round restores its results screen.

Reset starts a new saved round while keeping language and training choices. If browser storage is unavailable, the app continues to work and tells the user that it cannot save. Unreadable or newer saved formats are preserved until an explicit reset. Data is local to this browser/app context; it is not uploaded to GitHub or synchronized between devices. Clearing site data removes saved progress.

The storage key includes the app directory and stays the same across releases. It does not use Nottraining's keys. Service-worker cache names also include the app directory, and cleanup is limited to older Multipuls caches for that directory.

## PWA and updates

- `manifest.webmanifest` supplies the name, installation icons, standalone mode, relative scope, and versioned launch URL.
- `service-worker.js` uses network-first HTML navigation and caches successful pages for offline use. Static assets are cached by their full URL, including the release query parameter.
- Failed downloads cannot replace the last good cached page. An incomplete new cache does not activate. Existing games are not automatically reloaded when an update installs.
- `pwa.js` registers the worker relative to the app directory and checks for updates without using the browser's HTTP cache for the worker script.
- The layout follows natural document height and includes iPhone safe-area padding. It does not lock the screen to a viewport height.

For every later release, bump the visible version, the script/style query parameters in `index.html`, the manifest `start_url` version, and both `VERSION` and matching asset URLs in `service-worker.js`. Keep the manifest `id` (`/multipuls`) stable to preserve the installed app's identity. This is an identifier, not a resource path that needs to exist. [MDN: manifest identity](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/id).

Keep the storage schema/key stable unless a data migration is implemented. Use the latest user-confirmed working version as the base for each change.

## Source files

| File or directory | Purpose |
| --- | --- |
| `index.html` | Entry page, metadata, script ordering and app markup |
| `styles.css` | Existing premium interface and safe-area layout |
| `app.js` | Training, adaptive repetition, timer, input, scoring, settings and snapshots |
| `storage.js` | Validated device-local storage adapter |
| `share.js` | Native link sharing and copying fallback |
| `pwa.js` | Service-worker registration |
| `manifest.webmanifest` | Installation metadata |
| `service-worker.js` | Versioned offline cache and navigation policy |
| `assets/` | Transparent header X |
| `icons/` | Approved square icon at 180, 192 and 512 pixels |
| `tests/` | Reproducible checks and recorded results |

## Verification

Run from the repository root with Node.js and Python 3:

```sh
node tests/verify-app.cjs
node tests/verify-pwa.cjs
```

**65/65 automated checks passed:** 53 training, storage and integration checks plus 12 release/service-worker checks. This includes a full standard round, stale callbacks, reload during a question and during feedback, restored mastery/history/settings, reset, native-sharing fallbacks, real script boot order, relative deployment paths, offline navigation, cached assets and safe cache cleanup.

The tests execute the shipped JavaScript with a deterministic clock, a minimal DOM double, simulated storage/sharing, and an in-memory service-worker environment. They do not send messages or make network requests. Browser testing could not be run in this environment because the browser's URL policy blocked the preview route; that restriction was not bypassed. Actual Chromium/Safari rendering, native sharing and iPhone installation remain the short post-deployment checks above.

## If deployment does not show the app

- **404:** check that Pages uses `main` and `/(root)`, and that `index.html` is at the top level of the repository.
- **Only the README appears:** the entry HTML was uploaded into an extra enclosing folder. Move the package contents to the repository root.
- **Deployment is still pending or failed:** inspect the Pages workflow in **Actions** and the publishing source in **Settings → Pages**.
- **An older version appears:** reload online and check the version label. For future updates, deploy the complete release with all version bumps together. Avoid clearing site data as a routine update step because it removes the saved round.
