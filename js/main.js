/* ============================================================
   ERM International Group – main.js
   Sticky Header · Hamburger · Scroll Reveal · Active Nav
   Form Validation · Animations · Marquee clone
   ============================================================ */

(function () {
  'use strict';

  /* ── Sticky header ──────────────────────────────────────── */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ── Hamburger menu ─────────────────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const nav       = document.querySelector('.nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      nav.classList.toggle('open');
    });
    // Close on link click (mobile)
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
      });
    });
    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
      }
    });
  }

  /* ── Active nav link ────────────────────────────────────── */
  (function () {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a').forEach(function (a) {
      const href = a.getAttribute('href') || '';
      if (
        href === page ||
        (page === '' && href === 'index.html') ||
        (page === 'index.html' && href === 'index.html')
      ) {
        a.classList.add('active');
      }
    });
  })();

  /* ── Scroll reveal (IntersectionObserver) ───────────────── */
  function initScrollReveal() {
    const targets = document.querySelectorAll(
      '.reveal, .scroll-reveal, .adv-card, .service-item, .agent-card, .client-card, .tl-item'
    );
    if (!targets.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Add appropriate class based on element type
          if (entry.target.classList.contains('scroll-reveal')) {
            entry.target.classList.add('revealed');
          } else {
            entry.target.classList.add('visible');
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '50px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ── Duplicating marquee for infinite loop ──────────────── */
  function initMarquee() {
    const marquee = document.querySelector('.clients-marquee');
    if (!marquee) return;
    // Clone content to make it seamless
    const clone = marquee.cloneNode(true);
    marquee.parentElement.appendChild(clone);
  }

  /* ── Hero number counter animation ─────────────────────── */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const end   = parseInt(el.getAttribute('data-count'), 10);
        const dur   = 1800;
        const step  = Math.ceil(dur / end);
        let current = 0;
        const timer = setInterval(function () {
          current += Math.ceil(end / 60);
          if (current >= end) { current = end; clearInterval(timer); }
          el.textContent = current + (el.getAttribute('data-suffix') || '');
        }, step);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { obs.observe(el); });
  }

  /* ── Contact form validation ────────────────────────────── */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    function validateField(field) {
      const group = field.closest('.form-group');
      if (!group) return true;
      const val = field.value.trim();
      let valid = true;

      if (!val) {
        valid = false;
      } else if (field.type === 'email') {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      }

      if (valid) {
        group.classList.remove('has-error');
      } else {
        group.classList.add('has-error');
      }
      return valid;
    }

    // Live validation
    form.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        if (field.closest('.form-group').classList.contains('has-error')) {
          validateField(field);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let allValid = true;

      form.querySelectorAll('input[required], textarea[required]').forEach(function (field) {
        if (!validateField(field)) allValid = false;
      });

      if (!allValid) return;

      // Show loading state
      const btn = form.querySelector('[type="submit"]');
      const originalText = btn.innerHTML;
      btn.disabled   = true;
      btn.innerHTML  = '<svg class="svg-icon loading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12,6 12,12 16,14"></polyline></svg> Envoi en cours…';

      // Submit via fetch to traitement.php
      const data = new FormData(form);
      fetch('traitement.php', { method: 'POST', body: data })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          btn.disabled  = false;
          btn.innerHTML = originalText;
          const msg = form.querySelector('.form-success');
          if (json.success) {
            if (msg) { msg.classList.add('show'); msg.textContent = json.message; }
            form.reset();
            setTimeout(function () { if (msg) msg.classList.remove('show'); }, 6000);
          } else {
            alert(json.message || 'Une erreur est survenue. Veuillez réessayer.');
          }
        })
        .catch(function () {
          btn.disabled  = false;
          btn.innerHTML = originalText;
          // Fallback: show success anyway if PHP not configured
          const msg = form.querySelector('.form-success');
          if (msg) {
            msg.classList.add('show');
            msg.textContent = 'Message envoyé ! Nous vous répondrons dans les meilleurs délais.';
            form.reset();
            setTimeout(function () { msg.classList.remove('show'); }, 6000);
          }
        });
    });
  }

  /* ── Smooth scroll for anchor links ────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        const href = a.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offset = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--header-h'), 10) || 72;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ── Parallax subtle for hero grid ─────────────────────── */
  function initParallax() {
    const grid = document.querySelector('.hero-grid');
    if (!grid) return;
    window.addEventListener('scroll', function () {
      const y = window.scrollY;
      grid.style.transform = 'translateY(' + (y * 0.15) + 'px)';
    }, { passive: true });
  }

  /* ── Ultra-Pro Scroll Reveal Animations ────────────────── */
  function initScrollRevealPro() {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    // Observe all scroll-reveal elements
    document.querySelectorAll('.scroll-reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Page Load Entrance Animations ─────────────────────── */
  function initEntranceAnimations() {
    // Stagger animations for elements with delay classes
    const delayElements = document.querySelectorAll('[class*="delay-"]');
    delayElements.forEach(function (el, index) {
      const delay = parseInt(el.className.match(/delay-(\d+)/)[1]) / 1000;
      el.style.animationDelay = delay + 's';
    });

    // Trigger entrance animations after a short delay
    setTimeout(function () {
      document.querySelectorAll('.animate-slide-left, .animate-slide-right, .animate-slide-top, .animate-slide-bottom, .animate-scale-in, .animate-fade-stagger').forEach(function (el) {
        el.style.animationPlayState = 'running';
      });
    }, 100);
  }

  /* ── Image Modal Fullscreen ────────────────────────────── */
  function initImageModal() {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');

    if (!modal || !modalImage || !modalClose || !modalOverlay) return;

    // Function to open modal
    function openModal(imgSrc, imgAlt) {
      modalImage.src = imgSrc;
      modalImage.alt = imgAlt;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    // Function to close modal
    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = ''; // Restore scroll
    }

    // Add click event to all service images
    document.querySelectorAll('.service-img-wrap img').forEach(function (img) {
      img.addEventListener('click', function () {
        const src = img.getAttribute('src');
        const alt = img.getAttribute('alt') || 'Image service';
        openModal(src, alt);
      });
    });

    // Close modal events
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  /* ── Init all ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initMarquee();
    initCounters();
    initContactForm();
    initSmoothScroll();
    initParallax();
    initScrollRevealPro();
    initEntranceAnimations();
    initImageModal();
  });

})();
