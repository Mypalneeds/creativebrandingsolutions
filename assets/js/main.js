document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.navtoggle');
  var links = document.querySelector('.navlinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.style.display === 'flex';
      links.style.display = open ? 'none' : 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.top = '100%';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = '#ffffff';
      links.style.padding = '18px 24px';
      links.style.borderBottom = '1px solid #e4e1d6';
      links.style.gap = '18px';
      links.style.zIndex = '150';
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