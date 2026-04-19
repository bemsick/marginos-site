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
    const close = () => {
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    };
    const open = () => {
      mobileNav.classList.add('open');
      mobileNav.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      document.body.style.overflow = 'hidden';
    };
    toggle.addEventListener('click', () => {
      if (mobileNav.classList.contains('open')) close();
      else open();
    });
    mobileNav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', close)
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) close();
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
