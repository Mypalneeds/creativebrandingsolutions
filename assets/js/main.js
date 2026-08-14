document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle — class-based so it never fights the CSS breakpoints
  // (the old version wrote inline display:none/flex, which could get stuck
  // and hide the nav on desktop after a resize).
  var toggle = document.querySelector('.navtoggle');
  var links = document.querySelector('.navlinks');
  var navOverlay = document.querySelector('.nav-overlay');

  if (toggle && links) {
    toggle.setAttribute('aria-expanded', 'false');

    function openMenu() {
      links.classList.add('is-open');
      toggle.classList.add('is-active');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      if (navOverlay) navOverlay.classList.add('is-visible');
      document.body.classList.add('nav-open');
    }
    function closeMenu() {
      links.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      if (navOverlay) navOverlay.classList.remove('is-visible');
      document.body.classList.remove('nav-open');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (links.classList.contains('is-open')) closeMenu(); else openMenu();
    });

    // Close the menu whenever a nav link is tapped.
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    // Close on outside tap/click.
    if (navOverlay) navOverlay.addEventListener('click', closeMenu);
    document.addEventListener('click', function (e) {
      if (links.classList.contains('is-open') && !links.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape, and if the viewport is resized back to desktop.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  // Hero slider
  var slider = document.querySelector('#heroSlider');
  if (slider) {
    var slides = slider.querySelectorAll('.hero-slide');
    var dots = slider.querySelectorAll('.hero-dot');
    var prevBtn = slider.querySelector('.hero-arrow-prev');
    var nextBtn = slider.querySelector('.hero-arrow-next');
    var current = 0;
    var timer;

    function goTo(index) {
      slides[current].classList.remove('is-active');
      dots[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dots[current].classList.add('is-active');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAutoplay() {
      timer = setInterval(next, 6000);
    }
    function stopAutoplay() {
      clearInterval(timer);
    }

    if (nextBtn) nextBtn.addEventListener('click', function () { next(); stopAutoplay(); startAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); stopAutoplay(); startAutoplay(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); stopAutoplay(); startAutoplay(); });
    });
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);

    if (slides.length > 1) startAutoplay();
  }

  // Filterable galleries (Portfolio, Mockups, etc.)
  var gallery = document.querySelector('.gallery');
  var tabs = document.querySelectorAll('.filter-tab');
  if (gallery && tabs.length) {
    var items = gallery.querySelectorAll('figure[data-cat]');
    var emptyMsg = document.querySelector('.filter-empty');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');

        var filter = tab.getAttribute('data-filter');
        var visibleCount = 0;

        items.forEach(function (item) {
          var match = filter === 'all' || item.getAttribute('data-cat') === filter;
          item.classList.toggle('is-hidden', !match);
          if (match) visibleCount++;
        });

        if (emptyMsg) emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
      });
    });
  }

  // FAQ accordion
  var faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length) {
    faqItems.forEach(function (item) {
      var question = item.querySelector('.faq-question');
      if (!question) return;
      question.addEventListener('click', function () {
        var wasOpen = item.classList.contains('is-open');
        faqItems.forEach(function (i) { i.classList.remove('is-open'); });
        if (!wasOpen) item.classList.add('is-open');
      });
    });
  }

  // Contact form: friendly demo submit
  var form = document.querySelector('#quoteForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.querySelector('#formNote');
      if (note) {
        note.textContent = "Thanks — your request has been noted. Our team will reach out within one business day.";
        note.style.display = 'block';
      }
      form.reset();
    });
  }

  // ---------------------------------------------------------------------
  // Nav shrink on scroll
  // ---------------------------------------------------------------------
  var navwrap = document.querySelector('.navwrap');
  if (navwrap) {
    var onNavScroll = function () {
      navwrap.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onNavScroll();
    window.addEventListener('scroll', onNavScroll, { passive: true });
  }

  // ---------------------------------------------------------------------
  // Scroll-reveal: fade + rise elements into view as the page is scrolled.
  // Selectors are broad on purpose so every page benefits without needing
  // per-page markup changes. JS-only: with JS disabled nothing is hidden.
  // ---------------------------------------------------------------------
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealSelectors = [
      '.section-head', '.why-card', '.svc-card', '.case-card', '.blog-card',
      '.group-card', '.testi-card', '.value-card', '.leader-card',
      '.process-step', '.tier-card', '.tier-wrap > div:first-child',
      '.studio-teaser-copy', '.studio-teaser-media img', '.about-hero > div',
      '.about-hero > img', '.faq-item', '.contact-card', '.timeline-item',
      '.gallery figure'
    ];
    var revealEls = document.querySelectorAll(revealSelectors.join(','));

    revealEls.forEach(function (el, i) {
      el.classList.add('reveal-init');
      // Small stagger for siblings sitting in the same grid/row.
      var delay = (i % 4) * 90;
      el.style.transitionDelay = delay + 'ms';
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.classList.add('is-visible');
          revealObserver.unobserve(el);
          // Once the reveal transition finishes, drop the reveal-only
          // classes so each component's own hover transitions (e.g. the
          // fast .2s card-lift on hover) regain control of `transform`.
          var cleanup = function () {
            el.classList.remove('reveal-init', 'is-visible');
            el.style.transitionDelay = '';
          };
          el.addEventListener('transitionend', cleanup, { once: true });
          setTimeout(cleanup, 1400); // fallback in case transitionend never fires
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  // ---------------------------------------------------------------------
  // Animated stat counters (hero stats + the bold stats strip)
  // ---------------------------------------------------------------------
  var statEls = document.querySelectorAll('.hero-stats .stat b, .strip .stat b');
  if (statEls.length && 'IntersectionObserver' in window && !reduceMotion) {
    var animateCount = function (el) {
      var raw = el.textContent.trim();
      var match = raw.match(/^([^\d]*)([\d,.]+)(.*)$/);
      if (!match) return; // no digits to animate (e.g. plain text) — leave as-is
      var prefix = match[1];
      var numText = match[2];
      var suffix = match[3];
      var hasDecimal = numText.indexOf('.') !== -1;
      var target = parseFloat(numText.replace(/,/g, ''));
      if (isNaN(target)) return;

      var duration = 1200;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = target * eased;
        var display = hasDecimal ? current.toFixed(1) : Math.round(current).toLocaleString();
        el.textContent = prefix + display + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + numText + suffix;
        }
      }
      requestAnimationFrame(step);
    };

    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statEls.forEach(function (el) { statObserver.observe(el); });
  }

  // ---------------------------------------------------------------------
  // Typewriter effect for key headlines (hero + inner-page pageheads).
  // Accessible by design: the element's real HTML stays exactly as
  // authored — we only visually animate a cloned, aria-hidden copy, and
  // leave a screen-reader-only copy of the true text in place throughout.
  // With JS disabled or prefers-reduced-motion, nothing changes at all.
  // ---------------------------------------------------------------------
  function typewriter(el, opts) {
    if (!el || el.dataset.typewriterInit === 'true') return null;
    opts = opts || {};
    var speed = opts.speed || 32;

    var originalHTML = el.innerHTML.trim();
    if (!originalHTML) return null;

    // Tokenise into tags vs. individual characters so we can reveal the
    // markup progressively without breaking nested tags like <em>.
    var tokens = originalHTML.split(/(<[^>]+>)/).filter(function (t) { return t.length; });
    var chars = [];
    tokens.forEach(function (t) {
      if (t.charAt(0) === '<') { chars.push(t); } else { chars.push.apply(chars, t.split('')); }
    });

    el.dataset.typewriterInit = 'true';
    el.setAttribute('aria-hidden', 'true');

    // Screen-reader-accessible, always-complete copy of the real text.
    var srCopy = document.createElement('span');
    srCopy.className = 'sr-only';
    srCopy.textContent = el.textContent;
    el.parentNode.insertBefore(srCopy, el.nextSibling);

    var i = 0;
    var timer = null;
    var cursorHTML = '<span class="type-cursor"></span>';
    var cursorDoneHTML = '<span class="type-cursor is-done"></span>';

    // Rebuilding the full innerHTML on every keystroke (rather than
    // inserting one token at a time into a live cursor node) matters here:
    // the browser only auto-closes an unclosed tag like "<em>" when it
    // parses a *complete* fragment in one go, so each step must re-parse
    // the whole partial string for nested tags (e.g. <em>) to stay open.
    function step() {
      if (i < chars.length) {
        i++;
        el.innerHTML = chars.slice(0, i).join('') + cursorHTML;
        timer = setTimeout(step, speed + (Math.random() * 24 - 12));
      } else {
        el.innerHTML = chars.join('') + cursorDoneHTML;
      }
    }

    function run() {
      i = 0;
      clearTimeout(timer);
      el.innerHTML = cursorHTML;
      timer = setTimeout(step, opts.delay || 250);
    }

    run();
    return { run: run };
  }

  var reduceMotionForType = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotionForType) {
    // Inner-page hero banners (About, Services, Portfolio, Contact, etc.)
    var pageheadH1 = document.querySelector('.pagehead h1');
    if (pageheadH1) typewriter(pageheadH1, { speed: 30, delay: 300 });

    // Homepage hero slider: type the active slide's headline, and
    // retype whenever the slider rotates to a new (or repeated) slide.
    var heroSliderEl = document.querySelector('#heroSlider');
    if (heroSliderEl) {
      var typedInstances = new WeakMap();
      var typeActiveSlide = function () {
        var activeHeading = heroSliderEl.querySelector('.hero-slide.is-active .hero-content h1, .hero-slide.is-active .hero-content h2');
        if (!activeHeading) return;
        if (typedInstances.has(activeHeading)) {
          typedInstances.get(activeHeading).run();
        } else {
          var inst = typewriter(activeHeading, { speed: 26, delay: 350 });
          if (inst) typedInstances.set(activeHeading, inst);
        }
      };
      typeActiveSlide();
      // Re-type on every slide change (autoplay tick or manual nav/dots).
      var sliderObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          if (m.attributeName === 'class' && m.target.classList.contains('is-active')) {
            typeActiveSlide();
          }
        });
      });
      heroSliderEl.querySelectorAll('.hero-slide').forEach(function (slide) {
        sliderObserver.observe(slide, { attributes: true });
      });
    }
  }

});