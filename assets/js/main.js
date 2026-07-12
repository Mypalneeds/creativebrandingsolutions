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

});