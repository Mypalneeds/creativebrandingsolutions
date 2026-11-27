/* Creative Branding Solutions — site behaviour (small, dependency-free) */
document.addEventListener('DOMContentLoaded', function () {
  var body = document.body;

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav-menu');
  var overlay = document.querySelector('.nav-overlay');
  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.classList.toggle('is-open', open);
    if (overlay) overlay.classList.toggle('is-visible', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    body.classList.toggle('nav-open', open);
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function (e) { e.stopPropagation(); setMenu(!menu.classList.contains('is-open')); });
    if (overlay) overlay.addEventListener('click', function () { setMenu(false); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });
  }

  /* ---- Services dropdown (hover on desktop via CSS, tap/keyboard via the caret) ---- */
  var dd = document.querySelector('.nav-item.has-dropdown');
  var caret = dd ? dd.querySelector('.nav-caret') : null;
  if (dd && caret) {
    caret.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var open = dd.classList.toggle('is-open');
      caret.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) { dd.classList.remove('is-open'); caret.setAttribute('aria-expanded', 'false'); } });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    setMenu(false);
    if (dd) dd.classList.remove('is-open');
  });

  /* ---- Header shadow on scroll ---- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- FAQ accordion ---- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var q = item.querySelector('.faq-question');
    if (!q) return;
    q.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');
    q.addEventListener('click', function () {
      var wasOpen = item.classList.contains('is-open');
      faqItems.forEach(function (i) {
        i.classList.remove('is-open');
        var b = i.querySelector('.faq-question'); if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) { item.classList.add('is-open'); q.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---- Portfolio filter tabs (+ deep links such as portfolio.html#launch) ---- */
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
        var visible = 0;
        items.forEach(function (item) {
          var match = filter === 'all' || item.getAttribute('data-cat') === filter;
          item.classList.toggle('is-hidden', !match);
          if (match) visible++;
        });
        if (emptyMsg) emptyMsg.style.display = visible === 0 ? 'block' : 'none';
      });
    });
    var hash = (window.location.hash || '').replace('#', '');
    if (hash) tabs.forEach(function (t) { if (t.getAttribute('data-filter') === hash) t.click(); });
  }

  /* ---- Quote form (demo submit: confirms on the page) ---- */
  var form = document.querySelector('#quoteForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.querySelector('#formNote');
      if (note) {
        note.textContent = 'Thanks, your request has been noted. Our team will reach out within one business day.';
        note.style.display = 'block';
      }
      form.reset();
    });
  }

  /* ---- Gentle rise-in for cards (transform only, text is never faded) ---- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    var targets = document.querySelectorAll('.pillar, .occ, .step, .card, .post, .value, .work-grid figure, .svc-row, .info, .faq-item');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          el.classList.add('is-in'); io.unobserve(el);
          // Drop the reveal classes afterwards so hover transforms work normally.
          setTimeout(function () { el.classList.remove('reveal', 'is-in'); }, 800);
        }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 80px 0px' });
    targets.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
});

/* Hero photo cards: each card cycles through its own photos with a fade, staggered so they never change together */
(function () {
  var cards = document.querySelectorAll('.slide-card');
  if (!cards.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  cards.forEach(function (card) {
    var imgs = card.querySelectorAll('img');
    if (imgs.length < 2) return;
    var i = 0;
    function next() {
      imgs[i].classList.remove('is-active');
      i = (i + 1) % imgs.length;
      imgs[i].removeAttribute('aria-hidden');
      imgs[i].classList.add('is-active');
    }
    setTimeout(function () { setInterval(function () { if (!document.hidden) next(); }, 3900); }, 1800 + parseInt(card.getAttribute('data-delay') || '0', 10));
  });
})();
