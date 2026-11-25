// Walks the page headlessly at desktop and phone width: checks for console errors and
// sideways page scroll, uses every interactive piece, and saves screenshots to the folder given.
// Run with: node tools/check_page.js <screenshot-folder>
const path = require('path');
const { chromium } = require(process.env.HOME + '/projects/IdVerifyReset/tests/e2e/node_modules/playwright');

const PAGE_URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const SHOTS = process.argv[2];
const VIEWPORTS = [{ name: 'desktop', width: 1440, height: 900 }, { name: 'phone', width: 400, height: 800 }];

/** Scrolls straight to a page position and waits for the page to settle. */
async function scrollToPosition(page, position) {
  await page.evaluate((target) => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, target);
  }, position);
  await page.waitForTimeout(1100);
}

/** Scrolls so a section's top sits under the menu, then photographs it. */
async function shootSection(page, prefix, selector, name) {
  const top = await page.evaluate((target) => document.querySelector(target).getBoundingClientRect().top + scrollY - 70, selector);
  await scrollToPosition(page, top);
  await page.screenshot({ path: `${SHOTS}/${prefix}-${name}.png` });
}

/** Confirms the strip really moves sideways and its last card ends on screen. */
async function checkMomentsMove(page, prefix) {
  const position = await page.evaluate(() => {
    const section = document.getElementById('moments');
    return section.getBoundingClientRect().top + scrollY + section.offsetHeight - innerHeight;
  });
  await scrollToPosition(page, position);
  await page.screenshot({ path: `${SHOTS}/${prefix}-moments-end.png` });
  return page.evaluate(() => {
    const track = document.getElementById('moments-track');
    return { transform: track.style.transform, lastRight: Math.round(track.lastElementChild.getBoundingClientRect().right), screen: innerWidth };
  });
}

/** Scrolls through the timeline and records which years the giant number showed. */
async function checkYearsChange(page, prefix) {
  const years = [];
  const entries = await page.locator('#timeline li').count();
  for (let index = 0; index < entries; index += 1) {
    await page.locator('#timeline li').nth(index).evaluate((entry) => {
      const box = entry.getBoundingClientRect();
      window.scrollTo(0, box.top + scrollY + box.height / 2 - innerHeight / 2);
    });
    await page.waitForTimeout(700);
    years.push(await page.textContent('#big-year'));
    if (index === 2) await page.screenshot({ path: `${SHOTS}/${prefix}-experience-mid.png` });
  }
  return years;
}

/** Opens the fourth project tab and confirms it took over from the first. */
async function checkProjectTabs(page, prefix) {
  await page.locator('.project-tab').nth(1).click();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${SHOTS}/${prefix}-work-phone-app.png` });
  await page.locator('.project-tab').nth(3).click();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${SHOTS}/${prefix}-work-open.png` });
  return page.locator('.project.is-open h3').textContent();
}

/** Runs every check for one screen size and prints the results. */
async function checkViewport(browser, viewport) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const problems = [];
  page.on('pageerror', (error) => problems.push('pageerror: ' + error.message));
  page.on('console', (message) => {
    // The photo and clip are optional, so their missing files are expected until they are added.
    if (message.type() === 'error' && !message.text().includes('ERR_FILE_NOT_FOUND')) problems.push(message.text());
  });

  await page.goto(PAGE_URL);
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${SHOTS}/${viewport.name}-hero.png` });

  await shootSection(page, viewport.name, '#about', 'about');
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${SHOTS}/${viewport.name}-card-front.png` });
  await page.click('#id-card');
  const flipped = await page.getAttribute('#id-card', 'aria-pressed');
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${SHOTS}/${viewport.name}-card-back.png` });

  await shootSection(page, viewport.name, '#skills', 'skills');
  await page.locator('.element').nth(10).click();
  const skillShown = await page.textContent('#panel-name');
  await page.locator('.family-button').nth(2).click();
  const dimmed = await page.locator('.element.is-dimmed').count();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/${viewport.name}-skills-filtered.png` });
  await page.locator('.family-button').nth(2).click();

  await shootSection(page, viewport.name, '#work', 'work');
  const openedProject = await checkProjectTabs(page, viewport.name);
  await shootSection(page, viewport.name, '#learning', 'learning');
  const years = await checkYearsChange(page, viewport.name);
  await shootSection(page, viewport.name, '#moments', 'moments');
  const strip = await checkMomentsMove(page, viewport.name);
  await shootSection(page, viewport.name, '#contact', 'contact');
  const currentMenuItem = await page.textContent('#section-menu a.is-current');

  // Any image that failed to load counts as a problem, except the two optional photos.
  const brokenImages = await page.evaluate(async () => {
    const images = [...document.images].filter((image) => !['hero-photo', 'id-photo-image'].includes(image.id));
    images.forEach((image) => { image.loading = 'eager'; });
    await Promise.all(images.map((image) => image.decode().catch(() => {})));
    return images.filter((image) => !image.naturalWidth).map((image) => image.src);
  });
  const sideways = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

  console.log(JSON.stringify({ viewport: viewport.name, flipped, skillShown, dimmed, openedProject, years, strip, currentMenuItem, brokenImages, sideways, problems }));
  await page.close();
}

/** Checks each screen size in turn. */
async function main() {
  const browser = await chromium.launch();
  for (const viewport of VIEWPORTS) await checkViewport(browser, viewport);
  await browser.close();
}

main().catch((error) => { console.error(error); process.exit(1); });
