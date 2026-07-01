const reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
const prefersReducedMotion = reduceMotionQuery ? reduceMotionQuery.matches : false;
const isLowPowerDevice = typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

if (prefersReducedMotion || isLowPowerDevice) {
  document.documentElement.classList.add('reduced-motion');
}

document.documentElement.classList.add('js-ready');

const header = document.querySelector('.site-header');
const navLinks = Array.from(document.querySelectorAll('.header-nav a'));
const heroAmbients = Array.from(document.querySelectorAll('[data-parallax]'));
const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
const supportsIntersectionObserver = typeof window.IntersectionObserver === 'function';
let ticking = false;

function revealElement(element) {
  if (!element || element.classList.contains('is-visible')) return;

  const delay = Number(element.dataset.revealDelay || 0);
  element.style.transitionDelay = prefersReducedMotion ? '0ms' : `${delay}ms`;
  element.classList.add('is-visible');
}

function updateHeaderState() {
  if (!header) return;
  const scrolled = window.scrollY > 24;
  header.classList.toggle('scrolled', scrolled);
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
    link.classList.toggle('active', targetId === currentId);
  });
}

function updateParallax() {
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

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealElement(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.16,
    rootMargin: '0px 0px -8% 0px'
  });

  revealElements.forEach((element) => {
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
  const loadingText = document.getElementById('terminal-loading');
  const profilePreview = document.getElementById('github-profile-preview');

  if (loader) {
    loader.classList.add('is-hidden');
    window.setTimeout(() => {
      loader.remove();
    }, 700);
  }

  if (loadingText && profilePreview) {
    const terminalLines = Array.from(document.querySelectorAll('.terminal-line'));

    terminalLines.forEach((line, index) => {
      window.setTimeout(() => {
        line.classList.remove('terminal-line--loading');
        line.classList.add('terminal-line--ready');
      }, prefersReducedMotion ? 0 : 220 + index * 120);
    });

    window.setTimeout(() => {
      loadingText.textContent = 'Perfil cargado ✓';
      loadingText.classList.add('t-green');
      profilePreview.classList.remove('hidden');
    }, prefersReducedMotion ? 350 : 1800);
  }
});

updateHeaderState();
updateActiveNav();
updateParallax();
