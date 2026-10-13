/* Movimiento con anime.js v4 (módulo ES).
 *
 * Dueño único de los reveals cuando la librería carga: animations.js deja
 * html.motion-pending mientras espera; aquí pasa a motion-ready. Si el import
 * falla (o hay movimiento reducido) se libera al reveal CSS de animations.js
 * y el contenido nunca queda invisible. */

const ANIME_URL = 'https://cdn.jsdelivr.net/npm/animejs@4.3.6/dist/bundles/anime.esm.min.js';
const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

/* Devuelve la página al reveal CSS y deshace cualquier estado oculto inline. */
function fallback(error) {
  if (error) console.warn('[motion] anime.js no disponible, se usa el reveal CSS.', error);
  $$('[data-reveal], .hero-card__list > div, .repo-card, .hero h1 *, .stat-num *').forEach((el) => {
    el.style.opacity = '';
    el.style.transform = '';
  });
  const underline = $('.hero h1 .highlight');
  if (underline) underline.style.removeProperty('--underline');
  if (typeof releaseRevealFallback === 'function') {
    releaseRevealFallback();
  } else {
    root.classList.remove('motion-pending', 'motion-ready');
    $$('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
  }
}

async function boot() {
  if (reduceMotion) return; // animations.js ya deja todo visible, sin movimiento
  if (typeof window.IntersectionObserver !== 'function') return fallback();

  let anime;
  try {
    anime = await import(ANIME_URL);
  } catch (error) {
    return fallback(error);
  }
  // Si el temporizador de animations.js ya liberó el reveal CSS, no nos metemos.
  if (!root.classList.contains('motion-pending')) return;

  root.classList.remove('motion-pending');
  root.classList.add('motion-ready');
  try {
    init(anime);
  } catch (error) {
    fallback(error);
  }
}

function init({ animate, createTimeline, stagger, splitText, spring, utils }) {
  const EASE = 'outQuart'; // equivalente a --ease-out (cubic-bezier .23,1,.32,1)

  /* ── Utilidades ─────────────────────────────────────────────────────── */
  const clearInline = (el) => {
    el.style.opacity = '';
    el.style.transform = '';
  };

  function settle(el) {
    if (el.hasAttribute('data-reveal')) el.classList.add('is-visible');
    clearInline(el);
  }

  /* Sube y aparece. Oculta de inmediato (antes del primer pintado) y limpia al acabar. */
  function rise(targets, { y = 16, dur = 650, delay = 0, step = 0, scale = 0 } = {}) {
    const els = Array.from(targets instanceof Element ? [targets] : targets || []);
    if (!els.length) return null;
    els.forEach((el) => { el.style.opacity = '0'; });
    const params = {
      opacity: [0, 1],
      y: [y, 0],
      duration: dur,
      ease: EASE,
      delay: step ? stagger(step, { start: delay }) : delay,
      onComplete: () => els.forEach(settle),
    };
    if (scale) params.scale = [scale, 1];
    return animate(els, params);
  }

  const show = (el) => el.classList.add('is-visible');

  /* ── Contadores de estadísticas ─────────────────────────────────────── */
  const repoCount = document.getElementById('repo-count');
  let statsShown = false;

  function countUp(el) {
    if (el.dataset.counted) return;
    const match = /^(\d+)(.*)$/.exec(el.textContent.trim());
    if (!match) return;
    el.dataset.counted = '1';
    const target = Number(match[1]);
    const suffix = match[2];
    const state = { value: 0 };
    el.textContent = `0${suffix}`;
    animate(state, {
      value: target,
      duration: Math.min(1200, 450 + target * 45),
      ease: 'outExpo',
      onUpdate: () => { el.textContent = `${Math.round(state.value)}${suffix}`; },
      onComplete: () => { el.textContent = `${target}${suffix}`; },
    });
  }

  function runStats(container) {
    statsShown = true;
    $$('.stat-num', container).forEach((num, index) => {
      if (/^\d/.test(num.textContent.trim())) {
        window.setTimeout(() => countUp(num), 120 + index * 80);
      } else if (num !== repoCount) {
        // Texto (B2, ITM): sube letra a letra, más discreto que el conteo.
        const { chars } = splitText(num, { chars: true });
        chars.forEach((c) => { c.style.opacity = '0'; });
        animate(chars, {
          opacity: [0, 1],
          y: ['0.35em', '0em'],
          duration: 520,
          delay: stagger(70, { start: 200 + index * 80 }),
          ease: EASE,
        });
      }
    });
  }

  if (repoCount) {
    // #repo-count lo rellena github_repos.js de forma asíncrona.
    new MutationObserver(() => {
      if (statsShown && /^\d/.test(repoCount.textContent.trim())) countUp(repoCount);
    }).observe(repoCount, { childList: true, characterData: true, subtree: true });
  }

  /* ── Reveal por tipo de elemento ────────────────────────────────────── */
  function reveal(el) {
    if (el.classList.contains('is-visible') || el.dataset.motionDone) return;
    el.dataset.motionDone = '1';
    const delay = Number(el.dataset.revealDelay || 0);

    if (el.matches('.skills-grid')) {
      show(el);
      rise($$('.skill-group', el), { y: 14, step: 70, delay });
      rise($$('.skill-tags span', el), { y: 8, dur: 450, step: 16, delay: delay + 140 });
    } else if (el.matches('.about-stats')) {
      show(el);
      rise($$('.stat-card', el), { y: 12, step: 80, delay });
      runStats(el);
    } else if (el.matches('.job-card')) {
      show(el);
      rise($('.job-card__header', el), { y: 12, delay });
      rise($$('.job-card__achievement', el), { y: 14, step: 60, delay: delay + 100 });
    } else if (el.matches('.project-card')) {
      rise(el, { y: 28, scale: 0.975, dur: 700, delay });
    } else if (el.matches('.contact-card')) {
      rise(el, { y: 24, scale: 0.985, dur: 700, delay });
      rise($$('.contact-links > *', el), { y: 10, dur: 500, step: 70, delay: delay + 260 });
    } else if (el.matches('h2') || el.querySelector(':scope > h2')) {
      const heading = el.matches('h2') ? el : $(':scope > h2', el);
      show(el);
      const { words } = splitText(heading, { words: true });
      rise(words, { y: 18, dur: 600, step: 55, delay });
      if (el !== heading) {
        rise(Array.from(el.children).filter((child) => child !== heading), { y: 10, dur: 550, step: 80, delay: delay + 180 });
      }
    } else {
      rise(el, { y: 18, delay });
    }
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      reveal(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  function observeReveals(scope = document) {
    $$('[data-reveal]', scope).forEach((el) => {
      if (el.classList.contains('is-visible') || el.dataset.motionDone || el.closest('.hero')) return;
      revealObserver.observe(el);
    });
  }

  // fetch_projects.js / fetch_jobs.js llaman a esta función global tras inyectar tarjetas.
  window.observeNewRevealElements = observeReveals;
  observeReveals();

  /* Filas de repos de GitHub (inyectadas por github_repos.js, sin data-reveal) */
  const repoGrid = document.getElementById('github-repos');
  if (repoGrid) {
    const repoObserver = new IntersectionObserver((entries) => {
      const batch = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      if (!batch.length) return;
      batch.forEach((el) => repoObserver.unobserve(el));
      batch.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      rise(batch, { y: 14, dur: 550, step: 55 });
    }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });

    new MutationObserver(() => {
      $$('.repo-card', repoGrid).forEach((card) => {
        if (card.dataset.motionSeen) return;
        card.dataset.motionSeen = '1';
        card.style.opacity = '0'; // antes del pintado: sin parpadeo
        repoObserver.observe(card);
      });
    }).observe(repoGrid, { childList: true });
  }

  /* ── Intro del hero ─────────────────────────────────────────────────── */
  let introStarted = false;
  function heroIntro() {
    if (introStarted) return;
    introStarted = true;
    try {
      const eyebrow = $('.hero-eyebrow');
      const h1 = $('.hero h1');
      const hello = $('.hero-hello');
      const underline = $('.hero h1 .highlight');
      const sub = $('.hero-sub');
      const buttons = $$('.hero-actions .btn');
      const actions = $('.hero-actions');
      const card = $('.hero-card');
      const hero = $('.hero');
      const rows = $$('.hero-card__list > div');
      const names = $$('.hero-name', h1);

      // Accesibilidad: el h1 conserva su texto completo; las letras sueltas se ocultan al lector.
      h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
      $$(':scope > span', h1).forEach((s) => s.setAttribute('aria-hidden', 'true'));
      const chars = names.flatMap((name) => splitText(name, { chars: true }).chars);
      chars.forEach((c) => { c.style.opacity = '0'; });

      show(h1);
      show(actions);
      hello.style.opacity = '0';
      [eyebrow, sub, card].forEach((el) => { el.style.opacity = '0'; });
      buttons.forEach((el) => { el.style.opacity = '0'; });

      const tl = createTimeline({
        defaults: { ease: EASE },
        onComplete: () => {
          [eyebrow, sub, card].forEach(settle);
          buttons.forEach(clearInline);
          hero.classList.add('intro-done'); // mantiene visibles las filas de la ficha
          underline.style.setProperty('--underline', '1');
        },
      });
      tl.add(eyebrow, { opacity: [0, 1], y: [12, 0], duration: 500 }, 0)
        .add(hello, { opacity: [0, 1], y: [10, 0], duration: 500 }, 80)
        .add(chars, { opacity: [0, 1], y: ['0.5em', '0em'], duration: 680, delay: stagger(26) }, 150)
        .add(underline, { '--underline': [0, 1], duration: 620 }, 640)
        .add(sub, { opacity: [0, 1], y: [16, 0], duration: 600 }, 420)
        .add(buttons, { opacity: [0, 1], y: [14, 0], duration: 520, delay: stagger(70) }, 520)
        .add(card, { opacity: [0, 1], y: [22, 0], duration: 650 }, 300)
        .add(rows, { opacity: [0, 1], x: [-10, 0], duration: 480, delay: stagger(60) }, 620);
    } catch (error) {
      fallback(error);
    }
  }

  const startAfterLoader = () => window.setTimeout(heroIntro, 140);
  if (document.readyState === 'complete') startAfterLoader();
  else window.addEventListener('load', startAfterLoader, { once: true });
  window.setTimeout(heroIntro, 3000); // por si 'load' tarda (imágenes lentas)

  /* ── Foco de luz del hero (solo puntero fino) ──────────────────────── */
  const hero = $('.hero');
  if (hero && finePointer) {
    const glow = document.createElement('div');
    glow.className = 'hero-glow';
    glow.setAttribute('aria-hidden', 'true');
    hero.insertBefore(glow, hero.firstChild);

    let tx = 0, ty = 0, cx = 0, cy = 0, running = false, placed = false;
    const frame = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      glow.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      if (Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4) {
        window.requestAnimationFrame(frame);
      } else {
        running = false;
      }
    };
    hero.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const rect = hero.getBoundingClientRect();
      tx = event.clientX - rect.left;
      ty = event.clientY - rect.top;
      if (!placed) { cx = tx; cy = ty; placed = true; }
      glow.classList.add('is-on');
      if (!running) { running = true; window.requestAnimationFrame(frame); }
    }, { passive: true });
    hero.addEventListener('pointerleave', () => glow.classList.remove('is-on'));
  }

  /* ── Botones magnéticos y brillo en tarjetas (solo puntero fino) ───── */
  if (finePointer) {
    $$('.hero-actions .btn-primary, #open-repo-browser').forEach((btn) => {
      btn.setAttribute('data-magnet', '');
      btn.addEventListener('pointermove', (event) => {
        const rect = btn.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) * 0.22;
        const dy = (event.clientY - (rect.top + rect.height / 2)) * 0.22;
        btn.style.translate = `${Math.max(-6, Math.min(6, dx))}px ${Math.max(-4, Math.min(4, dy))}px`;
      }, { passive: true });
      btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
    });

    const projectGrid = document.getElementById('projects-grid');
    if (projectGrid) {
      projectGrid.addEventListener('pointermove', (event) => {
        const card = event.target.closest && event.target.closest('.project-card');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      }, { passive: true });
    }
  }

  /* ── Icono del selector de tema: giro con resorte ───────────────────── */
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      // animations.js ya aplicó el tema (su listener se registró antes).
      const light = root.getAttribute('data-theme') === 'light';
      const icon = $(light ? '.icon-sun' : '.icon-moon', themeToggle);
      if (!icon) return;
      animate(icon, {
        rotate: [-80, 0],
        scale: [0.6, 1],
        opacity: [0, 1],
        ease: spring({ bounce: 0.3, duration: 450 }),
      });
    });
  }

  /* ── Indicador de la navegación (escritorio) ────────────────────────── */
  const nav = document.getElementById('main-nav');
  if (nav) {
    const indicator = document.createElement('span');
    indicator.className = 'nav-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    nav.appendChild(indicator);

    let placedOnce = false;
    const moveIndicator = (instant) => {
      const active = $('a.active', nav);
      if (!active || nav.offsetWidth === 0 || getComputedStyle(indicator).display === 'none') return;
      const x = active.offsetLeft + 11;
      const w = Math.max(active.offsetWidth - 22, 1);
      if (instant || !placedOnce) {
        utils.set(indicator, { x, scaleX: w, opacity: 1 });
        placedOnce = true;
        return;
      }
      animate(indicator, { x, scaleX: w, duration: 420, ease: EASE });
    };
    new MutationObserver(() => moveIndicator(false))
      .observe(nav, { attributes: true, attributeFilter: ['class'], subtree: true });
    window.addEventListener('resize', () => moveIndicator(true), { passive: true });
    moveIndicator(true);
  }

  /* ── Barra de progreso de lectura ───────────────────────────────────── */
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let barTicking = false;
  const updateBar = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    barTicking = false;
  };
  const scheduleBar = () => {
    if (barTicking) return;
    barTicking = true;
    window.requestAnimationFrame(updateBar);
  };
  window.addEventListener('scroll', scheduleBar, { passive: true });
  window.addEventListener('resize', scheduleBar, { passive: true });
  updateBar();
}

boot();
