/* ══════════════════════════════════════════════════════════════
   Anuansh Tiwari — portfolio motion layer
   Vanilla JS, no dependencies.

   Two engines drive everything:
     • one rAF scroll loop  → progress, nav, rail, parallax, hero
                              exit, background field
     • one IntersectionObserver → reveals, staggered children, counters
   Pointer effects (cursor glow, tilt, magnetics) run on their own
   short-lived frames. All of it is gated on prefers-reduced-motion.
   ══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const root     = document.documentElement;
  const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine   = window.matchMedia('(pointer: fine)');
  const mqCoarse = window.matchMedia('(pointer: coarse)');
  let   calm     = mqMotion.matches;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ───────────── 1. split text ─────────────
     Words are wrapped for line breaking in both modes; in char mode each
     letter also gets its own span carrying a running index for stagger. */
  function splitText() {
    $$('[data-split]').forEach(el => {
      const mode  = el.dataset.split;
      const words = el.textContent.trim().split(/\s+/);

      // "lit" is not an entrance — each word just carries its index so the
      // scroll loop can fill the paragraph in reading order with one var
      if (mode === 'lit') {
        el.textContent = '';
        words.forEach((word, i) => {
          if (i) el.appendChild(document.createTextNode(' '));
          const w = document.createElement('span');
          w.className = 'lw';
          w.style.setProperty('--i', i);
          w.textContent = word;
          el.appendChild(w);
        });
        el.dataset.words = words.length;
        return;
      }

      el.textContent = '';
      el.classList.add(mode === 'chars' ? 'split--chars' : 'split--words');

      let charIndex = 0;
      words.forEach((word, wi) => {
        // a real space between word spans, so the heading still copies and
        // reads as "Anuansh Tiwari" rather than one run-on token
        if (wi) el.appendChild(document.createTextNode(' '));
        const outer = document.createElement('span');
        outer.className = 'w';
        outer.style.setProperty('--wi', wi);

        if (mode === 'words') {
          const inner = document.createElement('i');
          inner.textContent = word;
          outer.appendChild(inner);
        } else {
          for (const ch of word) {
            const c = document.createElement('span');
            c.className = 'c';
            c.textContent = ch;
            c.style.setProperty('--cd', charIndex++);
            outer.appendChild(c);
          }
        }
        el.appendChild(outer);
      });
    });
  }

  function stageHero() {
    $$('[data-hero]').forEach(el => {
      const step = Number(el.dataset.hero) || 1;
      el.style.setProperty('--hd', 90 + step * 110);
    });
    requestAnimationFrame(() => {
      root.classList.add('is-ready');
      const title = $('.hero .split');
      if (!title) return;
      title.classList.add('is-in');
      if (!calm) title.classList.add('is-swept');
    });
  }

  /* ───────────── 2. reveal on scroll, with stagger ─────────────
     The observer handles the normal case; sweep() is the safety net for
     jumps it never sees — an instant anchor jump, End/Home, a scrollbar
     drag, or a reload part-way down the page. Without it, content can
     stay stranded at opacity 0, which hits reduced-motion users hardest
     because they get no smooth scroll to animate through. */
  let pending = [];

  function reveal(el) {
    el.classList.add('is-in');
    el.querySelector('.split')?.classList.add('is-in');
    startCounters(el);
  }

  function sweep(y) {
    if (!pending.length) return;
    const limit = y + window.innerHeight * 0.95;
    pending = pending.filter(el => {
      if (el._top === undefined || el._top > limit) return true;
      reveal(el);
      return false;
    });
  }

  function initReveal() {
    $$('[data-reveal-group]').forEach(group => {
      $$('[data-reveal]', group).forEach((el, i) => {
        el.style.setProperty('--rd', Math.min(i, 7) * 90);
      });
    });
    $$('.chips[data-stagger]').forEach(list => {
      $$('li', list).forEach((li, i) => li.style.setProperty('--ci', i));
    });

    pending = $$('[data-reveal]');

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        pending = pending.filter(el => el !== entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });

    pending.forEach(el => io.observe(el));
  }

  /* ───────────── 3. animated counters (real numbers only) ───────────── */
  function startCounters(scope) {
    $$('[data-count]', scope).forEach(el => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      const target = Number(el.dataset.count);
      if (calm) { el.textContent = String(target); return; }

      el.classList.add('is-counting');
      const dur = 1500 + Math.min(target, 900);
      const t0  = performance.now();
      const tick = (now) => {
        const p = clamp((now - t0) / dur, 0, 1);
        const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);   // easeOutExpo
        el.textContent = String(Math.round(target * e));
        if (p < 1) return requestAnimationFrame(tick);
        el.textContent = String(target);
        el.classList.remove('is-counting');
      };
      requestAnimationFrame(tick);
    });
  }

  /* ───────────── 4. nav pill ─────────────
     One pill slides and resizes between links rather than each link
     carrying its own chip. Hover borrows it, leaving returns it. */
  const navLinksEl = $('#nav-links');
  const navPill    = $('#nav-pill');
  const navLinks   = $$('.nav__links a');

  function movePill(target) {
    if (!navPill || !navLinksEl || !target) return;
    navPill.style.setProperty('--px', target.offsetLeft + 'px');
    navPill.style.setProperty('--pw', target.offsetWidth + 'px');
    navLinksEl.classList.add('has-pill');
  }

  function pillToActive() {
    const active = navLinks.find(a => a.classList.contains('is-active'));
    if (active) movePill(active);
    else navLinksEl?.classList.remove('has-pill');
  }

  function initPill() {
    navLinks.forEach(a => a.addEventListener('pointerenter', () => movePill(a)));
    navLinksEl?.addEventListener('pointerleave', pillToActive);
    window.addEventListener('resize', pillToActive, { passive: true });
  }

  /* ───────────── 5. momentum scroll ─────────────
     Native scrolling keeps driving the page — scrollbar, keyboard, anchor
     links and focus all behave normally — and the content simply lags
     behind it under a transform. Touch devices keep their own native
     momentum, which already feels better than anything re-implemented. */
  const smooth = (() => {
    const wrap = $('main');
    let target = 0, current = 0, raf = 0, on = false, ro = null, last = 0;

    // fraction of the remaining gap still left after one second — a
    // frame-rate independent exponential decay, so the feel is identical
    // at 30, 60 and 120 Hz instead of being tied to frame count
    const DECAY = 0.0012;

    function measure() {
      if (!on || !wrap) return;
      document.body.style.height = Math.round(wrap.scrollHeight) + 'px';
      measureMetrics();
      update();
    }

    function frame(now) {
      raf = 0;
      const dt = Math.min(now - last, 64) / 1000;   // clamp tab-switch gaps
      last = now;
      target = window.scrollY || window.pageYOffset;

      // an anchor jump can be ten viewports away; easing the whole distance
      // reads as sluggish, so cap how far the content ever has to travel
      const cap = window.innerHeight * 3;
      const gap = target - current;
      if (Math.abs(gap) > cap) current = target - Math.sign(gap) * cap;

      current = lerp(current, target, 1 - Math.pow(DECAY, dt));
      if (Math.abs(target - current) < 0.5) current = target;
      wrap.style.transform = `translate3d(0, ${(-current).toFixed(2)}px, 0)`;
      update();
      if (current !== target) raf = requestAnimationFrame(frame);
    }

    return {
      get active() { return on; },
      // the smoothed position, which is what is actually on screen — the
      // scrollspy and reveals must read this, not window.scrollY
      get y() { return on ? current : (window.scrollY || window.pageYOffset); },
      kick() {
        if (!on || raf) return;
        last = performance.now();   // never carry a stale dt across an idle gap
        raf = requestAnimationFrame(frame);
      },
      start() {
        if (on || !wrap || calm || !mqFine.matches) return;
        on = true;
        root.classList.add('smooth');
        current = target = window.scrollY || window.pageYOffset;
        measure();
        // font loading and reflow change the content height after paint
        if ('ResizeObserver' in window) {
          ro = new ResizeObserver(measure);
          ro.observe(wrap);
        }
        window.addEventListener('resize', measure, { passive: true });
        last = performance.now();
        this.kick();
      },
      stop() {
        if (!on) return;
        on = false;
        root.classList.remove('smooth');
        document.body.style.height = '';
        wrap.style.transform = '';
        ro?.disconnect(); ro = null;
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
      }
    };
  })();

  /* ───────────── 6. scroll loop ───────────── */
  const nav        = $('#nav');
  const navPct     = $('#nav-pct');
  const hero       = $('#hero');
  const railLinks  = $$('.rail a');
  const sections   = $$('[data-section]');
  const parallaxEl = $$('[data-parallax]');
  const navIds     = new Set(navLinks.map(a => a.dataset.nav));

  /* Every scroll-linked effect used to read offsetTop / scrollHeight /
     offsetHeight per frame and then write transforms, which forces a
     synchronous layout on every single frame. All of it is measured up
     front instead and refreshed only when the page can actually change
     shape (resize, reflow, webfont swap). */
  const metrics = { max: 1, heroH: 0, sections: [], lit: [] };

  function docTop(el) {
    // rects reflect the momentum transform, so add back the position it
    // is offset by — that equals scrollY when momentum is off
    return el.getBoundingClientRect().top + smooth.y;
  }

  function measureMetrics() {
    metrics.max   = Math.max(1, document.body.scrollHeight - window.innerHeight);
    metrics.heroH = hero ? hero.offsetHeight : window.innerHeight;
    metrics.sections = sections.map(s => ({ id: s.id, top: docTop(s) }));
    metrics.lit = litEls.map(el => ({
      el, top: docTop(el), h: el.offsetHeight,
      n: Number(el.dataset.words || 0) + 3
    }));
    for (const el of pending) el._top = docTop(el);
  }

  let ticking = false;
  let lastPct = -1;
  let lastY = 0;
  let velocity = 0;
  let activeSection = '';
  let activeNav = '';

  function onScroll() {
    if (smooth.active) return smooth.kick();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function update() {
    ticking = false;
    // the smoothed position is what is actually on screen, so every
    // scroll-linked effect must read it rather than window.scrollY
    const y   = smooth.y;
    const max = metrics.max;
    const sp  = clamp(y / max, 0, 1);

    velocity = lerp(velocity, Math.min(Math.abs(y - lastY), 90), 0.2);
    lastY = y;

    root.style.setProperty('--sp', sp.toFixed(4));

    const pct = Math.round(sp * 100);
    if (navPct && pct !== lastPct) {
      navPct.textContent = String(pct).padStart(2, '0');
      lastPct = pct;
    }

    // nav condenses once the hero is mostly behind us
    const heroH = metrics.heroH;
    nav.classList.toggle('is-condensed', y > heroH * 0.6);

    // hero recedes as it leaves rather than just scrolling away
    if (hero && !calm) {
      hero.style.setProperty('--hp', clamp(y / (heroH * 0.85), 0, 1).toFixed(3));
    }

    // scrollspy — drives both the nav pill and the section rail
    const line = y + window.innerHeight * 0.35;
    let current = activeSection;
    for (const s of metrics.sections) {
      if (s.top <= line) current = s.id;
    }
    if (current !== activeSection) {
      activeSection = current;
      railLinks.forEach(a => a.classList.toggle('is-active', a.dataset.rail === current));

      // sections with no nav link (e.g. #leadership) keep the previous one lit
      if (navIds.has(current) && current !== activeNav) {
        activeNav = current;
        navLinks.forEach(a => a.classList.toggle('is-active', a.dataset.nav === current));
        pillToActive();
      }
    }

    if (!calm) {
      for (const el of parallaxEl) {
        const speed = Number(el.dataset.speed || -0.08);
        el.style.transform = `translate3d(0, ${(y * speed).toFixed(2)}px, 0)`;
      }
    }

    litPass(y);
    sweep(y);
    bg.scroll(sp, velocity);
  }

  /* paragraph that fills word by word as it crosses the viewport */
  const litEls = $$('[data-split="lit"]');
  function litPass(y) {
    if (calm) return;
    const vh = window.innerHeight;
    for (const m of metrics.lit) {
      const el = m.el, n = m.n;
      const r = { top: m.top - y, bottom: m.top + m.h - y, height: m.h };
      // resolve a value at every position, including offscreen: a jump that
      // skips the paragraph must still leave it fully lit once passed,
      // never stranded at the dim end
      let p;
      if (r.bottom < 0) p = 1;
      else if (r.top > vh) p = 0;
      else p = clamp((vh * 0.88 - r.top) / (vh * 0.6 + r.height * 0.5), 0, 1);
      el.style.setProperty('--lit', (p * n).toFixed(2));
    }
  }

  /* ───────────── 7. tilt + cursor spotlight on cards ───────────── */
  function initTilt() {
    $$('[data-tilt]').forEach(card => {
      const max = card.hasAttribute('data-tilt-soft') ? 3.5 : 7;
      let raf = 0, tx = 0, ty = 0;

      const apply = () => {
        raf = 0;
        card.style.transform =
          `perspective(1100px) rotateX(${ty.toFixed(2)}deg) rotateY(${tx.toFixed(2)}deg) translate3d(0,-5px,0)`;
      };

      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        // the border glow follows the pointer even in calm mode — it is
        // light, not movement, so it stays on for everyone
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        if (calm || mqCoarse.matches) return;
        tx = (px - 0.5) * 2 * max;
        ty = (0.5 - py) * 2 * max;
        if (!raf) raf = requestAnimationFrame(apply);
      });

      card.addEventListener('pointerleave', () => {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        card.style.transform = '';
      });
    });
  }

  /* ───────────── 8. magnetic buttons ───────────── */
  function initMagnetic() {
    if (calm || mqCoarse.matches) return;
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = `translate3d(${(dx * 12).toFixed(1)}px, ${(dy * 9).toFixed(1)}px, 0)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ───────────── 9. trailing cursor glow ─────────────
     A soft light that lags the pointer. The native cursor is never
     hidden, so nothing is lost if this never starts. */
  const cursor = (() => {
    const el = $('#cursor');
    const glow = el ? $('.cursor__glow', el) : null;
    let x = 0, y = 0, gx = 0, gy = 0, raf = 0, live = false;

    function frame() {
      raf = 0;
      gx = lerp(gx, x, 0.12);
      gy = lerp(gy, y, 0.12);
      glow.style.transform = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0) scale(var(--cs, 1))`;
      if (Math.abs(gx - x) > 0.4 || Math.abs(gy - y) > 0.4) raf = requestAnimationFrame(frame);
    }

    function kick() { if (live && !raf) raf = requestAnimationFrame(frame); }

    return {
      init() {
        if (!el || !glow || calm || !mqFine.matches) return;
        live = true;
        root.classList.add('has-cursor');

        window.addEventListener('pointermove', (e) => {
          if (e.pointerType && e.pointerType !== 'mouse') return;
          x = e.clientX; y = e.clientY;
          el.classList.add('is-on');
          kick();
        }, { passive: true });

        document.addEventListener('pointerover', (e) => {
          const hot = e.target.closest?.('a, button, [data-tilt], .chips li');
          el.classList.toggle('is-hot', !!hot);
        }, { passive: true });

        document.addEventListener('pointerleave', () => el.classList.remove('is-on'));
        window.addEventListener('blur', () => el.classList.remove('is-on'));
      },
      stop() {
        live = false;
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        root.classList.remove('has-cursor');
        el?.classList.remove('is-on');
      }
    };
  })();

  /* ───────────── 10. copy to clipboard ───────────── */
  function initCopy() {
    const toast = $('#toast');
    let toastTimer = 0;

    const say = (msg) => {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('is-on');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('is-on'), 1900);
    };

    async function write(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // clipboard API is unavailable or blocked (insecure context,
        // permission denied) — fall back to a selection-based copy
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
          document.body.appendChild(ta);
          ta.select();
          const ok = document.execCommand('copy');
          ta.remove();
          return ok;
        } catch { return false; }
      }
    }

    $$('.copy').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ok = await write(btn.dataset.copy);
        if (!ok) return say('Copy failed — select it manually');
        btn.classList.add('is-done');
        say('Copied ' + btn.dataset.copy);
        setTimeout(() => btn.classList.remove('is-done'), 1600);
      });
    });
  }

  /* A canvas's context type is permanent, so each renderer gets a fresh
     one; handing over means discarding the old canvas entirely. */
  function makeCanvas() {
    const host = $('#field-host');
    if (!host) return null;
    const c = document.createElement('canvas');
    host.appendChild(c);
    return c;
  }

  /* ───────────── 11. generative background field ───────────── */
  const field = (() => {
    let canvas = null, ctx = null;
    let w = 0, h = 0, dpr = 1, nodes = [], raf = 0, running = false;
    let progress = 0, vel = 0, hue = 78, px = -1, py = -1;

    function size() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, mqCoarse.matches ? 1.4 : 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      const density = mqCoarse.matches ? 22000 : 17000;
      const count = clamp(Math.round((w * h) / density), 18, mqCoarse.matches ? 40 : 68);
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.17,
        vy: (Math.random() - 0.5) * 0.17,
        r: Math.random() * 1.5 + 0.5
      }));
    }

    function frame() {
      raf = 0;
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      // hue travels with scroll: lime at the top → cyan/violet at the bottom,
      // and the field speeds up slightly with scroll velocity
      hue = 70 + progress * 170;
      const link = mqCoarse.matches ? 108 : 138;
      const drift = 1 + progress * 0.6 + Math.min(vel / 45, 1.4);

      const R = 160;
      for (const n of nodes) {
        n.x += n.vx * drift;
        n.y += n.vy * drift;
        // the field parts around the pointer
        if (px >= 0) {
          const dx = n.x - px, dy = n.y - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R && d2 > 1) {
            const d = Math.sqrt(d2);
            const f = (1 - d / R) * 1.1;
            n.x += (dx / d) * f;
            n.y += (dy / d) * f;
          }
        }
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > link * link) continue;
          const alpha = (1 - Math.sqrt(d2) / link) * 0.2;
          if (alpha < 0.012) continue;      // invisible, not worth a path
          ctx.strokeStyle = `hsla(${hue}, 12%, 82%, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        ctx.fillStyle = `hsla(${hue}, 14%, 86%, .34)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (!ctx || calm || running) return;
      running = true;
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (ctx) ctx.clearRect(0, 0, w, h);
    }

    return {
      init() {
        if (ctx) return;
        canvas = makeCanvas();
        if (!canvas) return;
        ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;
        size();
        if (!calm) start();
        let rt;
        window.addEventListener('resize', () => {
          clearTimeout(rt);
          rt = setTimeout(size, 160);
        }, { passive: true });
        document.addEventListener('visibilitychange', () => {
          document.hidden ? stop() : start();
        });
      },
      scroll(p, v) { progress = p; vel = v; },
      pointer(x, y) { px = x; py = y; },
      start, stop
    };
  })();

  /* ───────────── 11b. WebGL backdrop ─────────────
     A single full-screen fragment shader: domain-warped fbm, a palette
     that travels with scroll, a swell under the pointer, and an ordered
     dither because dark gradients band badly at 8 bits. Falls back to the
     canvas-2D field if WebGL is missing or the context is lost. */
  const shader = (() => {
    let canvas = null;
    let gl = null, prog = null, raf = 0, running = false, lost = false;
    let u = {}, w = 0, h = 0, res = 1, scale = 0.75;
    let progress = 0, vel = 0, mx = 0.5, my = 0.5, born = 0;
    // a full-screen shader on a software rasteriser (SwiftShader, no GPU)
    // can be far slower than the 2D field it replaced, so the cost is
    // measured live and the effect steps itself down rather than assuming
    let samples = 0, acc = 0, stepped = 0, lastFrame = 0;

    const VERT = `#version 300 es
in vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

    const FRAG = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2  uRes;
uniform float uT;    // seconds
uniform float uP;    // 0..1 scroll progress
uniform vec2  uM;    // pointer, normalised
uniform float uV;    // scroll velocity

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 s = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i),               hash(i + vec2(1.0, 0.0)), s.x),
             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0, 1.0)), s.x), s.y);
}

float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float ar = uRes.x / uRes.y;
  vec2 q = vec2(uv.x * ar, uv.y);

  float t = uT * 0.035;

  // domain warp — what stops it reading as plain noise
  vec2 warp = vec2(fbm(q * 1.6 + vec2(t, -t * 0.7)),
                   fbm(q * 1.6 + vec2(5.2 - t, 1.3 + t)));
  float n = fbm(q * 2.1 + warp * 0.9 + vec2(0.0, t * 0.5));

  // the field swells under the pointer
  float d = distance(q, vec2(uM.x * ar, uM.y));
  n += smoothstep(0.40, 0.0, d) * 0.11;

  // near-monochrome: the page is greyscale, so the backdrop only carries a
  // breath of tint that travels with scroll rather than a colour ramp
  vec3 warm = vec3(0.95, 0.97, 0.90);
  vec3 cool = vec3(0.88, 0.91, 1.00);
  vec3 col  = mix(warm, cool, smoothstep(0.0, 1.0, uP));

  float amt = pow(smoothstep(0.34, 0.95, n), 2.2) * (0.16 + uV * 0.04);

  // hold the centre back so body copy keeps its contrast
  amt *= smoothstep(0.06, 0.78, length(uv - 0.5) * 1.35);

  // ordered dither: without this, a dark ramp bands visibly on 8-bit panels
  float dither = (hash(gl_FragCoord.xy + fract(uT)) - 0.5) / 255.0;

  o = vec4(col, clamp(amt, 0.0, 0.20) + dither);
}`;

    function compile(type, src){
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    // release the GPU context and drop the canvas, so the 2D fallback can
    // start from a clean element instead of one it can never draw on
    function retire(){
      running = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      try { gl?.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* already gone */ }
      gl = null;
      canvas?.remove();
      canvas = null;
    }

    function handOver(tag){
      if (lost) return;          // loseContext() re-enters through the event
      lost = true;
      retire();
      field.init();
      field.start();
      bg.which = field;
      root.dataset.bg = tag;
    }

    function size(){
      if (!gl) return;
      // a full-screen fragment shader is fill-rate bound, so render below
      // device resolution and let the compositor scale it up
      res = Math.min(window.devicePixelRatio || 1, 1.5) * scale;
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width  = Math.max(1, Math.round(w * res));
      canvas.height = Math.max(1, Math.round(h * res));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function frame(now){
      raf = 0;
      if (!running || !gl) return;

      if (lastFrame) {
        acc += now - lastFrame;
        if (++samples >= 20) {
          const avg = acc / samples;
          samples = 0; acc = 0;
          if (avg > 26) {                    // under ~38fps
            if (stepped === 0) { stepped = 1; scale = 0.45; size(); }
            else {                           // still too slow — hand over
              stepped = 2;
              lastFrame = 0;
              handOver('2d-degraded');
              return;
            }
          }
        }
      }
      lastFrame = now;

      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.t, (performance.now() - born) / 1000);
      gl.uniform1f(u.p, progress);
      gl.uniform2f(u.m, mx, my);
      gl.uniform1f(u.v, Math.min(vel / 60, 1.2));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    }

    return {
      init(){
        canvas = makeCanvas();
        if (!canvas) return false;
        try {
          gl = canvas.getContext('webgl2', {
            alpha: true, premultipliedAlpha: false,
            antialias: false, depth: false, stencil: false,
            powerPreference: 'low-power'
          });
        } catch { gl = null; }
        if (!gl) return false;

        const vs = compile(gl.VERTEX_SHADER, VERT);
        const fs = compile(gl.FRAGMENT_SHADER, FRAG);
        if (!vs || !fs) { retire(); return false; }

        prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { retire(); return false; }
        gl.useProgram(prog);

        // one oversized triangle covers the viewport with no index buffer
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, 'p');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        u = {
          res: gl.getUniformLocation(prog, 'uRes'),
          t:   gl.getUniformLocation(prog, 'uT'),
          p:   gl.getUniformLocation(prog, 'uP'),
          m:   gl.getUniformLocation(prog, 'uM'),
          v:   gl.getUniformLocation(prog, 'uV'),
        };

        born = performance.now();
        size();

        canvas.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          handOver('2d-recovered');
        });

        let rt;
        window.addEventListener('resize', () => {
          clearTimeout(rt);
          rt = setTimeout(size, 160);
        }, { passive: true });
        document.addEventListener('visibilitychange', () => {
          document.hidden ? this.stop() : this.start();
        });

        if (!calm) this.start();
        return true;
      },
      start(){
        if (!gl || calm || running || lost) return;
        running = true;
        if (!raf) raf = requestAnimationFrame(frame);
      },
      stop(){
        running = false;
        lastFrame = 0;
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        if (gl) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
      },
      scroll(p, v){ progress = p; vel = v; },
      pointer(x, y){
        if (x < 0) { mx = my = -1; return; }
        mx = x / window.innerWidth;
        my = 1 - y / window.innerHeight;   // GL origin is bottom-left
      }
    };
  })();

  /* whichever backdrop actually came up */
  const bg = {
    which: null,
    init(){
      const gl = shader.init();
      if (!gl) field.init();
      this.which = gl ? shader : field;
      root.dataset.bg = gl ? 'gl' : '2d';
    },
    scroll(p, v){ this.which?.scroll(p, v); },
    pointer(x, y){ this.which?.pointer(x, y); },
    start(){ this.which?.start(); },
    stop(){ this.which?.stop(); }
  };

  /* ───────────── 12. mobile drawer ───────────── */
  function initDrawer() {
    const toggle = $('#nav-toggle');
    const drawer = $('#nav-drawer');
    if (!toggle || !drawer) return;

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      drawer.hidden = !open;
    };

    toggle.addEventListener('click', () => setOpen(drawer.hidden));
    drawer.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !drawer.hidden) setOpen(false);
    });
  }

  /* ───────────── 13. in-page anchors ─────────────
     Under momentum scroll <main> is position:fixed, so its sections no
     longer move with the page and the browser's own hash scrolling lands
     nowhere. Every in-page link is therefore resolved here instead, from
     layout offsets that are correct in both modes. */
  function anchorTop(id) {
    if (!id) return 0;
    const hit = metrics.sections.find(s => s.id === id);
    const el = document.getElementById(id);
    if (!hit && !el) return 0;
    const pad = (nav?.offsetHeight || 66) + 18;
    return Math.max(0, (hit ? hit.top : docTop(el)) - pad);
  }

  function goTo(id, push) {
    const top = anchorTop(id);
    // with momentum on, the lerp supplies the easing; without it, let the
    // browser ease natively
    const behavior = (smooth.active || calm || !('scrollBehavior' in root.style)) ? 'auto' : 'smooth';
    window.scrollTo({ top, behavior });
    if (push && id) history.replaceState(null, '', '#' + id);
  }

  function initAnchors() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        if (!id || id === 'top') { e.preventDefault(); return goTo(null, false); }
        if (!document.getElementById(id)) return;
        e.preventDefault();
        goTo(id, true);
      });
    });
  }

  /* ───────────── 14. intro curtain ─────────────
     Shown once per session, dismissible, and never on reduced motion —
     a recruiter reloading the page should not sit through it twice. */
  const intro = (() => {
    const el = $('#intro');
    const bar = $('#intro-bar');
    let done = false;

    function finish() {
      if (done) return;
      done = true;
      el.classList.add('is-out');
      root.classList.remove('is-intro');
      try { sessionStorage.setItem('at-intro-seen', '1'); } catch { /* private mode */ }
      setTimeout(() => el.remove(), 1100);
      stageHero();
    }

    return {
      run() {
        let seen = false;
        try { seen = sessionStorage.getItem('at-intro-seen') === '1'; } catch { /* private mode */ }
        if (!el || calm || seen) { el?.remove(); stageHero(); return; }

        root.classList.add('is-intro');
        el.classList.add('is-live');
        bar?.animate(
          [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
          { duration: 820, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }
        );

        const timer = setTimeout(finish, 1000);
        const skip = () => { clearTimeout(timer); finish(); };
        el.addEventListener('click', skip);
        window.addEventListener('keydown', skip, { once: true });
        window.addEventListener('wheel', skip, { once: true, passive: true });
        window.addEventListener('touchstart', skip, { once: true, passive: true });
      }
    };
  })();

  /* ───────────── 15. decode-on-hover ───────────── */
  const GLYPHS = '#$%&/<>[]{}=+*~01';
  function initDecode() {
    if (calm || mqCoarse.matches) return;
    $$('[data-decode]').forEach(el => {
      const text = el.textContent;
      el.addEventListener('pointerenter', () => {
        if (el.dataset.busy) return;
        el.dataset.busy = '1';
        const dur = 360, t0 = performance.now();
        const tick = (now) => {
          const p = clamp((now - t0) / dur, 0, 1);
          const settled = Math.round(p * text.length);
          let out = '';
          for (let i = 0; i < text.length; i++) {
            out += (i < settled || text[i] === ' ')
              ? text[i]
              : GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
          el.textContent = out;
          if (p < 1) return requestAnimationFrame(tick);
          el.textContent = text;          // always restore the real label
          delete el.dataset.busy;
        };
        requestAnimationFrame(tick);
      });
    });
  }

  /* ───────────── 16. marquee ─────────────
     The track is duplicated so a -50% translate loops seamlessly. */
  function initMarquee() {
    const track = $('#marquee-track');
    const row = track ? $('.marquee__row', track) : null;
    if (row) track.appendChild(row.cloneNode(true));
  }

  /* ───────────── boot ───────────── */
  function boot() {
    splitText();
    initReveal();
    initTilt();
    initMagnetic();
    initPill();
    initDrawer();
    initCopy();
    initDecode();
    initMarquee();
    initAnchors();
    bg.init();
    cursor.init();
    intro.run();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // the field parts around the pointer
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      bg.pointer(e.clientX, e.clientY);
    }, { passive: true });
    window.addEventListener('pointerleave', () => bg.pointer(-1, -1), { passive: true });

    smooth.start();
    measureMetrics();

    const remeasure = () => { measureMetrics(); onScroll(); };
    window.addEventListener('resize', remeasure, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe($('main'));
    // webfonts swap in after first paint and move everything
    document.fonts?.ready.then(remeasure).catch(() => {});

    // a deep link arrives before the wrapper is fixed, so re-resolve it
    if (location.hash.length > 1) {
      const id = location.hash.slice(1);
      if (document.getElementById(id)) requestAnimationFrame(() => goTo(id, false));
    }
    update();

    // react live if the user flips the OS motion setting
    const onPrefChange = (e) => {
      calm = e.matches;
      if (calm) {
        bg.stop();
        cursor.stop();
        smooth.stop();
        litEls.forEach(el => el.style.removeProperty('--lit'));
        hero?.style.removeProperty('--hp');
        parallaxEl.forEach(el => { el.style.transform = ''; });
        $$('[data-tilt]').forEach(el => { el.style.transform = ''; });
        $$('.magnetic').forEach(el => { el.style.transform = ''; });
        $$('[data-count]').forEach(el => { el.textContent = el.dataset.count; });
      } else {
        bg.start();
        cursor.init();
        smooth.start();
      }
    };
    mqMotion.addEventListener
      ? mqMotion.addEventListener('change', onPrefChange)
      : mqMotion.addListener(onPrefChange);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();
