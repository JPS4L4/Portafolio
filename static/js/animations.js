const reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
const prefersReducedMotion = reduceMotionQuery ? reduceMotionQuery.matches : false;

if (prefersReducedMotion) {
  document.documentElement.classList.add('reduced-motion');
}

document.documentElement.classList.add('js-ready');

const header = document.querySelector('.site-header');
const navLinks = Array.from(document.querySelectorAll('.header-nav a'));
const heroAmbients = Array.from(document.querySelectorAll('[data-parallax]'));
const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
const supportsIntersectionObserver = typeof window.IntersectionObserver === 'function';
const supportsMutationObserver = typeof window.MutationObserver === 'function';

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

if (revealElements.length) {
  observeReveals();

  if (supportsMutationObserver) {
    const mutationObserver = new MutationObserver(() => {
      const allReveals = Array.from(document.querySelectorAll('[data-reveal]'));
      allReveals.forEach((element) => {
        if (!element.classList.contains('is-visible') && !element.dataset.revealObserved) {
          element.dataset.revealObserved = 'true';
          if (!supportsIntersectionObserver) {
            revealElement(element);
            return;
          }

          const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              revealElement(entry.target);
              currentObserver.unobserve(entry.target);
            });
          }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
          observer.observe(element);
        }
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }
}

window.addEventListener('scroll', () => {
  updateHeaderState();
  updateActiveNav();
  updateParallax();
}, { passive: true });

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
      }, 220 + index * 180);
    });

    window.setTimeout(() => {
      loadingText.textContent = 'Perfil cargado ✓';
      loadingText.classList.add('t-green');
      profilePreview.classList.remove('hidden');
    }, 2200);
  }
});

updateHeaderState();
updateActiveNav();
updateParallax();
