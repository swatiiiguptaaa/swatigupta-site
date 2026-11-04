// The desk: objects drop onto the page (falling along the z axis toward the
// viewer's desk), then can be picked up, thrown and hovered. One rAF loop
// drives position, height (z), rotation, parallax and shadow for every object.
(() => {
  const desk = document.getElementById('desk');
  if (!desk) return;
  const hint = desk.querySelector('.hint');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = () => innerWidth <= 760;

  let W = 0, H = 0;
  let mx = 0, my = 0, tmx = 0, tmy = 0; // smoothed / target pointer, -1..1
  let topZ = 10;
  let started = performance.now();
  let movedOnce = false;

  const items = [...desk.querySelectorAll('.obj')].map((el, i) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = el.dataset.label || '';
    el.appendChild(tag);
    el.tabIndex = 0;
    const pair = s => s.split(',').map(Number);
    return {
      el, d: pair(el.dataset.d), m: pair(el.dataset.m),
      rest: +el.dataset.r || 0, depth: +el.dataset.z || .7,
      x: 0, y: 0, vx: 0, vy: 0, z: 0, vz: 0, r: 0,
      lift: 0,            // target height while held
      held: false, placed: false, landed: calm,
      delay: calm ? 0 : 450 + i * 110,
      w: 0, h: 0,
    };
  });

  function measure() {
    W = desk.clientWidth; H = desk.clientHeight;
    for (const o of items) {
      o.w = o.el.offsetWidth; o.h = o.el.offsetHeight;
      const [px, py] = phone() ? o.m : o.d;
      o.tx = px / 100 * W; o.ty = py / 100 * H;
      if (!o.placed) { o.x = o.tx; o.y = o.ty; }
    }
  }

  function drop() {
    for (const o of items) {
      o.r = o.rest + (calm ? 0 : (Math.random() - .5) * 50);
      o.z = calm ? 0 : 1.3 + Math.random() * .6;
      o.x = o.tx + (calm ? 0 : (Math.random() - .5) * 60);
      o.y = o.ty + (calm ? 0 : -40 - Math.random() * 40);
      o.vz = 0;
    }
  }

  // ---------- dragging ----------
  let drag = null;
  function down(e, o) {
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    o.el.setPointerCapture(e.pointerId);
    o.held = true; o.placed = true; o.landed = true; o.lift = .28;
    o.el.classList.add('held', 'show');
    o.el.style.zIndex = ++topZ;
    drag = { o, id: e.pointerId, ox: e.clientX - o.x, oy: e.clientY - o.y, lx: e.clientX, ly: e.clientY, lt: performance.now(), dist: 0 };
    o.vx = o.vy = 0;
  }
  function move(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const o = drag.o, now = performance.now(), dt = Math.max(1, now - drag.lt) / 1000;
    const nx = e.clientX - drag.ox, ny = e.clientY - drag.oy;
    // blend velocity so a flick at release carries through
    o.vx = o.vx * .6 + ((e.clientX - drag.lx) / dt) * .4;
    o.vy = o.vy * .6 + ((e.clientY - drag.ly) / dt) * .4;
    drag.dist += Math.abs(e.clientX - drag.lx) + Math.abs(e.clientY - drag.ly);
    o.x = nx; o.y = ny;
    drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = now;
    if (!movedOnce && drag.dist > 20) { movedOnce = true; hint?.classList.remove('on'); }
  }
  function up(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const o = drag.o;
    o.held = false; o.lift = 0;
    o.el.classList.remove('held');
    const tap = drag.dist < 6;
    // a tap keeps the label open (touch has no hover); a throw hides it
    if (!tap) o.el.classList.remove('show');
    if (tap) { o.vx = o.vy = 0; }
    const cap = 2600;
    o.vx = Math.max(-cap, Math.min(cap, o.vx));
    o.vy = Math.max(-cap, Math.min(cap, o.vy));
    drag = null;
  }

  for (const o of items) {
    o.el.addEventListener('pointerdown', e => down(e, o));
    o.el.addEventListener('pointermove', e => {
      move(e);
      if (o.held || e.pointerType !== 'mouse') return;
      // tilt toward the cursor while hovering
      const b = o.el.getBoundingClientRect();
      const fx = (e.clientX - b.left) / b.width - .5, fy = (e.clientY - b.top) / b.height - .5;
      o.el.style.setProperty('--ty', (fx * 18).toFixed(1) + 'deg');
      o.el.style.setProperty('--tx', (-fy * 18).toFixed(1) + 'deg');
    });
    o.el.addEventListener('pointerup', up);
    o.el.addEventListener('pointercancel', up);
    o.el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') o.el.classList.add('show'); });
    o.el.addEventListener('pointerleave', e => {
      if (e.pointerType === 'mouse' && !o.held) o.el.classList.remove('show');
      o.el.style.setProperty('--tx', '0deg'); o.el.style.setProperty('--ty', '0deg');
    });
    o.el.addEventListener('focus', () => o.el.classList.add('show'));
    o.el.addEventListener('blur', () => o.el.classList.remove('show'));
    // keyboard: arrow keys nudge the focused object
    o.el.addEventListener('keydown', e => {
      const step = e.shiftKey ? 40 : 12, k = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (!k) return;
      e.preventDefault(); o.placed = true; o.x += k[0]; o.y += k[1];
    });
  }
  // tapping empty desk closes any open label
  desk.addEventListener('pointerdown', e => {
    if (!e.target.closest('.obj')) items.forEach(o => o.el.classList.remove('show'));
  });

  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    tmx = e.clientX / innerWidth * 2 - 1; tmy = e.clientY / innerHeight * 2 - 1;
  }, { passive: true });

  // ---------- loop ----------
  let last = performance.now(), visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) { last = performance.now(); requestAnimationFrame(tick); } }).observe(desk);

  function tick(now) {
    if (!visible) return;
    const dt = Math.min(.033, (now - last) / 1000); last = now;
    const k = 1 - Math.pow(.001, dt); // frame-rate independent easing
    if (!calm) { mx += (tmx - mx) * k * .6; my += (tmy - my) * k * .6; }

    for (const o of items) {
      if (now - started < o.delay) continue;
      if (!o.el.classList.contains('in')) o.el.classList.add('in');

      if (!o.landed) {
        // fall toward the desk along z, bounce once or twice, settle
        o.vz -= 7.5 * dt;
        o.z += o.vz * dt;
        if (o.z <= 0) { o.z = 0; o.vz = -o.vz * .32; if (o.vz < .25) { o.vz = 0; o.landed = true; } }
        o.x += (o.tx - o.x) * k * .5;
        o.y += (o.ty - o.y) * k * .5;
        o.r += (o.rest - o.r) * k * .35;
      } else if (o.held) {
        o.z += (o.lift - o.z) * k * 1.2;
        o.r += ((o.rest + Math.max(-18, Math.min(18, o.vx * .012))) - o.r) * k * .5;
      } else {
        // thrown: slide with friction, bounce off the desk edges, drop back to z=0
        o.x += o.vx * dt; o.y += o.vy * dt;
        const f = Math.pow(.025, dt);
        o.vx *= f; o.vy *= f;
        const hw = o.w / 2, hh = o.h / 2;
        if (o.x < hw * .3) { o.x = hw * .3; o.vx = Math.abs(o.vx) * .5; }
        if (o.x > W - hw * .3) { o.x = W - hw * .3; o.vx = -Math.abs(o.vx) * .5; }
        if (o.y < hh * .3) { o.y = hh * .3; o.vy = Math.abs(o.vy) * .5; }
        if (o.y > H - hh * .3) { o.y = H - hh * .3; o.vy = -Math.abs(o.vy) * .5; }
        if (o.z > 0 || o.vz) { o.vz -= 7.5 * dt; o.z += o.vz * dt; if (o.z <= 0) { o.z = 0; o.vz = o.vz < -.4 ? -o.vz * .3 : 0; } }
        o.r += o.vx * .004 * dt * 60 * .1;
        if (!o.placed) { o.x += (o.tx - o.x) * k * .3; o.y += (o.ty - o.y) * k * .3; }
      }

      const px = calm ? 0 : -mx * o.depth * 16, py = calm ? 0 : -my * o.depth * 12;
      const s = 1 + o.z * .55;
      o.el.style.transform = `translate3d(${(o.x - o.w / 2 + px).toFixed(1)}px,${(o.y - o.h / 2 + py).toFixed(1)}px,0) rotate(${o.r.toFixed(2)}deg) scale(${s.toFixed(3)})`;
      // light from top-left: the higher the object, the longer, softer and fainter the shadow
      const st = o.el.style;
      st.setProperty('--sx', (5 + o.z * 34 + mx * 4).toFixed(1) + 'px');
      st.setProperty('--sy', (9 + o.z * 52 + my * 3).toFixed(1) + 'px');
      st.setProperty('--sb', (6 + o.z * 34).toFixed(1) + 'px');
      st.setProperty('--so', Math.max(.18, .5 - o.z * .22).toFixed(2));
    }
    requestAnimationFrame(tick);
  }

  function init() {
    measure(); drop();
    started = performance.now(); last = started;
    requestAnimationFrame(tick);
    setTimeout(() => { if (!movedOnce) hint?.classList.add('on'); }, calm ? 0 : 2600);
  }
  addEventListener('resize', measure);
  // wait for fonts so text inside the SVGs measures correctly
  (document.fonts?.ready || Promise.resolve()).then(init);
})();
