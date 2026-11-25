// Walks the page headlessly at desktop and phone width: checks for console errors and
// sideways page scroll, clicks every interactive piece, and saves screenshots to the folder given.
// Run with: node tools/check_page.js <screenshot-folder>
const path = require('path');
const { chromium } = require(process.env.HOME + '/projects/IdVerifyReset/tests/e2e/node_modules/playwright');

const PAGE_URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const SHOTS = process.argv[2];
const VIEWPORTS = [{ name: 'desktop', width: 1440, height: 900 }, { name: 'phone', width: 400, height: 800 }];

/** Scrolls so a section's top is at the top of the screen, then photographs it. */
async function shootSection(page, prefix, selector, name) {
  await page.evaluate((target) => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, document.querySelector(target).getBoundingClientRect().top + scrollY - 60);
  }, selector);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${SHOTS}/${prefix}-${name}.png` });
}

/** Confirms the strip really moves sideways as the page scrolls through the section. */
async function checkAchievementsMove(page) {
  return page.evaluate(async () => {
    const section = document.getElementById('achievements');
    const track = document.getElementById('achievements-track');
    const top = section.getBoundingClientRect().top + scrollY;
    const travel = section.offsetHeight - innerHeight;
    scrollTo(0, top + travel);
    await new Promise((resume) => setTimeout(resume, 200));
    const last = track.lastElementChild.getBoundingClientRect();
    return { travel, transform: track.style.transform, lastRight: Math.round(last.right), screen: innerWidth };
  });
}

/** Runs every check for one screen size and prints the results. */
async function checkViewport(browser, viewport) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const problems = [];
  page.on('pageerror', (error) => problems.push('pageerror: ' + error.message));
  page.on('console', (message) => {
    // The hero video is optional, so its missing file is expected until the clip is added.
    if (message.type() === 'error' && !message.text().includes('ERR_FILE_NOT_FOUND')) problems.push(message.text());
  });

  await page.goto(PAGE_URL);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/${viewport.name}-hero.png` });

  // Pause button: label must switch to Play, then back.
  await page.click('#intro-toggle');
  const pausedLabel = await page.getAttribute('#intro-toggle', 'aria-label');
  await page.click('#intro-toggle');

  await shootSection(page, viewport.name, '#about', 'about');
  await page.waitForTimeout(2600);
  await page.click('#id-card');
  const flipped = await page.getAttribute('#id-card', 'aria-pressed');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SHOTS}/${viewport.name}-card-back.png` });

  await shootSection(page, viewport.name, '#skills', 'skills');
  await page.click('.element:nth-of-type(10)');
  const detail = await page.textContent('.detail-name');
  await page.click('.family-button:nth-child(3)');
  const dimmed = await page.locator('.element.is-dimmed').count();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SHOTS}/${viewport.name}-skills-filtered.png` });
  await page.click('.family-button:nth-child(3)');

  await shootSection(page, viewport.name, '#work', 'work');
  await shootSection(page, viewport.name, '#experience', 'experience');
  await shootSection(page, viewport.name, '#achievements', 'achievements');
  const strip = await checkAchievementsMove(page);
  await page.screenshot({ path: `${SHOTS}/${viewport.name}-achievements-end.png` });
  await shootSection(page, viewport.name, '#contact', 'contact');

  // Move the pointer away so the screenshots show the resting grey state.
  await page.mouse.move(0, 0);
  const restingFilter = await page.evaluate(() => getComputedStyle(document.querySelector('.project-shot img')).filter);
  const brokenImages = await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach((image) => { image.loading = 'eager'; });
    await Promise.all(images.map((image) => image.decode().catch(() => {})));
    return images.filter((image) => !image.naturalWidth).map((image) => image.src);
  });
  const sideways = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

  console.log(JSON.stringify({ viewport: viewport.name, pausedLabel, flipped, detail, dimmed, strip, restingFilter, brokenImages, sideways, problems }));
  await page.close();
}

/** Checks each screen size in turn. */
async function main() {
  const browser = await chromium.launch();
  for (const viewport of VIEWPORTS) await checkViewport(browser, viewport);
  await browser.close();
}

main().catch((error) => { console.error(error); process.exit(1); });
