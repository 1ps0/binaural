#!/usr/bin/env sh
# Per-engine setup for `npm run test:browser`. Nothing here is committed; browsers land in
# v2/.browsers (gitignored) or come from the OS. Re-run any time; each step is idempotent.
set -eu
cd "$(dirname "$0")/.."

echo "== Firefox (geckodriver) =="
if command -v geckodriver >/dev/null 2>&1; then
  echo "geckodriver: $(geckodriver --version | head -1)"
else
  echo "missing: brew install geckodriver   (Firefox.app from mozilla.org)"
fi

echo "== Safari (safaridriver) =="
if [ "$(uname)" = "Darwin" ] && command -v safaridriver >/dev/null 2>&1; then
  echo "safaridriver: $(safaridriver --version 2>&1 | head -1)"
  echo "one-time:   sudo safaridriver --enable"
  echo "one-time:   Safari > Develop > Allow Remote Automation   (no headless mode; a window opens)"
else
  echo "Safari is macOS only"
fi

echo "== Chromium (chromedriver + Chrome for Testing) =="
# Homebrew's chromium/chromedriver casks are disabled (Gatekeeper, 2026-09). Google's
# Chrome for Testing is a version-matched, non-updating build made for automation; it is
# installed here project-locally, so no consumer Chrome appears in /Applications.
if [ "${1:-}" = "--chromium" ] || [ ! -d .browsers ]; then
  npx --yes @puppeteer/browsers install chrome@stable --path ./.browsers
  npx --yes @puppeteer/browsers install chromedriver@stable --path ./.browsers
fi
node -e "import('./browser-tests/webdriver.mjs').then(m => console.log('chromium pair:', m.BROWSERS.chromium.available() ? 'ready' : 'missing', '\n  driver:', m.chromedriverBinary(), '\n  binary:', m.chromiumBinary()))"

echo "== run =="
echo "npm run test:browser              # all engines whose driver is present"
echo "node browser-tests/smoke.mjs --browser=firefox,safari,chromium --strict"
