// Takes a fresh screenshot of each live project for the Work section.
// Run with: node tools/capture_work.js   (from the project folder)
const { chromium } = require(process.env.HOME + '/projects/IdVerifyReset/tests/e2e/node_modules/playwright');

// The live sites to photograph, and the file name each one is saved under.
const LIVE_SITES = [
  { url: 'https://kopi111.github.io/summer-splash/', file: 'summer-splash.jpg' },
  { url: 'https://kopi111.github.io/jelly-water/', file: 'jelly-water.jpg' },
  { url: 'https://kopi111.github.io/strategy-desk/', file: 'strategy-desk.jpg' },
];

/** Opens one site, lets its opening animation finish, and saves a JPEG. */
async function captureSite(browser, site) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(site.url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `assets/work/${site.file}`, type: 'jpeg', quality: 82 });
  await page.close();
}

/** Captures every site in turn so one slow site cannot starve the others. */
async function main() {
  const browser = await chromium.launch();
  for (const site of LIVE_SITES) await captureSite(browser, site);
  await browser.close();
}

main();
