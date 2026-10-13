const reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
const prefersReducedMotion = reduceMotionQuery ? reduceMotionQuery.matches : false;

if (prefersReducedMotion) {
  document.documentElement.classList.add('reduced-motion');
}

document.documentElement.classList.add('js-ready');

/* motion.js (anime.js) es el dueño de los reveals cuando se carga bien.
   Mientras espera la librería, 'motion-pending' retiene el reveal CSS; si no
   llega a tiempo (CDN caído, sin soporte de módulos) se libera al reveal de abajo. */
const rootEl = document.documentElement;
if (!prefersReducedMotion && typeof window.IntersectionObserver === 'function') {
  rootEl.classList.add('motion-pending');
  window.setTimeout(() => {
    if (rootEl.classList.contains('motion-pending')) releaseRevealFallback();
  }, 4000);
}

function motionOwnsReveals() {
  return rootEl.classList.contains('motion-pending') || rootEl.classList.contains('motion-ready');
}

function releaseRevealFallback() {
  rootEl.classList.remove('motion-pending', 'motion-ready');
  if (revealObserver) revealObserver.disconnect();
  if (revealElements.length || document.querySelector('[data-reveal]')) observeReveals();
}

const siteHeader = document.querySelector('.site-header');
const navLinks = Array.from(document.querySelectorAll('.header-nav a'));
const heroAmbients = Array.from(document.querySelectorAll('[data-parallax]'));
const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
const supportsIntersectionObserver = typeof window.IntersectionObserver === 'function';
let revealObserver = null;
let ticking = false;

/* ── Tema claro / oscuro ── */
const themeToggle = document.getElementById('theme-toggle');
const themeMeta = document.querySelector('meta[name="color-scheme"]');

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function syncThemeToggle() {
  if (!themeToggle) return;
  const isLight = currentTheme() === 'light';
  themeToggle.setAttribute('aria-label', isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
}

function applyTheme(theme, persist) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeMeta) themeMeta.setAttribute('content', theme);
  if (persist) {
    try { localStorage.setItem('theme', theme); } catch (error) { /* almacenamiento no disponible */ }
  }
  syncThemeToggle();
}

if (themeToggle) {
  syncThemeToggle();
  themeToggle.addEventListener('click', () => {
    applyTheme(currentTheme() === 'light' ? 'dark' : 'light', true);
  });
}

// Si la persona nunca eligió un tema, seguimos los cambios del sistema.
if (window.matchMedia) {
  const schemeQuery = window.matchMedia('(prefers-color-scheme: light)');
  const onSchemeChange = (event) => {
    let stored = null;
    try { stored = localStorage.getItem('theme'); } catch (error) { /* ignorar */ }
    if (stored === 'light' || stored === 'dark') return;
    applyTheme(event.matches ? 'light' : 'dark', false);
  };
  if (schemeQuery.addEventListener) schemeQuery.addEventListener('change', onSchemeChange);
}

/* ── Reveals ── */
function revealElement(element) {
  if (!element || element.classList.contains('is-visible')) return;
  if (motionOwnsReveals()) return;

  const delay = Number(element.dataset.revealDelay || 0);
  element.style.transitionDelay = prefersReducedMotion ? '0ms' : `${delay}ms`;
  element.classList.add('is-visible');
}

function observeNewRevealElements(root = document) {
  const newRevealTargets = Array.from(root.querySelectorAll('[data-reveal]')).filter(
    (element) => !element.classList.contains('is-visible')
  );

  if (!newRevealTargets.length) return;

  if (!supportsIntersectionObserver) {
    newRevealTargets.forEach((element) => revealElement(element));
    return;
  }

  if (!revealObserver || motionOwnsReveals()) return;

  newRevealTargets.forEach((element) => revealObserver.observe(element));
}

function updateHeaderState() {
  if (!siteHeader) return;
  const scrolled = window.scrollY > 24;
  siteHeader.classList.toggle('scrolled', scrolled);
}

function updateActiveNav() {
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  let currentId = '';

  for (let index = sections.length - 1; index >= 0; index -= 1) {
    const section = sections[index];
    if (section.offsetTop - 160 <= window.scrollY) {
      currentId = section.id;
      break;
    }
  }

  navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    const targetId = href.replace('#', '');
    const isActive = targetId === currentId;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function updateParallax() {
  if (prefersReducedMotion) return;
  const scrollY = window.scrollY;
  heroAmbients.forEach((element) => {
    const speed = Number(element.dataset.parallax || 0.08);
    element.style.setProperty('--parallax-offset', `${scrollY * speed}px`);
  });
}

function observeReveals() {
  if (!supportsIntersectionObserver) {
    revealElements.forEach((element) => revealElement(element));
    return;
  }

  revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || motionOwnsReveals()) return;
      revealElement(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -6% 0px'
  });

  document.querySelectorAll('[data-reveal]').forEach((element) => {
    if (element.classList.contains('is-visible')) return;
    revealObserver.observe(element);
  });
}

function scheduleViewportWork() {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    updateHeaderState();
    updateActiveNav();
    updateParallax();
    ticking = false;
  });
}

if (revealElements.length) {
  observeReveals();
}

window.addEventListener('scroll', scheduleViewportWork, { passive: true });
window.addEventListener('resize', scheduleViewportWork, { passive: true });

window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');

  if (loader) {
    loader.classList.add('is-hidden');
    window.setTimeout(() => {
      loader.remove();
    }, 600);
  }
});

updateHeaderState();
updateActiveNav();
updateParallax();
