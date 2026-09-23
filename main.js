const SVG_NS = 'http://www.w3.org/2000/svg';

document.getElementById('year').textContent = new Date().getFullYear();

for (const button of document.querySelectorAll('[data-copy]')) {
  const status = button.nextElementSibling;
  let timer;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      status.textContent = 'Kopierad';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(button.previousElementSibling);
      getSelection().removeAllRanges();
      getSelection().addRange(range);
      status.textContent = 'Markerad';
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      status.textContent = '';
    }, 2500);
  });
}

setUpRadar(document.getElementById('radar'));

function setUpRadar(radar) {
  if (!radar) return;

  const SIZE = 640;
  const C = SIZE / 2;
  const PHOTO_R = 84;
  const BANDS = [
    [84, 156],
    [156, 226],
    [226, 296],
  ];
  const OUTER_R = BANDS[BANDS.length - 1][1];
  const PERIOD = 12;
  const ERAS = ['2006–13', '2014–21', '2022–'];
  const QUADRANTS = [
    { name: 'Mobil', x: SIZE - 14, y: 26, anchor: 'end' },
    { name: 'Webb & backend', x: SIZE - 14, y: SIZE - 14, anchor: 'end' },
    { name: 'Signaler & hårdvara', x: 14, y: SIZE - 14, anchor: 'start' },
    { name: 'Metod & ledning', x: 14, y: 26, anchor: 'start' },
  ];

  // q: quadrant, clockwise from the top right. band: 0 = 2006–13, 1 = 2014–21, 2 = 2022–.
  // a and r optionally place an item inside its cell, from 0 to 1 across the quadrant and the band.
  const ITEMS = [
    { id: 'ios', label: 'iOS', q: 0, band: 0 },
    { id: 'objc', label: 'Objective-C', q: 0, band: 0, a: 0.85 },
    { id: 'swift', label: 'Swift', q: 0, band: 1 },
    { id: 'video', label: 'Strömning & DRM', q: 0, band: 1, a: 0.38 },
    { id: 'pay', label: 'Betalningar', q: 0, band: 1, r: 0.8 },
    { id: 'rn', label: 'React Native', q: 0, band: 2 },
    { id: 'android', label: 'Android', q: 0, band: 2 },
    { id: 'kotlin', label: 'Kotlin/Java', q: 0, band: 2 },
    { id: 'offline', label: 'Offline', q: 0, band: 2 },
    { id: 'push', label: 'Push', q: 0, band: 2, a: 1 },
    { id: 'python', label: 'Python', q: 1, band: 0 },
    { id: 'js', label: 'JavaScript', q: 1, band: 0 },
    { id: 'rest', label: 'REST-API:er', q: 1, band: 0 },
    { id: 'react', label: 'React', q: 1, band: 1 },
    { id: 'ts', label: 'TypeScript', q: 1, band: 1 },
    { id: 'go', label: 'Go', q: 1, band: 1 },
    { id: 'csharp', label: 'C#/.NET', q: 1, band: 1 },
    { id: 'firebase', label: 'Firebase', q: 1, band: 2, a: 0.4 },
    { id: 'auth', label: 'Inloggning', q: 1, band: 2 },
    { id: 'eye', label: 'Ögonrörelsedata', q: 2, band: 0, r: 0.8 },
    { id: 'cpp', label: 'C++', q: 2, band: 0 },
    { id: 'dsp', label: 'Signalbehandling', q: 2, band: 0, r: 0.3 },
    { id: 'ppc', label: 'PowerPC', q: 2, band: 0, a: 0.75 },
    { id: 'ble', label: 'Bluetooth', q: 2, band: 0, a: 0.95 },
    { id: 'test', label: 'Testautomation', q: 3, band: 0 },
    { id: 'hg', label: 'Mercurial', q: 3, band: 0 },
    { id: 'lead', label: 'Tech lead', q: 3, band: 1, a: 0.5 },
    { id: 'ci', label: 'CI/CD', q: 3, band: 1, a: 0.85 },
    { id: 'perf', label: 'Prestanda', q: 3, band: 2, r: 0.3 },
    { id: 'claude', label: 'Claude', q: 3, band: 2 },
    { id: 'codex', label: 'Codex', q: 3, band: 2 },
  ];

  const svg = (name, attrs, parent) => {
    const node = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    parent.append(node);
    return node;
  };
  const round = (n) => Math.round(n * 10) / 10;
  const polar = (deg, r) => {
    const rad = (deg * Math.PI) / 180;
    return [round(C + r * Math.sin(rad)), round(C - r * Math.cos(rad))];
  };

  const grid = radar.querySelector('.radar-grid');
  svg('circle', { class: 'scope', cx: C, cy: C, r: OUTER_R }, grid);
  for (const [, outer] of BANDS.slice(0, -1)) svg('circle', { class: 'ring', cx: C, cy: C, r: outer }, grid);
  for (let deg = 0; deg < 360; deg += 10) {
    const [x1, y1] = polar(deg, OUTER_R - (deg % 30 ? 6 : 12));
    const [x2, y2] = polar(deg, OUTER_R);
    svg('line', { class: 'tick', x1, y1, x2, y2 }, grid);
  }
  for (let deg = 0; deg < 360; deg += 90) {
    const [x1, y1] = polar(deg, PHOTO_R);
    const [x2, y2] = polar(deg, OUTER_R);
    svg('line', { class: 'axis', x1, y1, x2, y2 }, grid);
  }
  svg('circle', { class: 'own-ring', cx: C, cy: C, r: PHOTO_R }, grid);
  BANDS.forEach(([inner, outer], i) => {
    svg('text', { class: 'era', x: C, y: C - (inner + outer) / 2 }, grid).textContent = ERAS[i];
  });
  for (const { name, x, y, anchor } of QUADRANTS) {
    svg('text', { class: 'quadrant', x, y, 'text-anchor': anchor }, grid).textContent = name.toUpperCase();
  }

  const cells = new Map();
  for (const item of ITEMS) {
    const key = `${item.q}:${item.band}`;
    cells.set(key, [...(cells.get(key) ?? []), item]);
  }

  const layer = radar.querySelector('.radar-blips');
  const blips = [];
  for (const cell of cells.values()) {
    cell.forEach((item, i) => {
      const [inner, outer] = BANDS[item.band];
      const deg = item.q * 90 + 8 + (item.a ?? (i + 0.5) / cell.length) * 74;
      const [x, y] = polar(deg, inner + (0.2 + (item.r ?? 0.5) * 0.6) * (outer - inner));
      // The sweep reaches this angle after --d, so the blip lights up exactly as it passes.
      const g = svg('g', { class: 'blip', style: `--d: ${((deg / 360) * PERIOD).toFixed(3)}s` }, layer);
      svg('circle', { class: 'blip-hit', cx: x, cy: y, r: 16 }, g);
      const core = svg('g', { class: 'blip-core' }, g);
      svg('circle', { class: 'blip-halo', cx: x, cy: y, r: 5.5 }, core);
      svg('circle', { class: 'blip-dot', cx: x, cy: y, r: 5.5 }, core);
      const sweepText = svg('text', { class: 'tag tag-sweep', y }, svg('g', { class: 'tag-sweep-wrap' }, g));
      const focusText = svg('text', { class: 'tag tag-focus', y }, g);
      sweepText.textContent = focusText.textContent = item.label;
      blips.push({ ...item, x, g, texts: [sweepText, focusText] });
    });
  }

  const placeLabel = (blip, right) => {
    for (const text of blip.texts) {
      text.setAttribute('x', round(blip.x + (right ? 11 : -11)));
      text.setAttribute('text-anchor', right ? 'start' : 'end');
    }
  };
  const fitLabels = () => {
    for (const blip of blips) {
      const right = blip.x >= C;
      placeLabel(blip, right);
      const box = blip.texts[1].getBBox();
      if (box.x < 4 || box.x + box.width > SIZE - 4) placeLabel(blip, !right);
    }
  };
  // Keep labels near 12.5 px on screen whatever size the radar is drawn at.
  new ResizeObserver(([entry]) => {
    const size = Math.min(26, Math.max(15, (12.5 * SIZE) / entry.contentRect.width));
    radar.style.setProperty('--lbl', size.toFixed(2));
    fitLabels();
  }).observe(radar);
  document.fonts?.ready.then(fitLabels);

  const kicker = document.getElementById('radar-kicker');
  const title = document.getElementById('radar-title');
  const toggle = document.getElementById('radar-toggle');
  const jobs = [...document.querySelectorAll('.job')];
  const scrollTargets = [...document.querySelectorAll('.job, .principle')];
  const IDLE = { kicker: 'Radarn', title: 'Tjugo år, ring för ring' };
  const STILL = { kicker: 'I dag', title: 'Det jag jobbar med just nu', ids: jobs[0]?.dataset.radar.split(' ') ?? [] };
  let live = false;
  let hovered = null;
  let current = null;

  const joinSv = (list) => (list.length > 1 ? `${list.slice(0, -1).join(', ')} och ${list.at(-1)}` : (list[0] ?? ''));
  const describe = (el) => ({
    el,
    ids: el.dataset.radar.split(' '),
    kicker: el.closest('[data-kicker]').dataset.kicker,
    title: el.dataset.name ? `${el.dataset.name} · ${el.dataset.years}` : el.querySelector('h3').textContent,
  });
  const describeBlip = (blip) => ({
    ids: [blip.id],
    kicker: blip.label,
    title: joinSv(
      jobs
        .filter((job) => job.dataset.radar.split(' ').includes(blip.id))
        .reverse()
        .map((job) => job.dataset.name),
    ),
  });

  const render = () => {
    const focus = hovered ?? current;
    const state = focus ?? (live ? IDLE : STILL);
    radar.dataset.mode = focus ? 'focus' : live ? 'sweep' : 'still';
    const ids = state.ids ?? [];
    for (const blip of blips) blip.g.classList.toggle('is-on', ids.includes(blip.id));
    kicker.textContent = state.kicker;
    title.textContent = state.title;
    for (const el of scrollTargets) el.classList.toggle('is-current', el === current?.el);
  };

  const hover = (el, describeEl) => {
    el.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse') return;
      hovered = describeEl();
      render();
    });
    el.addEventListener('pointerleave', (event) => {
      if (event.pointerType !== 'mouse') return;
      hovered = null;
      render();
    });
  };
  for (const blip of blips) hover(blip.g, () => describeBlip(blip));
  for (const skill of document.querySelectorAll('.skill[data-radar]')) hover(skill, () => describe(skill));

  // Touch has no hover, so a tap toggles a blip instead.
  let pointerType = 'mouse';
  radar.addEventListener('pointerdown', (event) => {
    pointerType = event.pointerType;
  });
  radar.addEventListener('click', (event) => {
    if (pointerType === 'mouse') return;
    const g = event.target.closest('.blip');
    const blip = g && blips.find((b) => b.g === g);
    hovered = blip && hovered?.ids[0] !== blip.id ? describeBlip(blip) : null;
    render();
  });

  // Only follow the text while the radar sits beside it.
  const wide = matchMedia('(min-width: 1180px)');
  let frame = 0;
  const followText = () => {
    frame = 0;
    let found = null;
    if (wide.matches) {
      const line = innerHeight * 0.42;
      for (const el of scrollTargets) {
        const { top, bottom } = el.getBoundingClientRect();
        if (top <= line && bottom + 48 >= line) found = el;
      }
    }
    if (found !== (current?.el ?? null)) {
      current = found && describe(found);
      render();
    }
  };
  addEventListener(
    'scroll',
    () => {
      frame ||= requestAnimationFrame(followText);
    },
    { passive: true },
  );
  wide.addEventListener('change', followText);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const setLive = (on) => {
    live = on;
    radar.classList.toggle('is-live', on);
    toggle.textContent = on ? 'Pausa radarn' : 'Starta radarn';
    render();
  };
  toggle.addEventListener('click', () => setLive(!live));
  reducedMotion.addEventListener('change', () => setLive(!reducedMotion.matches));
  new IntersectionObserver(([entry]) => radar.classList.toggle('is-offscreen', !entry.isIntersecting)).observe(radar);

  setLive(!reducedMotion.matches);
  followText();
}
