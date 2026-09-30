(() => {
  const cfg = document.currentScript;
  const trigger = document.querySelector(cfg.dataset.trigger);
  const flyers = [...document.querySelectorAll(cfg.dataset.targets)];
  if (!trigger || !flyers.length) return;

  flyers.forEach(el => el.classList.add('flyer'));

  const MARGIN = 8;
  let on = false;
  let lastType = 'mouse';
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  function currentShift(el) {
    const t = getComputedStyle(el).translate;
    if (!t || t === 'none') return [0, 0];
    const [x, y] = t.split(' ').map(parseFloat);
    return [x || 0, y || 0];
  }

  function calc() {
    const t = trigger.getBoundingClientRect();
    const cx = t.left + t.width / 2;
    const cy = t.top + t.height / 2;
    const push = Math.max(70, Math.min(innerWidth, innerHeight) * 0.2);

    flyers.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const [sx, sy] = currentShift(el);
      const left = r.left - sx, right = r.right - sx;
      const top = r.top - sy, bottom = r.bottom - sy;

      let dx = (left + right) / 2 - cx;
      let dy = (top + bottom) / 2 - cy;
      let len = Math.hypot(dx, dy);
      if (len < 1) { const a = i * 2.4; dx = Math.cos(a); dy = Math.sin(a); len = 1; }

      let mx = (dx / len) * push;
      let my = (dy / len) * push;

      mx = clamp(mx, Math.min(0, MARGIN - left), Math.max(0, innerWidth - MARGIN - right));
      if (bottom > 0 && top < innerHeight) {
        my = clamp(my, Math.min(0, MARGIN - top), Math.max(0, innerHeight - MARGIN - bottom));
      }

      el.style.setProperty('--fx', mx.toFixed(1) + 'px');
      el.style.setProperty('--fy', my.toFixed(1) + 'px');
    });
  }

  function set(state) {
    if (state === on) return;
    on = state;
    if (on) calc();
    document.body.classList.toggle('scatter', on);
  }

  trigger.addEventListener('pointerdown', e => { lastType = e.pointerType; });
  trigger.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') set(true); });
  trigger.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') set(false); });
  trigger.addEventListener('click', e => {
    if (lastType !== 'mouse' && !e.target.closest('a')) set(!on);   // tap toggles on touch
  });
  addEventListener('resize', () => { if (on) calc(); });
})();