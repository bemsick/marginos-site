/* MarginOS · marketing site interactions */

(function () {
  'use strict';

  // Sticky header scroll state
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile nav toggle
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (toggle && mobileNav) {
    let lastFocus = null;
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () =>
      Array.from(mobileNav.querySelectorAll(focusableSelector)).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
      );
    const close = () => {
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus();
      }
    };
    const open = () => {
      lastFocus = document.activeElement;
      mobileNav.classList.add('open');
      mobileNav.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      document.body.style.overflow = 'hidden';
      // Focus first focusable element inside the sheet
      const focusables = getFocusable();
      if (focusables.length) {
        // Defer one frame so the sheet is visible and focusable
        requestAnimationFrame(() => focusables[0].focus());
      }
    };
    toggle.addEventListener('click', () => {
      if (mobileNav.classList.contains('open')) close();
      else open();
    });
    mobileNav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', close)
    );
    document.addEventListener('keydown', (e) => {
      if (!mobileNav.classList.contains('open')) return;
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key === 'Tab') {
        // Focus trap: keep focus inside the mobile sheet
        const focusables = getFocusable();
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  // FAQ — one open at a time
  const faqItems = document.querySelectorAll('#faqList .faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  // Reveal-on-scroll
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  const reveals = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  }

  // Blurred vendor names are decorative — hide from screen readers
  document.querySelectorAll('.vendor-blur').forEach((el) => {
    el.setAttribute('aria-hidden', 'true');
  });

  // Decorative SVG icons inside buttons/links — hide from screen readers
  document.querySelectorAll('button svg, a svg').forEach((svg) => {
    if (!svg.hasAttribute('aria-hidden') && !svg.hasAttribute('aria-label')) {
      svg.setAttribute('aria-hidden', 'true');
    }
  });

  // Active section highlighting as user scrolls
  if ('IntersectionObserver' in window) {
    const navLinks = document.querySelectorAll('.primary-nav a[href^="#"]');
    const sections = [];
    navLinks.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) sections.push({ link, el });
    });
    if (sections.length) {
      const navIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const match = sections.find((s) => s.el === entry.target);
            if (!match) return;
            if (entry.isIntersecting) {
              navLinks.forEach((l) => l.classList.remove('is-active'));
              match.link.classList.add('is-active');
            }
          });
        },
        { threshold: 0.4, rootMargin: '-80px 0px -40% 0px' }
      );
      sections.forEach((s) => navIo.observe(s.el));
    }
  }

  // Smooth anchor scrolling (respect sticky header)
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const y = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
})();

// ── Video modal ───────────────────────────────────────────────
(() => {
  const btn = document.getElementById('videoPlayBtn');
  const modal = document.getElementById('videoModal');
  const player = document.getElementById('videoPlayer');
  if (!btn || !modal || !player) return;

  function open() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Start from the beginning, try to autoplay
    try { player.currentTime = 0; } catch (e) {}
    const p = player.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { /* autoplay blocked — user can tap play */ });
    }
  }
  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    try { player.pause(); } catch (e) {}
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    open();
  });
  modal.querySelectorAll('[data-video-close]').forEach((el) => {
    el.addEventListener('click', close);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
})();
