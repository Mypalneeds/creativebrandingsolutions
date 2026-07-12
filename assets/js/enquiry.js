/* Enquiry cart — lets visitors add portfolio items to a running list, then
   send the whole list to WhatsApp in one message. Persisted in localStorage
   so it survives navigating between pages (this is a static multi-page
   site, not a single-page app). Included on every page via a <script> tag. */
(function () {
  'use strict';

  var CART_KEY = 'cbs_enquiry_cart';
  var WA_NUMBER = '2348060001122';

  function getCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* storage unavailable */ }
  }
  function isInCart(id) {
    return getCart().some(function (item) { return item.id === id; });
  }
  function addToCart(item) {
    var cart = getCart();
    if (cart.some(function (c) { return c.id === item.id; })) return cart;
    cart.push(item);
    saveCart(cart);
    return cart;
  }
  function removeFromCart(id) {
    var cart = getCart().filter(function (c) { return c.id !== id; });
    saveCart(cart);
    return cart;
  }
  function clearCart() { saveCart([]); }

  function buildWhatsAppLink(cart) {
    var lines = ["Hi Creative Branding Solutions, I'd like to enquire about the following:", ''];
    cart.forEach(function (item, i) {
      lines.push((i + 1) + '. ' + item.name + (item.cat ? ' — ' + item.cat : ''));
    });
    lines.push('', 'Please could you share pricing and lead time. Thank you!');
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    var badge = document.getElementById('enquiryBadge');
    var floatBtn = document.getElementById('enquiryFloat');
    var drawer = document.getElementById('enquiryDrawer');
    var overlay = document.getElementById('enquiryOverlay');
    var closeBtn = document.getElementById('enquiryCloseBtn');
    var listEl = document.getElementById('enquiryList');
    var emptyEl = document.getElementById('enquiryEmpty');
    var sendBtn = document.getElementById('enquirySendBtn');
    var clearBtn = document.getElementById('enquiryClearBtn');

    function refreshBadge() {
      if (!badge) return;
      var count = getCart().length;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }

    function refreshList() {
      if (!listEl) return;
      var cart = getCart();
      listEl.innerHTML = '';
      if (cart.length === 0) {
        if (emptyEl) emptyEl.style.display = 'block';
        if (sendBtn) sendBtn.setAttribute('disabled', 'disabled');
      } else {
        if (emptyEl) emptyEl.style.display = 'none';
        if (sendBtn) sendBtn.removeAttribute('disabled');
        cart.forEach(function (item) {
          var row = document.createElement('div');
          row.className = 'enquiry-row';
          row.innerHTML =
            '<div><strong></strong><span></span></div>' +
            '<button type="button" class="enquiry-remove" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>';
          row.querySelector('strong').textContent = item.name;
          row.querySelector('span').textContent = item.cat || '';
          row.querySelector('.enquiry-remove').setAttribute('data-id', item.id);
          listEl.appendChild(row);
        });
      }
      refreshBadge();
    }

    function openDrawer() {
      if (!drawer) return;
      refreshList();
      drawer.classList.add('is-open');
      if (overlay) overlay.classList.add('is-visible');
      document.body.classList.add('nav-open');
    }
    function closeDrawer() {
      if (!drawer) return;
      drawer.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-visible');
      document.body.classList.remove('nav-open');
    }

    if (floatBtn) floatBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

    if (listEl) {
      listEl.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.enquiry-remove') : null;
        if (!btn) return;
        removeFromCart(btn.getAttribute('data-id'));
        refreshList();
        syncAddButtons();
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', function () {
        var cart = getCart();
        if (cart.length === 0) return;
        window.open(buildWhatsAppLink(cart), '_blank');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        clearCart();
        refreshList();
        syncAddButtons();
      });
    }

    /* "Add to Enquiry" buttons — currently on the portfolio grid, but any
       page can opt in just by adding a button with these data attributes. */
    function syncAddButtons() {
      document.querySelectorAll('.enquiry-add-btn').forEach(function (btn) {
        var id = btn.getAttribute('data-id');
        if (isInCart(id)) {
          btn.classList.add('is-added');
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
        } else {
          btn.classList.remove('is-added');
          btn.innerHTML = '<i class="fa-solid fa-plus"></i> Enquire';
        }
      });
    }
    document.querySelectorAll('.enquiry-add-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var id = btn.getAttribute('data-id');
        if (isInCart(id)) {
          removeFromCart(id);
        } else {
          addToCart({ id: id, name: btn.getAttribute('data-name'), cat: btn.getAttribute('data-cat') || '' });
          if (badge) {
            badge.classList.remove('pulse');
            void badge.offsetWidth; // restart animation
            badge.classList.add('pulse');
          }
        }
        syncAddButtons();
        refreshBadge();
      });
    });

    refreshBadge();
    syncAddButtons();
  });
})();
