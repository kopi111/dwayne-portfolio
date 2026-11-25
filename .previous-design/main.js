// Behaviour for the portfolio page: talking hero, flipping ID card,
// periodic table of skills, and the sideways achievements strip.

// True when the visitor's device asks for reduced motion; every animation checks this.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Content for the hero captions ----------
const INTRO_LINES = [
  "Hi, I'm Dwayne.",
  'I build websites, web apps and mobile apps.',
  'This page is my resume, only better.',
  'Scroll down and meet my work.',
];
const CAPTION_HOLD_MS = 3400;

// ---------- Content for the periodic table ----------
// Each family fills one block of the table, the way real element groups share columns.
const FAMILY_NAMES = {
  languages: 'Languages',
  frameworks: 'Frameworks and AI',
  data: 'Data',
  infrastructure: 'Infrastructure',
  security: 'Security and networks',
};

// column and row place an element on the 14-by-4 grid, leaving the classic gap at the top.
const SKILLS = [
  { symbol: 'Cs', name: 'C#', family: 'languages', column: 1, row: 1, use: 'Web APIs, admin portals and the Aitken Shipping site.' },
  { symbol: 'Dt', name: 'Dart', family: 'languages', column: 1, row: 2, use: 'Every Flutter app, including Money Path.' },
  { symbol: 'Ph', name: 'PHP', family: 'languages', column: 1, row: 3, use: 'A parcel site, and hands-on labs for patching real PHP vulnerabilities.' },
  { symbol: 'Py', name: 'Python', family: 'languages', column: 1, row: 4, use: 'Machine learning, data tools and Flask services.' },
  { symbol: 'Js', name: 'JavaScript', family: 'languages', column: 2, row: 2, use: 'Strategy Desk and the 3D Jelly Water site, with no build step.' },
  { symbol: 'Sq', name: 'SQL', family: 'languages', column: 2, row: 3, use: 'Schemas, reports and repeatable migration scripts.' },
  { symbol: 'Hc', name: 'HTML and CSS', family: 'languages', column: 2, row: 4, use: 'The Summer Splash site and this page.' },
  { symbol: 'Ne', name: '.NET', family: 'frameworks', column: 3, row: 4, use: 'My main platform for APIs and business systems.' },
  { symbol: 'Mv', name: 'ASP.NET MVC', family: 'frameworks', column: 4, row: 4, use: 'Server-rendered sites such as Aitken Shipping.' },
  { symbol: 'Bz', name: 'Blazor', family: 'frameworks', column: 5, row: 4, use: 'Interactive C# web apps, including a car rental system.' },
  { symbol: 'Fl', name: 'Flutter', family: 'frameworks', column: 6, row: 4, use: 'Android apps, including Money Path.' },
  { symbol: 'Fk', name: 'Flask', family: 'frameworks', column: 7, row: 4, use: 'Small Python services, such as a face-check tool.' },
  { symbol: 'St', name: 'Streamlit', family: 'frameworks', column: 8, row: 4, use: 'SmartBudget JA, a budgeting project in Python.' },
  { symbol: 'Df', name: 'DeepFace', family: 'frameworks', column: 9, row: 4, use: 'Matching a selfie to an ID photo, with a liveness check.' },
  { symbol: 'Ms', name: 'SQL Server', family: 'data', column: 10, row: 2, use: 'The database behind my .NET business systems.' },
  { symbol: 'Mb', name: 'MariaDB', family: 'data', column: 10, row: 3, use: 'Dashboards and read APIs on MariaDB 11.' },
  { symbol: 'My', name: 'MySQL', family: 'data', column: 10, row: 4, use: 'PHP sites and a Blazor incident tracker.' },
  { symbol: 'Fb', name: 'Firebase', family: 'data', column: 11, row: 2, use: 'Sign-in and live data for a Flutter delivery app.' },
  { symbol: 'Sl', name: 'SQLite', family: 'data', column: 11, row: 3, use: 'Encrypted on-device storage in Money Path.' },
  { symbol: 'Ka', name: 'Kafka', family: 'data', column: 11, row: 4, use: 'A live event-streaming demo with Python and ELK.' },
  { symbol: 'Dk', name: 'Docker', family: 'infrastructure', column: 12, row: 2, use: 'Local databases and disposable security labs.' },
  { symbol: 'Ii', name: 'IIS', family: 'infrastructure', column: 12, row: 3, use: 'Packaging and hosting .NET apps on Windows Server.' },
  { symbol: 'Lx', name: 'Linux', family: 'infrastructure', column: 12, row: 4, use: 'My everyday development machine.' },
  { symbol: 'Px', name: 'Proxmox', family: 'infrastructure', column: 13, row: 2, use: 'Virtual machines in my own lab.' },
  { symbol: 'Gt', name: 'Git', family: 'infrastructure', column: 13, row: 3, use: '106 projects kept on GitHub.' },
  { symbol: 'El', name: 'ELK Stack', family: 'infrastructure', column: 13, row: 4, use: 'Searching and charting logs from a streaming demo.' },
  { symbol: 'Cn', name: 'CCNA', family: 'security', column: 14, row: 1, use: 'CCNAv7 SRWE, CCNAv7 ENSA and CCNA Security.' },
  { symbol: 'Ow', name: 'OWASP', family: 'security', column: 14, row: 2, use: 'The checklist behind my code and vulnerability reviews.' },
  { symbol: 'Jw', name: 'JWT', family: 'security', column: 14, row: 3, use: 'Token sign-in for the APIs I build.' },
  { symbol: 'Cc', name: 'CCTV', family: 'security', column: 14, row: 4, use: 'Fundamentals of CCTV certificate.' },
];

// ---------- Talking hero ----------

/** Shows one caption line, one word at a time, so it reads like speech. */
function showCaption(captionElement, line) {
  captionElement.textContent = '';
  line.split(' ').forEach((word, position) => {
    const wordElement = document.createElement('span');
    wordElement.textContent = word + ' ';
    wordElement.style.animationDelay = `${position * 110}ms`;
    captionElement.append(wordElement);
  });
}

/** Swaps the drawn figure for the real clip, but only once the clip is known to exist. */
function useHeroVideoIfPresent(video, startPlaying) {
  video.addEventListener('loadedmetadata', () => {
    video.hidden = false;
    document.querySelector('.figure-art').style.display = 'none';
    if (startPlaying) video.play().catch(() => {});
  });
}

/** Runs the captions and the pause button that controls them and the video together. */
function startHeroIntro() {
  const caption = document.getElementById('hero-caption');
  const toggle = document.getElementById('intro-toggle');
  const icon = document.getElementById('intro-toggle-icon');
  const video = document.getElementById('hero-video');
  const PAUSE_ICON = 'M5 3h4v14H5zM11 3h4v14h-4z';
  const PLAY_ICON = 'M6 3l11 7-11 7z';
  let lineIndex = 0;
  let timer = null;

  // Moves to the next line and wraps round to the first after the last one.
  const advance = () => {
    lineIndex = (lineIndex + 1) % INTRO_LINES.length;
    showCaption(caption, INTRO_LINES[lineIndex]);
  };

  // Sets everything to playing or paused and keeps the button's icon and label truthful.
  const setPlaying = (playing) => {
    clearInterval(timer);
    if (playing) {
      timer = setInterval(advance, CAPTION_HOLD_MS);
      if (!video.hidden) video.play().catch(() => {});
    } else {
      video.pause();
    }
    icon.setAttribute('d', playing ? PAUSE_ICON : PLAY_ICON);
    toggle.setAttribute('aria-label', playing ? 'Pause introduction' : 'Play introduction');
  };

  toggle.addEventListener('click', () => setPlaying(toggle.getAttribute('aria-label').startsWith('Play')));
  useHeroVideoIfPresent(video, !prefersReducedMotion);
  showCaption(caption, INTRO_LINES[0]);
  setPlaying(!prefersReducedMotion);
}

// ---------- ID card ----------

/** Flips the card to the back and front once, the first time it scrolls into view. */
function demonstrateCardFlipOnce(card) {
  const FLIP_BACK_AFTER_MS = 1800;
  const watcher = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    watcher.disconnect();
    card.setAttribute('aria-pressed', 'true');
    setTimeout(() => card.setAttribute('aria-pressed', 'false'), FLIP_BACK_AFTER_MS);
  }, { threshold: 0.7 });
  watcher.observe(card);
}

/** Lets the visitor flip the ID card by click, tap or keyboard. */
function startIdCard() {
  const card = document.getElementById('id-card');
  card.addEventListener('click', () => {
    const isFlipped = card.getAttribute('aria-pressed') === 'true';
    card.setAttribute('aria-pressed', String(!isFlipped));
  });
  if (!prefersReducedMotion) demonstrateCardFlipOnce(card);
}

// ---------- Periodic table ----------

/** Builds one element tile as a button placed on the table grid. */
function createElementTile(skill, atomicNumber) {
  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = `element family-${skill.family}`;
  tile.dataset.family = skill.family;
  tile.style.gridColumn = skill.column;
  tile.style.gridRow = skill.row;
  tile.setAttribute('aria-pressed', 'false');

  // Three small labels: the number, the big symbol and the full name.
  [['element-number', atomicNumber], ['element-symbol', skill.symbol], ['element-name', skill.name]].forEach(([className, text]) => {
    const label = document.createElement('span');
    label.className = className;
    label.textContent = text;
    tile.append(label);
  });
  return tile;
}

/** Writes the chosen skill into the panel in the table's empty gap. */
function showElementDetail(skill) {
  const detail = document.getElementById('element-detail');
  detail.replaceChildren();

  const symbol = document.createElement('div');
  symbol.className = 'detail-symbol';
  symbol.textContent = skill.symbol;

  const text = document.createElement('div');
  [['detail-name', skill.name], ['detail-family', FAMILY_NAMES[skill.family]], ['detail-use', skill.use]].forEach(([className, content]) => {
    const line = document.createElement('p');
    line.className = className;
    line.textContent = content;
    text.append(line);
  });
  detail.append(symbol, text);
}

/** Marks one tile as chosen and updates the panel. */
function selectElement(tiles, chosenTile, skill) {
  tiles.forEach((tile) => tile.setAttribute('aria-pressed', String(tile === chosenTile)));
  showElementDetail(skill);
}

/** Dims every tile outside the chosen family, or clears the dimming when family is null. */
function highlightFamily(tiles, family) {
  tiles.forEach((tile) => tile.classList.toggle('is-dimmed', family !== null && tile.dataset.family !== family));
}

/** Builds the legend, where each button highlights its family and a second press clears it. */
function buildFamilyLegend(tiles) {
  const legend = document.getElementById('family-legend');
  Object.entries(FAMILY_NAMES).forEach(([family, name]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'family-button';
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = `<span class="family-swatch family-${family}"></span>`;
    button.append(name);
    button.addEventListener('click', () => {
      const turningOn = button.getAttribute('aria-pressed') === 'false';
      legend.querySelectorAll('button').forEach((other) => other.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', String(turningOn));
      highlightFamily(tiles, turningOn ? family : null);
    });
    legend.append(button);
  });
}

/** Draws the whole table and opens it on the first skill so the panel is never empty. */
function startPeriodicTable() {
  const table = document.getElementById('periodic-table');
  const tiles = SKILLS.map((skill, index) => createElementTile(skill, index + 1));
  tiles.forEach((tile, index) => {
    const choose = () => selectElement(tiles, tile, SKILLS[index]);
    tile.addEventListener('click', choose);
    tile.addEventListener('mouseenter', choose);
    tile.addEventListener('focus', choose);
    table.append(tile);
  });
  buildFamilyLegend(tiles);
  selectElement(tiles, tiles[0], SKILLS[0]);
}

// ---------- Sideways achievements ----------

/** Pins the black stage and turns vertical scrolling into sideways movement of the strip. */
function startSidewaysAchievements() {
  const section = document.getElementById('achievements');
  const stage = section.querySelector('.achievements-stage');
  const track = document.getElementById('achievements-track');

  // Reduced-motion visitors get a normal strip they can swipe or scroll themselves.
  if (prefersReducedMotion) {
    stage.classList.add('is-free');
    return;
  }

  // How far the strip must travel so its last item stops one page margin short of the screen edge.
  const travelDistance = () => {
    const pageMargin = parseFloat(getComputedStyle(stage).paddingLeft);
    return Math.max(0, track.scrollWidth - stage.clientWidth + pageMargin);
  };

  // Makes the section tall enough that scrolling through it uses up exactly that travel.
  const resizeSection = () => {
    section.style.height = `${window.innerHeight + travelDistance()}px`;
    moveTrack();
  };

  // Converts how far we are through the section into a sideways position for the strip.
  const moveTrack = () => {
    const scrolledIn = Math.min(Math.max(-section.getBoundingClientRect().top, 0), travelDistance());
    track.style.transform = `translate3d(${-scrolledIn}px, 0, 0)`;
  };

  window.addEventListener('scroll', moveTrack, { passive: true });
  window.addEventListener('resize', resizeSection);
  document.fonts.ready.then(resizeSection);
  resizeSection();
}

// ---------- Start everything ----------
startHeroIntro();
startIdCard();
startPeriodicTable();
startSidewaysAchievements();
