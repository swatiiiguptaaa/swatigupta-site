// The files: folder tabs switch panels and recolour the folder; header links
// open a tab; the postcard flips; its dot chart is drawn like ink, by hand.
(() => {
  const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
  const folder = document.getElementById('folder');
  if (!tabs.length || !folder) return;

  function open(name, focus) {
    const tab = tabs.find(t => t.dataset.tab === name);
    if (!tab) return;
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    }
    const cs = getComputedStyle(tab);
    folder.style.setProperty('--c', cs.getPropertyValue('--c'));
    folder.style.setProperty('--t', cs.getPropertyValue('--t') || '');
    if (!cs.getPropertyValue('--t')) folder.style.removeProperty('--t');
    if (focus) tab.focus();
  }

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => open(t.dataset.tab));
    t.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      open(tabs[(i + d + tabs.length) % tabs.length].dataset.tab, true);
    });
  });
  document.querySelectorAll('[data-open]').forEach(a => a.addEventListener('click', () => open(a.dataset.open)));
  open('work');

  // postcard
  const card = document.querySelector('.postcard');
  card?.addEventListener('click', () => card.classList.toggle('flipped'));

  // hand-drawn dot field (placeholder count until real numbers are approved)
  const svg = document.querySelector('.dots');
  if (svg) {
    const ns = 'http://www.w3.org/2000/svg';
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const cols = 18, rows = 4, filled = 49;
    for (let i = 0; i < cols * rows; i++) {
      const cx = 10 + (i % cols) * 11.8 + (rnd() - .5) * 2.4;
      const cy = 14 + Math.floor(i / cols) * 19 + (rnd() - .5) * 2.4;
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', cx.toFixed(1));
      c.setAttribute('cy', cy.toFixed(1));
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
