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
      const mode  = el.dataset.split === 'chars' ? 'chars' : 'words';
      const words = el.textContent.trim().split(/\s+/);
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

  function sweep() {
    if (!pending.length) return;
    const limit = window.innerHeight * 0.95;
    pending = pending.filter(el => {
      if (el.getBoundingClientRect().top > limit) return true;
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

  /* ───────────── 5. scroll loop ───────────── */
  const nav        = $('#nav');
  const navPct     = $('#nav-pct');
  const hero       = $('#hero');
  const railLinks  = $$('.rail a');
  const sections   = $$('[data-section]');
  const parallaxEl = $$('[data-parallax]');
  const navIds     = new Set(navLinks.map(a => a.dataset.nav));

  let ticking = false;
  let lastPct = -1;
  let lastY = 0;
  let velocity = 0;
  let activeSection = '';
  let activeNav = '';

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function update() {
    ticking = false;
    const y   = window.scrollY || window.pageYOffset;
    const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
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
    const heroH = hero ? hero.offsetHeight : window.innerHeight;
    nav.classList.toggle('is-condensed', y > heroH * 0.6);

    // hero recedes as it leaves rather than just scrolling away
    if (hero && !calm) {
      hero.style.setProperty('--hp', clamp(y / (heroH * 0.85), 0, 1).toFixed(3));
    }

    // scrollspy — drives both the nav pill and the section rail
    const line = y + window.innerHeight * 0.35;
    let current = activeSection;
    for (const s of sections) {
      if (s.offsetTop <= line) current = s.id;
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

    sweep();
    field.scroll(sp, velocity);
  }

  /* ───────────── 6. tilt + cursor spotlight on cards ───────────── */
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

  /* ───────────── 7. magnetic buttons ───────────── */
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

  /* ───────────── 8. trailing cursor glow ─────────────
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

  /* ───────────── 9. copy to clipboard ───────────── */
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

  /* ───────────── 10. generative background field ───────────── */
  const field = (() => {
    const canvas = $('#field-canvas');
    const ctx = canvas ? canvas.getContext('2d', { alpha: true }) : null;
    let w = 0, h = 0, dpr = 1, nodes = [], raf = 0, running = false;
    let progress = 0, vel = 0, hue = 78;

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
      const density = mqCoarse.matches ? 22000 : 13000;
      const count = clamp(Math.round((w * h) / density), 18, mqCoarse.matches ? 42 : 96);
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
      hue = 78 + progress * 190;
      const link = mqCoarse.matches ? 108 : 138;
      const drift = 1 + progress * 0.6 + Math.min(vel / 45, 1.4);

      for (const n of nodes) {
        n.x += n.vx * drift;
        n.y += n.vy * drift;
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
          ctx.strokeStyle = `hsla(${hue}, 80%, 62%, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        ctx.fillStyle = `hsla(${hue}, 85%, 66%, .4)`;
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
      start, stop
    };
  })();

  /* ───────────── 11. mobile drawer ───────────── */
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

  /* ───────────── 12. smooth scroll (fallback for older Safari) ───────────── */
  function initSmoothScroll() {
    if ('scrollBehavior' in document.documentElement.style) return;
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const target = document.getElementById(a.getAttribute('href').slice(1));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 90, behavior: calm ? 'auto' : 'smooth' });
      });
    });
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
    initSmoothScroll();
    field.init();
    cursor.init();
    stageHero();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();

    // react live if the user flips the OS motion setting
    const onPrefChange = (e) => {
      calm = e.matches;
      if (calm) {
        field.stop();
        cursor.stop();
        hero?.style.removeProperty('--hp');
        parallaxEl.forEach(el => { el.style.transform = ''; });
        $$('[data-tilt]').forEach(el => { el.style.transform = ''; });
        $$('.magnetic').forEach(el => { el.style.transform = ''; });
        $$('[data-count]').forEach(el => { el.textContent = el.dataset.count; });
      } else {
        field.start();
        cursor.init();
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
