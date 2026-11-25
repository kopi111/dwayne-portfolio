// Behaviour for the portfolio page. Each setup function at the bottom of the file
// switches on one feature: menu, hero, ID card, periodic table, project tabs, timeline, moments.

// True when the visitor's device asks for reduced motion; moving features check this.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Content for the periodic table ----------
// The families, in table order. The swatch colour matches the tile shade in styles.css.
const FAMILIES = {
  languages: { name: 'Languages', swatch: '#000' },
  frameworks: { name: 'Frameworks and AI', swatch: '#3d3d3d' },
  data: { name: 'Data', swatch: '#979797' },
  infrastructure: { name: 'Infrastructure', swatch: '#cfcfcf' },
  security: { name: 'Security and networks', swatch: '#fff' },
};

const SKILLS = [
  { symbol: 'Cs', name: 'C#', family: 'languages', use: 'Web APIs, admin portals and the Aitken Shipping site.' },
  { symbol: 'Dt', name: 'Dart', family: 'languages', use: 'Every Flutter app, including Money Path.' },
  { symbol: 'Ph', name: 'PHP', family: 'languages', use: 'A parcel site, and hands-on labs for patching real PHP vulnerabilities.' },
  { symbol: 'Py', name: 'Python', family: 'languages', use: 'Machine learning, data tools and Flask services.' },
  { symbol: 'Js', name: 'JavaScript', family: 'languages', use: 'Strategy Desk and the 3D Jelly Water site, with no build step.' },
  { symbol: 'Sq', name: 'SQL', family: 'languages', use: 'Schemas, reports and repeatable migration scripts.' },
  { symbol: 'Hc', name: 'HTML and CSS', family: 'languages', use: 'The Summer Splash site and this page.' },
  { symbol: 'Ne', name: '.NET', family: 'frameworks', use: 'My main platform for APIs and business systems.' },
  { symbol: 'Mv', name: 'ASP.NET MVC', family: 'frameworks', use: 'Server-rendered sites such as Aitken Shipping.' },
  { symbol: 'Bz', name: 'Blazor', family: 'frameworks', use: 'Interactive C# web apps, including a car rental system.' },
  { symbol: 'Fl', name: 'Flutter', family: 'frameworks', use: 'Android apps, including Money Path.' },
  { symbol: 'Fk', name: 'Flask', family: 'frameworks', use: 'Small Python services, such as a face-check tool.' },
  { symbol: 'St', name: 'Streamlit', family: 'frameworks', use: 'SmartBudget JA, a budgeting project in Python.' },
  { symbol: 'Df', name: 'DeepFace', family: 'frameworks', use: 'Matching a selfie to an ID photo, with a liveness check.' },
  { symbol: 'Ms', name: 'SQL Server', family: 'data', use: 'The database behind my .NET business systems.' },
  { symbol: 'Mb', name: 'MariaDB', family: 'data', use: 'Dashboards and read APIs on MariaDB 11.' },
  { symbol: 'My', name: 'MySQL', family: 'data', use: 'PHP sites and a Blazor incident tracker.' },
  { symbol: 'Fb', name: 'Firebase', family: 'data', use: 'Sign-in and live data for a Flutter delivery app.' },
  { symbol: 'Sl', name: 'SQLite', family: 'data', use: 'Encrypted on-device storage in Money Path.' },
  { symbol: 'Ka', name: 'Kafka', family: 'data', use: 'A live event-streaming demo with Python and ELK.' },
  { symbol: 'Dk', name: 'Docker', family: 'infrastructure', use: 'Local databases and disposable security labs.' },
  { symbol: 'Ii', name: 'IIS', family: 'infrastructure', use: 'Packaging and hosting .NET apps on Windows Server.' },
  { symbol: 'Lx', name: 'Linux', family: 'infrastructure', use: 'My everyday development machine.' },
  { symbol: 'Px', name: 'Proxmox', family: 'infrastructure', use: 'Virtual machines in my own lab.' },
  { symbol: 'Gt', name: 'Git', family: 'infrastructure', use: '106 projects kept on GitHub.' },
  { symbol: 'El', name: 'ELK Stack', family: 'infrastructure', use: 'Searching and charting logs from a streaming demo.' },
  { symbol: 'Cn', name: 'CCNA', family: 'security', use: 'CCNAv7 SRWE, CCNAv7 ENSA and CCNA Security.' },
  { symbol: 'Ow', name: 'OWASP', family: 'security', use: 'The checklist behind my code and vulnerability reviews.' },
  { symbol: 'Jw', name: 'JWT', family: 'security', use: 'Token sign-in for the APIs I build.' },
  { symbol: 'Cc', name: 'CCTV', family: 'security', use: 'Fundamentals of CCTV certificate.' },
];

// ---------- Small shared helpers ----------

/** Creates an element with a class name and optional text. */
function createElement(tag, className, text = '') {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

/** Runs a callback the first time an element scrolls into view. */
function onFirstSight(element, callback) {
  const watcher = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    watcher.disconnect();
    callback();
  }, { threshold: 0.25 });
  watcher.observe(element);
}

// ---------- Section menu ----------

/** Slides the black marker behind one menu link and scrolls the link into view on phones. */
function moveMenuMarker(menu, marker, link) {
  menu.querySelectorAll('a').forEach((other) => other.classList.toggle('is-current', other === link));
  marker.style.opacity = link ? '1' : '0';
  if (!link) return;
  marker.style.width = `${link.offsetWidth}px`;
  marker.style.transform = `translateX(${link.offsetLeft}px)`;
  menu.scrollTo({ left: link.offsetLeft - 40, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}

/** Watches the page sections and highlights whichever one crosses the middle of the screen. */
function setupSectionMenu() {
  const menu = document.getElementById('section-menu');
  const marker = document.getElementById('menu-marker');
  const watcher = new IntersectionObserver((entries) => {
    entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
      moveMenuMarker(menu, marker, menu.querySelector(`a[href="#${entry.target.id}"]`));
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  // The hero has no menu link, so the marker hides there. Certificates has none either, so Work stays lit.
  ['hero', 'about', 'skills', 'work', 'experience', 'moments', 'contact'].forEach((id) => {
    watcher.observe(document.getElementById(id));
  });
}

// ---------- Hero: real work today, a real photo or clip later ----------

/** Shows the person instead of the work, once a photo or clip is known to exist. */
function showPersonInHero(personElement) {
  document.getElementById('hero-work').hidden = true;
  personElement.hidden = false;
}

/** Uses assets/hero-photo.png if that file has been added. */
function usePhotoIfPresent() {
  const photo = document.getElementById('hero-photo');
  photo.addEventListener('load', () => showPersonInHero(photo), { once: true });
  photo.src = 'assets/hero-photo.png';
}

/** Lets the visitor switch the clip's sound on and off. */
function setupSoundToggle(video) {
  const toggle = document.getElementById('sound-toggle');
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    video.muted = !video.muted;
    toggle.setAttribute('aria-pressed', String(!video.muted));
    toggle.setAttribute('aria-label', video.muted ? 'Turn sound on' : 'Turn sound off');
  });
}

/** Uses assets/hero-intro.mp4 if that file has been added. A clip beats a photo. */
function useClipIfPresent() {
  const video = document.getElementById('hero-video');
  video.addEventListener('loadedmetadata', () => {
    document.getElementById('hero-photo').hidden = true;
    showPersonInHero(video);
    setupSoundToggle(video);
    if (!prefersReducedMotion) video.play().catch(() => {});
  }, { once: true });
  video.src = 'assets/hero-intro.mp4';
}

/** Moves the phone, windows and surname slightly with the pointer, so the hero has real depth. */
function setupHeroDepth() {
  const hero = document.getElementById('hero');
  const layers = [...hero.querySelectorAll('[data-depth]')];
  hero.addEventListener('pointermove', (event) => {
    const offsetX = event.clientX / innerWidth - 0.5;
    const offsetY = event.clientY / innerHeight - 0.5;
    layers.forEach((layer) => {
      layer.style.transform = `translate(${-offsetX * layer.dataset.depth}px, ${-offsetY * layer.dataset.depth}px)`;
    });
    hero.style.setProperty('--ghost-x', `${offsetX * 14}px`);
    hero.style.setProperty('--ghost-y', `${offsetY * 8}px`);
  });
}

/** Switches on the hero's optional media and pointer depth. */
function setupHero() {
  usePhotoIfPresent();
  useClipIfPresent();
  if (!prefersReducedMotion && matchMedia('(pointer: fine)').matches) setupHeroDepth();
}

// ---------- ID card ----------

/** Draws barcode bars whose widths come from the letters of the name, so it is not random on each visit. */
function drawBarcode() {
  const barcode = document.getElementById('id-barcode');
  [...'DWAYNEAITKENSOFTWAREENGINEER'].forEach((letter) => {
    const bar = createElement('i', '');
    const code = letter.charCodeAt(0);
    bar.style.width = `${1 + code % 4}px`;
    bar.style.marginRight = `${code % 3}px`;
    barcode.append(bar);
  });
}

/** Tilts the card a little towards the pointer. */
function setupCardTilt(stage, card) {
  stage.addEventListener('pointermove', (event) => {
    const box = card.getBoundingClientRect();
    const offsetX = (event.clientX - box.left) / box.width - 0.5;
    const offsetY = (event.clientY - box.top) / box.height - 0.5;
    card.style.setProperty('--tilt-y', `${offsetX * 14}deg`);
    card.style.setProperty('--tilt-x', `${-offsetY * 10}deg`);
  });
  stage.addEventListener('pointerleave', () => {
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--tilt-x', '0deg');
  });
}

/** Uses assets/card-photo.jpg on the card if that file has been added. */
function useCardPhotoIfPresent() {
  const photo = document.getElementById('id-photo-image');
  photo.addEventListener('load', () => {
    photo.hidden = false;
    document.getElementById('id-monogram').hidden = true;
  }, { once: true });
  photo.src = 'assets/card-photo.jpg';
}

/** Switches on flipping, the first-sight swing and the barcode. */
function setupIdCard() {
  const stage = document.getElementById('card-stage');
  const card = document.getElementById('id-card');
  drawBarcode();
  useCardPhotoIfPresent();
  card.addEventListener('click', () => {
    const isFlipped = card.getAttribute('aria-pressed') === 'true';
    card.setAttribute('aria-pressed', String(!isFlipped));
  });
  onFirstSight(stage, () => stage.classList.add('has-swung'));
  if (!prefersReducedMotion && matchMedia('(pointer: fine)').matches) setupCardTilt(stage, card);
}

// ---------- Periodic table ----------

/** Fills the side panel with one skill. */
function showSkillInPanel(skill) {
  document.getElementById('panel-idle').hidden = true;
  document.getElementById('panel-detail').hidden = false;
  document.getElementById('panel-symbol').textContent = skill.symbol;
  document.getElementById('panel-name').textContent = skill.name;
  document.getElementById('panel-family').textContent = FAMILIES[skill.family].name;
  document.getElementById('panel-use').textContent = skill.use;
}

/** Builds one tile and connects it to the panel. */
function createElementTile(skill, position) {
  const tile = createElement('button', `element family-${skill.family}`);
  tile.type = 'button';
  tile.dataset.family = skill.family;
  tile.setAttribute('aria-label', `${skill.name}: ${skill.use}`);
  tile.append(
    createElement('span', 'element-number', String(position + 1).padStart(2, '0')),
    createElement('span', 'element-symbol', skill.symbol),
    createElement('span', 'element-name', skill.name),
  );
  const pick = () => {
    document.querySelectorAll('.element.is-picked').forEach((other) => other.classList.remove('is-picked'));
    tile.classList.add('is-picked');
    showSkillInPanel(skill);
  };
  ['pointerenter', 'focus', 'click'].forEach((eventName) => tile.addEventListener(eventName, pick));
  return tile;
}

/** Dims every tile outside the chosen family, or clears the dimming when no family is chosen. */
function highlightFamily(chosenFamily) {
  document.querySelectorAll('.element').forEach((tile) => {
    tile.classList.toggle('is-dimmed', Boolean(chosenFamily) && tile.dataset.family !== chosenFamily);
  });
}

/** Builds one family button. A second press on the same button clears the filter. */
function createFamilyButton(familyKey) {
  const button = createElement('button', 'family-button');
  button.type = 'button';
  button.setAttribute('aria-pressed', 'false');
  const swatch = createElement('span', 'family-swatch');
  swatch.style.background = FAMILIES[familyKey].swatch;
  button.append(swatch, FAMILIES[familyKey].name);
  button.addEventListener('click', () => {
    const turningOn = button.getAttribute('aria-pressed') !== 'true';
    document.querySelectorAll('.family-button').forEach((other) => other.setAttribute('aria-pressed', 'false'));
    button.setAttribute('aria-pressed', String(turningOn));
    highlightFamily(turningOn ? familyKey : null);
  });
  return button;
}

/** Draws the spokes of the turning star shown before any tile is picked. */
function drawStar() {
  const spokes = document.getElementById('star-spokes');
  const spokeCount = 12;
  for (let index = 0; index < spokeCount; index += 1) {
    const spoke = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    spoke.setAttribute('x', '45.5');
    spoke.setAttribute('y', '4');
    spoke.setAttribute('width', '9');
    spoke.setAttribute('height', '30');
    spoke.setAttribute('rx', '4.5');
    spoke.setAttribute('transform', `rotate(${(360 / spokeCount) * index} 50 50)`);
    spokes.append(spoke);
  }
}

/** Draws the tiles, filter buttons and star. */
function setupPeriodicTable() {
  document.getElementById('periodic-table').append(...SKILLS.map(createElementTile));
  document.getElementById('family-filters').append(...Object.keys(FAMILIES).map(createFamilyButton));
  drawStar();
}

// ---------- Project tabs ----------

/** Opens one project and closes the others. */
function openProject(projects, chosen) {
  projects.forEach((project) => {
    const isChosen = project === chosen;
    project.classList.toggle('is-open', isChosen);
    project.querySelector('.project-tab').setAttribute('aria-expanded', String(isChosen));
  });
}

/** Connects every project tab. */
function setupProjectTabs() {
  const projects = [...document.querySelectorAll('.project')];
  projects.forEach((project) => {
    project.querySelector('.project-tab').addEventListener('click', () => openProject(projects, project));
  });
}

// ---------- Timeline: the giant year follows the entry in the middle of the screen ----------

/** Marks one entry as current and swaps the giant year to match it. */
function showTimelineEntry(entries, current) {
  const bigYear = document.getElementById('big-year');
  entries.forEach((entry) => entry.classList.toggle('is-current', entry === current));
  if (bigYear.textContent === current.dataset.year) return;
  bigYear.textContent = current.dataset.year;
  bigYear.classList.remove('is-changing');
  // Reading the width forces the browser to restart the animation on the next line.
  void bigYear.offsetWidth;
  bigYear.classList.add('is-changing');
}

/** Watches the timeline entries as they pass the middle of the screen. */
function setupTimeline() {
  const entries = [...document.querySelectorAll('#timeline li')];
  entries[0].classList.add('is-current');
  const watcher = new IntersectionObserver((seen) => {
    seen.filter((item) => item.isIntersecting).forEach((item) => showTimelineEntry(entries, item.target));
  }, { rootMargin: '-45% 0px -45% 0px' });
  entries.forEach((entry) => watcher.observe(entry));
}

// ---------- Moments: scrolling down moves the strip sideways ----------

/** Makes the section tall enough to give the strip room to travel, and returns that distance. */
function measureMomentsTravel(section, track) {
  const travel = Math.max(0, track.scrollWidth - innerWidth);
  section.style.height = `${innerHeight + travel}px`;
  return travel;
}

/** Moves the strip to match how far the visitor has scrolled through the section. */
function positionMomentsTrack(section, track, travel) {
  const scrolled = Math.min(travel, Math.max(0, -section.getBoundingClientRect().top));
  track.style.transform = `translate3d(${-scrolled}px, 0, 0)`;
}

/** Connects the strip to scrolling and keeps its measurements right when the window changes size. */
function setupMoments() {
  if (prefersReducedMotion) return setupMomentsAsSwipe();
  const section = document.getElementById('moments');
  const track = document.getElementById('moments-track');
  let travel = measureMomentsTravel(section, track);
  let isQueued = false;
  const update = () => {
    isQueued = false;
    positionMomentsTrack(section, track, travel);
  };
  addEventListener('scroll', () => {
    if (isQueued) return;
    isQueued = true;
    requestAnimationFrame(update);
  }, { passive: true });
  addEventListener('resize', () => {
    travel = measureMomentsTravel(section, track);
    update();
  });
  // Late-loading fonts change the widths, so measure again once they arrive.
  document.fonts.ready.then(() => {
    travel = measureMomentsTravel(section, track);
    update();
  });
  return undefined;
}

/** Reduced-motion version: the strip is simply swiped sideways by hand. */
function setupMomentsAsSwipe() {
  const stage = document.querySelector('.moments-stage');
  stage.style.position = 'static';
  stage.style.height = 'auto';
  stage.style.overflowX = 'auto';
}

// ---------- Headings ----------

/** Lets each heading rise the first time it comes into view. */
function setupRisingHeadings() {
  document.querySelectorAll('.rising').forEach((heading) => {
    onFirstSight(heading, () => heading.classList.add('has-risen'));
  });
}

// ---------- Start everything ----------
setupSectionMenu();
setupHero();
setupIdCard();
setupPeriodicTable();
setupProjectTabs();
setupTimeline();
setupMoments();
setupRisingHeadings();
