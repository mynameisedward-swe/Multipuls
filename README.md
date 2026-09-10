# Multipuls v3.4

A complete static multiplication trainer, prepared for GitHub Pages and installation on a phone. No build step, backend, account system, API keys or package installation is needed to publish it.

This release starts from the verified v3.3 ZIP and changes only the four requested areas, plus release versions, regression checks and documentation.

## Changes in v3.4

1. **Mobile height:** the old vertical stack could require about 852 CSS pixels during play before any extra safe-area space or wrapped text. It responded to width, but not available height. The app now measures its actual content against the visible viewport, including safe-area padding, and chooses the roomiest layout that fits. It reduces spacing first, then uses more compact sizing on short screens. Keys remain at least 44 pixels high. Very short screens omit the secondary footer hint; short landscape screens place the keypad beside the question. Overscroll is suppressed when the game fits. Settings/results remain scrollable, and zoom or exceptionally small views can still scroll so controls are never clipped. No fixed positioning, forced viewport height or page overflow lock is used. [Visual viewport documentation](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport), [Overscroll documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior).
2. **Settings language picker:** opening Settings previously called `language.focus()`, which could activate the native picker. It now focuses Close. Language is the last setting, before the Back and Reset actions, and opens when tapped.
3. **Stable pause panel:** the hidden Pause button now retains its layout space. Previously its removal reduced the timer row by about 27 pixels. The question card, answer box and keypad keep their positions when starting or pausing, with space reserved for the start/continue action.
4. **Automatic equation reveal:** the new **Show full equation after mistakes** switch is off by default. When enabled, wrong answers and timeouts show the complete equation in the main display during the existing feedback interval. They still count as misses. The entered answer stays visible in its field; an empty field stays at **?**. The choice is translated into all 13 languages, saves across reopening and survives round reset. Existing saved rounds start with it off.

## Behavior retained from v3.3

1. A revealed equation starts at the original question font size. If it does not fit, the app measures its rendered width and chooses the largest fitting size, to a tenth of a pixel, with a small margin for rounding. This also handles **10 × 10 = 100**. It refits on window resize and restores the original question typography on the next question or pause. The question area's height is unchanged.
2. The answer field stays at **?** during a reveal instead of duplicating the correct answer there. It is disabled during feedback as before. The full equation and feedback still show the correct answer, and revealing still records one miss without correct-answer or mastery credit.

## Behavior retained from v3.2

1. Tapping **?** also shows the full equation in the main display, for example **3 × 4 = 12**. The equation fits into the existing question area during the same feedback interval. It returns to the normal question display when the next question starts or the session pauses. Revealing still records one miss and gives no correct-answer or mastery credit.
2. The combination dropdown is now a **Both numbers required** switch, translated into all 13 existing languages. **Off** keeps the original behavior: at least one factor is selected and the other can be any number from 1–10. **On** requires both factors to come from the selected numbers. Off remains the default. Existing saved choices, including Both selected from v3.1, carry over automatically.

## Behavior retained from v3.1

1. Tap the **?** in the answer field during a question to reveal the correct answer. It records one missed question, resets that pair's streak, and gives no correct-answer or mastery credit. The usual feedback interval then advances to the next question. The control is unavailable while paused, in Settings, or while digits are entered; delete the digits to show **?** again.
2. Selecting 6, 7, 8 and 9 gives 34 unique pairs with **Both numbers required** off or 10 unique pairs with it on. Switching modes preserves history, scores and settings. Existing v3 sessions restore in the original mode.
3. The page now declares its dark color scheme before loading CSS and gives the body an explicit `#111c1e` background, matching the existing page/manifest theme colors. Existing safe-area padding and edge-to-edge viewport support are retained. This gives Android the applicable web color hints; an exact match for the system navigation bar, especially in three-button mode, cannot be guaranteed or verified here. The browser and operating system control system surfaces. [Color-scheme guidance](https://web.dev/articles/color-scheme), [Chrome's Android edge-to-edge behavior](https://developer.chrome.com/docs/css-ui/edge-to-edge), [Manifest theme-color behavior](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/theme_color).

To update an existing GitHub Pages deployment, upload the extracted contents into the same repository root, replacing the previous release files, and commit. Open the app online and reload to check the **v3.4** label. The service-worker cache and asset URLs are versioned for this update; the installed app identity and saved-session key are unchanged. Do not clear site data to update, because it contains your saved round.

## Deploy on GitHub Pages

1. Extract the release ZIP on your computer.
2. Create or open a public GitHub repository named `Multipuls`. For a new repository, enable **Add README** so the default branch exists. Public repositories support Pages on GitHub Free. [GitHub: create a Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).
3. In the repository, choose **Add file → Upload files**. Upload the extracted files and folders into the repository root, then commit the upload to `main`. The root file list must show `index.html`, `app.js`, `styles.css`, `manifest.webmanifest`, `service-worker.js`, `storage.js`, `share.js`, `pwa.js`, `assets/`, and `icons/`. The tests and documentation can be uploaded with them. [GitHub: upload files](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).
4. Open **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose **main**, select **/(root)** and save. [GitHub: publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
5. Wait for deployment, then use **Visit site** on the Pages settings screen. Publication can take up to 10 minutes. The Actions tab shows deployment status. [GitHub: view the published site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#viewing-your-published-site).

For the account `mynameisedward-swe` and repository `Multipuls`, the expected address after deployment is [Multipuls on GitHub Pages](https://mynameisedward-swe.github.io/Multipuls/). This ZIP does not create the repository or publish that URL. Paths are relative, so the files also work under a different repository name without editing asset paths. The Share button automatically uses the actual deployed app address.

The ZIP contents match the repository structure directly; there is no extra enclosing project directory inside the archive.

## First published check

Confirm that **v3.4** appears beside the app name. Check that the game fits with browser bars visible and from the installed app. Start and pause: the question card and keypad should stay in place. Open Settings: the language list should stay closed at the bottom. Turn automatic equation reveal on, answer incorrectly and let one question time out; both should reveal the equation and record a miss. Play a few questions, change a setting, pause, and reload: the saved round should offer **Continue playing / Fortsätt spela** with your scores and choices intact. Tap **?** on a fresh question and check that the main display shows the full equation while the answer field stays at **?**, without adding a correct answer. Check that **10 × 10 = 100** fits your phone's screen and that short equations retain the original size when they fit. Try **Both numbers required** on and off with a small table selection. Share should open the device's sharing sheet with the app link, or copy just the link if native sharing is unavailable. On Android, check the bottom system bar in both the browser and installed app.

Open the site online once and allow its initial loading to finish. Reload it once while online, then try it in airplane mode: the app should load and let you play offline. Sharing a link to another person naturally still needs whatever connection the selected messaging app uses.

On iPhone, open the published address in Safari. Use **Safari's Share menu → Add to Home Screen**, enable **Open as Web App** if offered, and tap **Add**. [Apple's instructions](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios).

Repeat the pause, close/reopen and offline checks from the Home Screen app. Safari and installed-app storage can depend on the browser/app context, so start and resume your test in the same context.

## Sessions and settings

The app saves after answers, new questions and settings changes. Snapshots include selected tables, combination mode, difficulty, mastery goal, language, the automatic-reveal preference, overall statistics, every pair's streak/errors/response times, and history for temporarily deselected tables or excluded pairs. The unfinished question is deliberately excluded. Reopening an active round therefore returns paused with no timeout penalty and no added response time. A completed round restores its results screen.

Reset starts a new saved round while keeping language and training choices. If browser storage is unavailable, the app continues to work and tells the user that it cannot save. Unreadable or newer saved formats are preserved until an explicit reset. Data is local to this browser/app context; it is not uploaded to GitHub or synchronized between devices. Clearing site data removes saved progress.

The storage key includes the app directory and stays the same across releases. It does not use Nottraining's keys. Service-worker cache names also include the app directory, and cleanup is limited to older Multipuls caches for that directory.

## PWA and updates

- `manifest.webmanifest` supplies the name, installation icons, standalone mode, relative scope, and versioned launch URL.
- `service-worker.js` uses network-first HTML navigation and caches successful pages for offline use. Static assets are cached by their full URL, including the release query parameter.
- Failed downloads cannot replace the last good cached page. An incomplete new cache does not activate. Existing games are not automatically reloaded when an update installs.
- `pwa.js` registers the worker relative to the app directory and checks for updates without using the browser's HTTP cache for the worker script.
- The layout keeps natural document height, measures available space and retains iPhone safe-area padding. It does not clip the page to a forced height.

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

**94/94 automated checks passed:** 81 training, storage and integration checks plus 13 release/service-worker checks. All 86 earlier checks remain. Eight added checks cover Settings focus/order, automatic-reveal defaults and persistence, wrong/timeout scoring and feedback duration, clearing revealed equations on pause/settings/exit/reset, viewport fitting with safe areas, resizing without timer/storage changes, zoom and scrollable settings/results, and CSS pause-space/touch-size safeguards.

`tests/equation-layout-review.json` records results from the fitting tests using a deterministic DOM geometry double at widths from 320 pixels. These are simulated widths, not actual browser or device font measurements. The published app measures its actual rendered text. Width fitting still applies only during reveal. Short-screen layouts may also reduce the base question size to fit the available height; the container reserves that layout’s question height.

The tests execute the shipped JavaScript with a deterministic clock, DOM/text-geometry doubles, simulated storage/sharing, and an in-memory service-worker environment. They do not send messages or make network requests. `tests/mobile-layout-review.json` records CSS box-model estimates and their assumptions. The controller tests use synthetic element heights; neither is a real device rendering check. Browser testing could not be run in this environment because the browser's URL policy blocked the preview route; that restriction was not bypassed. Actual Chromium/Safari rendering, native sharing and iPhone installation remain the short post-deployment checks above.

## If deployment does not show the app

- **404:** check that Pages uses `main` and `/(root)`, and that `index.html` is at the top level of the repository.
- **Only the README appears:** the entry HTML was uploaded into an extra enclosing folder. Move the package contents to the repository root.
- **Deployment is still pending or failed:** inspect the Pages workflow in **Actions** and the publishing source in **Settings → Pages**.
- **An older version appears:** reload online and check the version label. For future updates, deploy the complete release with all version bumps together. Avoid clearing site data as a routine update step because it removes the saved round.
