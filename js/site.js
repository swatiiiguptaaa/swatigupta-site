// Everything below the hero: header state, hero scroll fade, scroll reveals,
// the NYC route map (draws as you read the resume), the highlights folder
// (opens when it scrolls in) and its dossier switcher, the results postcard.
(() => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // header turns solid once you leave the hero; hero title drifts up and fades
  const top = $('.top'), title = $('.hero .title'), portrait = $('.hero .portrait');
  let ticking = false;
  function onScroll() {
    ticking = false;
    const y = scrollY, h = innerHeight;
    top?.classList.toggle('solid', y > h * .6);
    if (calm || y > h * 1.2) return;
    const p = Math.min(1, y / h);
    if (title) { title.style.transform = `translateY(${(-p * 80).toFixed(1)}px)`; title.style.opacity = (1 - p * 1.1).toFixed(3); }
    if (portrait) portrait.style.transform = `translateY(${(p * 60).toFixed(1)}px) scale(${(1 - p * .05).toFixed(3)})`;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // split headings into words so they can rise one by one
  $$('.reveal-words').forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(' ');
  });

  const seen = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('seen'); seen.unobserve(e.target); }
  }, { threshold: .25 });
  $$('.reveal, .reveal-words, .stack, .route').forEach(el => calm ? el.classList.add('seen') : seen.observe(el));

  // ---------- NYC route map ----------
  const outline = $('.island-line');
  if (outline) outline.style.setProperty('--len', outline.getTotalLength ? Math.ceil(outline.getTotalLength()) : 2000);

  const trail = $('.trail');
  const stops = $$('.stops li');
  const pins = Object.fromEntries($$('.pin').map(p => [p.dataset.pin, p]));
  const atl = $('.atl');
  let marks = [];
  if (trail) {
    const L = trail.getTotalLength();
    trail.style.setProperty('--tl', L);
    trail.style.setProperty('--to', L);
    // for each stop, how far along the trail its pin sits (searching forward, so repeat visits line up)
    const at = pin => { const m = pin.getAttribute('transform').match(/translate\(([\d.]+)[ ,]+([\d.]+)\)/); return [+m[1], +m[2]]; };
    let from = 0;
    marks = stops.map(li => {
      const pin = pins[li.dataset.pin];
      if (!pin) return 0;
      const [px, py] = at(pin);
      let best = from, bd = Infinity;
      for (let d = from; d <= L; d += 2) {
        const pt = trail.getPointAtLength(d), dist = Math.hypot(pt.x - px, pt.y - py);
        if (dist < bd) { bd = dist; best = d; }
        if (dist > bd + 40) break; // passed it
      }
      from = best;
      return best;
    });
  }
  function activate(i) {
    stops.forEach((li, j) => li.classList.toggle('on', j === i));
    Object.values(pins).forEach(p => p.classList.remove('on'));
    const key = stops[i]?.dataset.pin;
    pins[key]?.classList.add('on');
    atl?.classList.toggle('on', key === 'atl');
    if (trail) {
      const L = +trail.style.getPropertyValue('--tl');
      trail.style.transition = calm ? 'none' : 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)';
      trail.style.setProperty('--to', (L - marks[i]).toFixed(1));
    }
  }
  if (stops.length) {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) activate(stops.indexOf(e.target));
    }, { rootMargin: '-45% 0px -45% 0px' });
    stops.forEach(li => io.observe(li));
  }

  // ---------- highlights folder ----------
  const folder = $('#bigfolder');
  if (folder) {
    const open = () => folder.classList.add('open');
    $('.bf-cover', folder)?.addEventListener('click', open);
    if (calm) open();
    else new IntersectionObserver(([e], o) => { if (e.isIntersecting) { setTimeout(open, 250); o.disconnect(); } }, { threshold: .12 }).observe(folder);
  }
  $$('.dossiers').forEach(group => {
    const chips = $$('.chip', group), docs = $$('.dossier', group);
    chips.forEach(c => c.addEventListener('click', () => {
      chips.forEach(x => x.setAttribute('aria-pressed', x === c));
      docs.forEach(d => { d.hidden = d.dataset.id !== c.dataset.show; });
    }));
  });

  // ---------- results postcard ----------
  const card = $('.postcard');
  card?.addEventListener('click', () => card.classList.toggle('flipped'));
  const svg = $('.dots');
  if (svg) {
    const ns = 'http://www.w3.org/2000/svg';
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const cols = 18, rows = 4, filled = 49; // placeholder until numbers are approved
    for (let i = 0; i < cols * rows; i++) {
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', (10 + (i % cols) * 11.8 + (rnd() - .5) * 2.4).toFixed(1));
      c.setAttribute('cy', (14 + Math.floor(i / cols) * 19 + (rnd() - .5) * 2.4).toFixed(1));
      c.setAttribute('r', (3.4 + rnd() * .9).toFixed(1));
      const on = i < filled;
      c.setAttribute('fill', on ? (i % 7 === 3 ? '#c8243a' : '#1a1918') : 'none');
      c.setAttribute('stroke', '#1a1918');
      c.setAttribute('stroke-width', on ? '0' : '1');
      c.setAttribute('opacity', on ? (.78 + rnd() * .22).toFixed(2) : '.35');
      svg.appendChild(c);
    }
  }
})();
