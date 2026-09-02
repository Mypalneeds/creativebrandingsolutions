/* ============================================================
   Creative Branding Solutions — Mockup Studio
   Vector product library — clean flat-vector illustrations (not photos)
   for every library product, front AND back where the product has a
   meaningful back view, rotate-only where it doesn't. Because it's
   vector, the whole product can be dragged anywhere on the canvas,
   spun to any angle with the rotate handle, recoloured with a true
   fill (solid or gradient — no photo-multiply trick needed) and the
   uploaded logo rides along on top, rotating with the product.
   Uploading your own mockup photo still works exactly as before — a
   fixed base image with a multiply-blend recolor layer — since an
   arbitrary photo can't be vectorised or safely rotated as a shape.
   ============================================================ */

(function () {
  var canvasEl = document.getElementById('studioCanvas');
  if (!canvasEl) return; // only run this script on the Studio page

  var PRODUCT_BOX = 240; // matches .product-mount { width/height } in CSS

  /* ---------- Product art library ----------
     Every shape meant to take the chosen colour carries class="jc-fill";
     everything else (seams, straps, shading) is a fixed detail baked
     into the art so it reads the same regardless of colour. All art
     lives in a 300x300 local box; logoAnchor values are offsets (in
     that same 240px on-screen box) from the product's own centre. */
  var products = [
    { id: 'tshirt', name: 'T-Shirt', cat: 'apparel', defaultColor: '#ffffff', hasBack: true, logoScale: 1,
      logoAnchor: { front: { x: 0, y: -32 }, back: { x: 0, y: -38 } },
      front: '<path class="jc-fill" d="M105,58 Q150,80 195,58 L232,92 L206,120 L206,254 Q150,268 94,254 L94,120 L68,92 Z"/>' +
             '<path d="M105,58 Q150,80 195,58" fill="none" stroke="#1b2a3d" stroke-opacity="0.3" stroke-width="3"/>' +
             '<path d="M94,120 L68,92 M206,120 L232,92" fill="none" stroke="#1b2a3d" stroke-opacity="0.25" stroke-width="2"/>' +
             '<path d="M94,254 Q150,268 206,254" fill="none" stroke="#1b2a3d" stroke-opacity="0.18" stroke-width="2"/>' +
             '<path d="M105,58 Q150,80 195,58 L188,68 Q150,86 112,68 Z" fill="#000" fill-opacity="0.12"/>',
      back:  '<path class="jc-fill" d="M100,60 L150,72 L200,60 L232,92 L206,120 L206,254 Q150,268 94,254 L94,120 L68,92 Z"/>' +
             '<path d="M100,60 L150,72 L200,60" fill="none" stroke="#1b2a3d" stroke-opacity="0.3" stroke-width="3"/>' +
             '<path d="M150,74 L150,250" fill="none" stroke="#1b2a3d" stroke-opacity="0.14" stroke-width="1.5" stroke-dasharray="2 5"/>' +
             '<path d="M94,120 L68,92 M206,120 L232,92" fill="none" stroke="#1b2a3d" stroke-opacity="0.25" stroke-width="2"/>' },

    { id: 'hoodie', name: 'Hoodie', cat: 'apparel', defaultColor: '#ffffff', hasBack: true, logoScale: 1,
      logoAnchor: { front: { x: 0, y: -18 }, back: { x: 0, y: -30 } },
      front: '<path d="M110,52 Q150,30 190,52 Q205,60 195,78 Q150,64 105,78 Q95,60 110,52 Z" fill="#000" fill-opacity="0.10"/>' +
             '<path class="jc-fill" d="M100,70 Q150,90 200,70 L238,105 L210,135 L210,258 Q150,272 90,258 L90,135 L62,105 Z"/>' +
             '<path d="M108,72 Q150,92 192,72" fill="none" stroke="#1b2a3d" stroke-opacity="0.3" stroke-width="3"/>' +
             '<path d="M118,195 L118,241 Q150,250 182,241 L182,195" fill="none" stroke="#1b2a3d" stroke-opacity="0.35" stroke-width="2"/>' +
             '<path d="M138,90 L134,124 M162,90 L166,124" fill="none" stroke="#1b2a3d" stroke-opacity="0.3" stroke-width="2.5" stroke-linecap="round"/>',
      back:  '<path class="jc-fill" d="M105,50 Q150,26 195,50 Q212,62 200,90 Q150,72 100,90 Q88,62 105,50 Z"/>' +
             '<path d="M105,50 Q150,26 195,50" fill="none" stroke="#1b2a3d" stroke-opacity="0.3" stroke-width="3"/>' +
             '<path class="jc-fill" d="M100,88 Q150,106 200,88 L238,105 L210,135 L210,258 Q150,272 90,258 L90,135 L62,105 Z"/>' +
             '<path d="M150,108 L150,250" fill="none" stroke="#1b2a3d" stroke-opacity="0.14" stroke-width="1.5" stroke-dasharray="2 5"/>' },

    { id: 'cap', name: 'Cap', cat: 'apparel', defaultColor: '#00355F', hasBack: true, logoScale: 0.5,
      logoAnchor: { front: { x: 0, y: -20 }, back: { x: 0, y: -8 } },
      front: '<path class="jc-fill" d="M85,155 Q88,70 150,62 Q212,70 215,155 Z"/>' +
             '<path d="M150,62 L150,155" fill="none" stroke="#1b2a3d" stroke-opacity="0.2" stroke-width="1.5"/>' +
             '<path d="M110,90 L120,150 M190,90 L180,150" fill="none" stroke="#1b2a3d" stroke-opacity="0.2" stroke-width="1.5"/>' +
             '<circle cx="150" cy="66" r="6" fill="#1b2a3d" fill-opacity="0.3"/>' +
             '<path class="jc-fill" d="M70,155 Q150,182 230,155 Q150,168 70,155 Z"/>' +
             '<path d="M85,155 Q88,70 150,62 Q120,80 110,155 Z" fill="#fff" fill-opacity="0.12"/>',
      back:  '<path class="jc-fill" d="M85,150 Q88,68 150,60 Q212,68 215,150 Q215,158 205,160 L195,148 Q205,150 205,140 Q198,90 150,82 Q102,90 95,140 Q95,150 105,148 L95,160 Q85,158 85,150 Z"/>' +
             '<rect x="140" y="150" width="20" height="14" rx="3" fill="#1b2a3d" fill-opacity="0.35"/>' +
             '<path d="M130,160 L110,172 M170,160 L190,172" fill="none" stroke="#1b2a3d" stroke-opacity="0.3" stroke-width="4" stroke-linecap="round"/>' },

    { id: 'totebag', name: 'Tote Bag', cat: 'bags', defaultColor: '#efe4d0', hasBack: true, logoScale: 0.85,
      logoAnchor: { front: { x: 0, y: 10 }, back: { x: 0, y: 10 } },
      front: '<path d="M112,95 Q112,50 150,50 Q188,50 188,95" fill="none" stroke="#1b2a3d" stroke-opacity="0.4" stroke-width="6" stroke-linecap="round"/>' +
             '<rect class="jc-fill" x="75" y="95" width="150" height="165" rx="4"/>' +
             '<path d="M75,95 L225,95 L225,113 L75,113 Z" fill="#000" fill-opacity="0.08"/>',
      back:  '<path d="M112,95 Q112,50 150,50 Q188,50 188,95" fill="none" stroke="#1b2a3d" stroke-opacity="0.4" stroke-width="6" stroke-linecap="round"/>' +
             '<rect class="jc-fill" x="75" y="95" width="150" height="165" rx="4"/>' +
             '<rect x="130" y="180" width="40" height="24" rx="4" fill="none" stroke="#1b2a3d" stroke-opacity="0.25" stroke-width="1.5"/>' },

    { id: 'backpack', name: 'Backpack', cat: 'bags', defaultColor: '#111111', hasBack: true, logoScale: 0.7,
      logoAnchor: { front: { x: 0, y: -10 }, back: { x: 0, y: -30 } },
      front: '<path d="M95,100 Q80,150 90,240" fill="none" stroke="#1b2a3d" stroke-opacity="0.35" stroke-width="10" stroke-linecap="round"/>' +
             '<path d="M205,100 Q220,150 210,240" fill="none" stroke="#1b2a3d" stroke-opacity="0.35" stroke-width="10" stroke-linecap="round"/>' +
             '<rect class="jc-fill" x="85" y="80" width="130" height="185" rx="18"/>' +
             '<rect x="105" y="150" width="90" height="80" rx="12" fill="#000" fill-opacity="0.10"/>' +
             '<rect x="130" y="60" width="40" height="22" rx="10" fill="none" stroke="#1b2a3d" stroke-opacity="0.35" stroke-width="5"/>' +
             '<path d="M85,84 Q150,72 215,84" fill="#fff" fill-opacity="0.12"/>',
      back:  '<rect class="jc-fill" x="85" y="80" width="130" height="185" rx="18"/>' +
             '<path d="M110,80 Q100,170 112,260" fill="none" stroke="#1b2a3d" stroke-opacity="0.4" stroke-width="9" stroke-linecap="round"/>' +
             '<path d="M190,80 Q200,170 188,260" fill="none" stroke="#1b2a3d" stroke-opacity="0.4" stroke-width="9" stroke-linecap="round"/>' +
             '<rect x="130" y="60" width="40" height="22" rx="10" fill="none" stroke="#1b2a3d" stroke-opacity="0.35" stroke-width="5"/>' },

    { id: 'mug', name: 'Coffee Mug', cat: 'drinkware', defaultColor: '#ffffff', hasBack: false, logoScale: 0.45,
      logoAnchor: { front: { x: 0, y: 0 }, back: { x: 0, y: 0 } },
      front: '<path class="jc-fill" d="M95,90 L205,90 L198,225 Q150,240 102,225 Z"/>' +
             '<path d="M205,110 Q245,120 245,155 Q245,190 202,196" fill="none" stroke="#1b2a3d" stroke-opacity="0.4" stroke-width="10"/>' +
             '<path d="M95,90 L205,90 L202,105 L98,105 Z" fill="#000" fill-opacity="0.12"/>' +
             '<path d="M110,110 L104,215" fill="none" stroke="#fff" stroke-opacity="0.25" stroke-width="6" stroke-linecap="round"/>' },

    { id: 'bottle', name: 'Water Bottle', cat: 'drinkware', defaultColor: '#0891b2', hasBack: false, logoScale: 0.4,
      logoAnchor: { front: { x: 0, y: 0 }, back: { x: 0, y: 0 } },
      front: '<rect x="128" y="45" width="44" height="26" rx="6" fill="#1b2a3d" fill-opacity="0.35"/>' +
             '<path class="jc-fill" d="M120,71 L180,71 L188,110 L188,250 Q150,262 112,250 L112,110 Z"/>' +
             '<path d="M120,71 L180,71 L184,90 L116,90 Z" fill="#000" fill-opacity="0.1"/>' +
             '<path d="M124,105 L120,240" fill="none" stroke="#fff" stroke-opacity="0.22" stroke-width="7" stroke-linecap="round"/>' },

    { id: 'phonecase', name: 'Phone Case', cat: 'tech', defaultColor: '#111111', hasBack: true, logoScale: 0.55,
      logoAnchor: { front: { x: 0, y: 60 }, back: { x: 0, y: 60 } },
      front: '<rect class="jc-fill" x="95" y="45" width="110" height="220" rx="24"/>' +
             '<rect x="103" y="58" width="94" height="150" rx="14" fill="#0b1220" fill-opacity="0.75"/>',
      back:  '<rect class="jc-fill" x="95" y="45" width="110" height="220" rx="24"/>' +
             '<rect x="118" y="62" width="52" height="52" rx="14" fill="#000" fill-opacity="0.18"/>' +
             '<circle cx="136" cy="80" r="10" fill="#1b2a3d" fill-opacity="0.4"/>' +
             '<circle cx="160" cy="80" r="10" fill="#1b2a3d" fill-opacity="0.4"/>' +
             '<circle cx="136" cy="102" r="7" fill="#1b2a3d" fill-opacity="0.3"/>' },

    { id: 'notebook', name: 'Notebook', cat: 'print', defaultColor: '#00355F', hasBack: true, logoScale: 0.7,
      logoAnchor: { front: { x: 6, y: 0 }, back: { x: 6, y: 0 } },
      front: '<rect class="jc-fill" x="80" y="55" width="150" height="195" rx="4"/>' +
             '<rect x="80" y="55" width="14" height="195" fill="#000" fill-opacity="0.18"/>' +
             '<line x1="205" y1="55" x2="205" y2="250" stroke="#1b2a3d" stroke-opacity="0.25" stroke-width="4"/>',
      back:  '<rect class="jc-fill" x="80" y="55" width="150" height="195" rx="4"/>' +
             '<rect x="80" y="55" width="14" height="195" fill="#000" fill-opacity="0.18"/>' +
             '<rect x="185" y="215" width="26" height="10" rx="5" fill="none" stroke="#1b2a3d" stroke-opacity="0.3" stroke-width="1.5"/>' },

    { id: 'pen', name: 'Pen', cat: 'print', defaultColor: '#F84520', hasBack: false, logoScale: 0.28,
      logoAnchor: { front: { x: 0, y: 15 }, back: { x: 0, y: 15 } },
      front: '<g transform="rotate(35 150 150)">' +
               '<rect class="jc-fill" x="135" y="60" width="30" height="160" rx="14"/>' +
               '<path d="M135,205 L165,205 L150,240 Z" fill="#1b2a3d" fill-opacity="0.5"/>' +
               '<rect x="135" y="80" width="30" height="18" fill="#000" fill-opacity="0.15"/>' +
               '<rect x="146" y="45" width="8" height="25" rx="3" fill="#1b2a3d" fill-opacity="0.4"/>' +
               '<line x1="142" y1="100" x2="142" y2="195" stroke="#fff" stroke-opacity="0.2" stroke-width="4"/>' +
             '</g>' }
  ];

  /* ---------- State ---------- */
  var currentProduct = products[0];
  var currentSide = 'front';
  var currentColor = '#ffffff';
  var colorMode = 'solid';
  var isCustomMockup = false;
  var currentPositionPreset = 'center';
  var logoDataUrl = null;

  var productPos = { x: 0, y: 0 };   // px offset of product-mount from canvas centre
  var productRot = 0;                 // degrees
  var logoOffset = { x: 0, y: 0 };    // px offset of logo from product-mount centre (local, pre-rotation)
  var logoSize = 110;                 // px, effective rendered size (base * product.logoScale)
  var logoSizeBase = 110;             // px, raw slider value chosen by the user

  /* ---------- DOM refs ---------- */
  var productGrid = document.getElementById('productGrid');
  var productSvg = document.getElementById('productSvg');
  var productArt = document.getElementById('productArt');
  var studioProductName = document.getElementById('studioProductName');
  var studioHint = document.getElementById('studioHint');
  var studioCredit = document.getElementById('studioCredit');
  var sideToggleBtn = document.getElementById('sideToggleBtn');
  var sideToggleLabel = document.getElementById('sideToggleLabel');
  var studioCanvas = document.getElementById('studioCanvas');
  var productMount = document.getElementById('productMount');
  var logoMount = document.getElementById('logoMount');
  var logoOverlay = document.getElementById('logoOverlay'); // <img> for the logo
  var rotateHandle = document.getElementById('rotateHandle');
  var customPhotoMount = document.getElementById('customPhotoMount');
  var mockupImage = document.getElementById('mockupImage');
  var mockupRecolor = document.getElementById('mockupRecolor');

  var logoUpload = document.getElementById('logoUpload');
  var logoFileName = document.getElementById('logoFileName');
  var colorSwatches = document.getElementById('colorSwatches');
  var sizeRange = document.getElementById('sizeRange');
  var positionBtns = document.querySelectorAll('.position-btns button');
  var resetLogoBtn = document.getElementById('resetLogoBtn');
  var downloadBtn = document.getElementById('downloadBtn');
  var studioForm = document.getElementById('studioForm');
  var studioFormNote = document.getElementById('studioFormNote');
  var filterTabs = document.querySelectorAll('.filter-tabs .filter-tab');

  var colorControlsField = document.getElementById('colorControlsField');
  var colorModeToggle = document.getElementById('colorModeToggle');
  var solidColorPanel = document.getElementById('solidColorPanel');
  var gradientColorPanel = document.getElementById('gradientColorPanel');
  var customColorInput = document.getElementById('customColorInput');
  var gradientFrom = document.getElementById('gradientFrom');
  var gradientTo = document.getElementById('gradientTo');
  var gradientDirection = document.getElementById('gradientDirection');
  var mockupUpload = document.getElementById('mockupUpload');
  var customMockupNote = document.getElementById('customMockupNote');
  var clearCustomMockup = document.getElementById('clearCustomMockup');

  /* ---------- Build product grid (thumbnails render the real vector art) ---------- */
  products.forEach(function (p, index) {
    var thumb = document.createElement('div');
    thumb.className = 'product-thumb' + (index === 0 ? ' is-active' : '');
    thumb.setAttribute('data-cat', p.cat);
    thumb.innerHTML =
      '<div class="product-thumb-media"><svg viewBox="0 0 300 300">' + p.front + '</svg></div>' +
      '<span>' + p.name + '</span>';
    thumb.addEventListener('click', function () { selectProduct(p, thumb); });
    productGrid.appendChild(thumb);
  });

  /* ---------- Gradient <defs> (built once, updated in place) ---------- */
  var svgDefs = productSvg.querySelector('defs');
  var GRAD_ID = 'jcMockupGradient';
  function ensureGradientDef(spec) {
    svgDefs.innerHTML = '';
    var isRadial = spec.direction === 'radial';
    var grad = document.createElementNS('http://www.w3.org/2000/svg', isRadial ? 'radialGradient' : 'linearGradient');
    grad.setAttribute('id', GRAD_ID);
    if (isRadial) {
      grad.setAttribute('cx', '42%'); grad.setAttribute('cy', '35%'); grad.setAttribute('r', '75%');
    } else {
      var coords = {
        diagonal:   { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
        vertical:   { x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
        horizontal: { x1: '0%', y1: '0%', x2: '100%', y2: '0%' }
      };
      var c = coords[spec.direction] || coords.diagonal;
      grad.setAttribute('x1', c.x1); grad.setAttribute('y1', c.y1);
      grad.setAttribute('x2', c.x2); grad.setAttribute('y2', c.y2);
    }
    var stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%'); stop1.setAttribute('stop-color', spec.from);
    var stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%'); stop2.setAttribute('stop-color', spec.to);
    grad.appendChild(stop1); grad.appendChild(stop2);
    svgDefs.appendChild(grad);
  }

  function colorFillValue() {
    if (typeof currentColor === 'object' && currentColor.mode === 'gradient') {
      ensureGradientDef(currentColor);
      return 'url(#' + GRAD_ID + ')';
    }
    return currentColor;
  }

  function applyColorToArt() {
    var fillValue = colorFillValue();
    productArt.querySelectorAll('.jc-fill').forEach(function (el) { el.setAttribute('fill', fillValue); });
  }

  function refreshMockupColor() {
    if (isCustomMockup) {
      mockupRecolor.style.background = colorToCssBackground(currentColor);
    } else {
      applyColorToArt();
    }
  }

  function colorToCssBackground(color) {
    if (typeof color === 'object' && color.mode === 'gradient') {
      var coords = { diagonal: '135deg', vertical: '180deg', horizontal: '90deg' };
      if (color.direction === 'radial') {
        return 'radial-gradient(circle at 42% 32%, ' + color.from + ', ' + color.to + ')';
      }
      return 'linear-gradient(' + (coords[color.direction] || coords.diagonal) + ', ' + color.from + ', ' + color.to + ')';
    }
    return color;
  }

  /* ---------- Product art + side (front/back) ---------- */
  function currentAnchor() {
    var a = currentProduct.logoAnchor || { front: { x: 0, y: 0 }, back: { x: 0, y: 0 } };
    return a[currentSide] || a.front || { x: 0, y: 0 };
  }

  function renderProductArt() {
    var markup = (currentSide === 'back' && currentProduct.back) ? currentProduct.back : currentProduct.front;
    productArt.innerHTML = markup;
    applyColorToArt();
  }

  function setSide(side) {
    currentSide = (side === 'back' && currentProduct.hasBack) ? 'back' : 'front';
    renderProductArt();
    applyPositionPreset(currentPositionPreset);
    sideToggleLabel.textContent = currentSide === 'front' ? 'View Back' : 'View Front';
    sideToggleBtn.setAttribute('aria-label', currentSide === 'front' ? 'Flip to back view' : 'Flip to front view');
  }

  function updateSideToggleAvailability() {
    var show = !isCustomMockup && currentProduct.hasBack;
    sideToggleBtn.style.visibility = show ? 'visible' : 'hidden';
  }

  /* ---------- Select a library product ---------- */
  function selectProduct(product, thumbEl) {
    currentProduct = product;
    exitCustomMockupMode();
    document.querySelectorAll('.product-thumb').forEach(function (t) { t.classList.remove('is-active'); });
    if (thumbEl) thumbEl.classList.add('is-active');
    studioProductName.textContent = product.name;
    studioCredit.textContent = 'Vector product — recolour, drag, rotate' + (product.hasBack ? ' and flip' : '') + ' freely.';
    currentColor = colorSwatches.querySelector('.swatch.is-active:not(.swatch-custom)')
      ? colorSwatches.querySelector('.swatch.is-active:not(.swatch-custom)').getAttribute('data-color')
      : (product.defaultColor || '#ffffff');
    productPos = { x: 0, y: 0 };
    productRot = 0;
    applyProductTransform();
    updateSideToggleAvailability();
    setSide('front');
    refreshMockupColor();
    applySize(sizeRange.value);
  }

  /* ---------- Category filter tabs ---------- */
  filterTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      filterTabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      var filter = tab.getAttribute('data-filter');
      document.querySelectorAll('.product-thumb').forEach(function (thumb) {
        var match = filter === 'all' || thumb.getAttribute('data-cat') === filter;
        thumb.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---------- Logo upload ---------- */
  logoUpload.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('That file is a bit large — please upload an image under 5MB.');
      return;
    }
    var reader = new FileReader();
    reader.onload = function (evt) {
      logoDataUrl = evt.target.result;
      logoOverlay.src = logoDataUrl;
      logoMount.style.display = 'block';
      logoFileName.textContent = file.name;
      logoFileName.style.display = 'block';
      applyPositionPreset(currentPositionPreset);
      applySize(sizeRange.value);
    };
    reader.readAsDataURL(file);
  });

  /* ---------- Position presets (relative to the product's own anchor) ---------- */
  function applyPositionPreset(preset) {
    currentPositionPreset = preset;
    var anchor = currentAnchor();
    var x = anchor.x, y = anchor.y;
    if (preset === 'left-chest') x = anchor.x - 42;
    else if (preset === 'right-chest') x = anchor.x + 42;
    logoOffset = { x: x, y: y };
    applyLogoTransform();
  }
  positionBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      positionBtns.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      applyPositionPreset(btn.getAttribute('data-position'));
    });
  });

  /* ---------- Size slider ----------
     The slider itself always shows the user's chosen 40-200 value regardless
     of product; the actual rendered size is scaled down per-product (via
     product.logoScale) so a small item like a pen or mug doesn't get buried
     under a logo sized for a t-shirt's chest print. */
  function currentLogoScale() {
    if (isCustomMockup) return 1;
    return (currentProduct && typeof currentProduct.logoScale === 'number') ? currentProduct.logoScale : 1;
  }
  function applySize(size) {
    logoSizeBase = parseFloat(size);
    logoSize = logoSizeBase * currentLogoScale();
    logoMount.style.width = logoSize + 'px';
    logoMount.style.height = logoSize + 'px';
    applyLogoTransform();
  }
  sizeRange.addEventListener('input', function () { applySize(sizeRange.value); });

  /* ---------- Color swatches (solid mode) ---------- */
  function setActiveSwatch(target) {
    colorSwatches.querySelectorAll('.swatch').forEach(function (s) { s.classList.remove('is-active'); });
    if (target) target.classList.add('is-active');
  }
  colorSwatches.querySelectorAll('.swatch:not(.swatch-custom)').forEach(function (swatch) {
    swatch.addEventListener('click', function () {
      setActiveSwatch(swatch);
      currentColor = swatch.getAttribute('data-color');
      refreshMockupColor();
    });
  });
  customColorInput.addEventListener('input', function () {
    setActiveSwatch(customColorInput.closest('.swatch-custom'));
    currentColor = customColorInput.value;
    refreshMockupColor();
  });

  /* ---------- Solid / Gradient mode toggle ---------- */
  colorModeToggle.querySelectorAll('button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      colorModeToggle.querySelectorAll('button').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      colorMode = btn.getAttribute('data-mode');
      solidColorPanel.style.display = colorMode === 'solid' ? 'block' : 'none';
      gradientColorPanel.style.display = colorMode === 'gradient' ? 'block' : 'none';
      if (colorMode === 'solid') {
        var activeSwatch = colorSwatches.querySelector('.swatch.is-active:not(.swatch-custom)');
        currentColor = activeSwatch ? activeSwatch.getAttribute('data-color') : customColorInput.value;
      } else {
        currentColor = buildGradientSpec();
      }
      refreshMockupColor();
    });
  });

  /* ---------- Gradient controls ---------- */
  function buildGradientSpec() {
    var dirBtn = gradientDirection.querySelector('button.is-active');
    return {
      mode: 'gradient',
      from: gradientFrom.value,
      to: gradientTo.value,
      direction: dirBtn ? dirBtn.getAttribute('data-dir') : 'diagonal'
    };
  }
  gradientFrom.addEventListener('input', function () { currentColor = buildGradientSpec(); refreshMockupColor(); });
  gradientTo.addEventListener('input', function () { currentColor = buildGradientSpec(); refreshMockupColor(); });
  gradientDirection.querySelectorAll('button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      gradientDirection.querySelectorAll('button').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      currentColor = buildGradientSpec();
      refreshMockupColor();
    });
  });

  /* ---------- Front / Back toggle ---------- */
  sideToggleBtn.addEventListener('click', function () {
    if (isCustomMockup || !currentProduct.hasBack) return;
    setSide(currentSide === 'front' ? 'back' : 'front');
  });

  /* ---------- Upload your own mockup photo (legacy static-photo path) ---------- */
  function enterCustomMockupMode() {
    isCustomMockup = true;
    productMount.style.display = 'none';
    customPhotoMount.style.display = 'block';
    rotateHandle.style.display = 'none';
    customPhotoMount.appendChild(logoMount);
    logoOffset = { x: 0, y: 0 };
    applyLogoTransform();
    updateSideToggleAvailability();
    applySize(sizeRange.value);
  }
  function exitCustomMockupMode() {
    if (!isCustomMockup) return;
    isCustomMockup = false;
    customMockupNote.style.display = 'none';
    colorControlsField.classList.remove('is-disabled');
    productMount.style.display = 'block';
    customPhotoMount.style.display = 'none';
    rotateHandle.style.display = 'flex';
    productMount.appendChild(logoMount);
    logoOffset = { x: 0, y: 0 };
    applyLogoTransform();
  }
  mockupUpload.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('That photo is a bit large — please upload an image under 8MB.');
      return;
    }
    var reader = new FileReader();
    reader.onload = function (evt) {
      enterCustomMockupMode();
      currentProduct = { id: 'custom', name: 'Your Mockup', cat: 'custom', hasBack: false };
      mockupImage.src = evt.target.result;
      mockupImage.alt = 'Your uploaded mockup photo';
      mockupRecolor.style.background = 'transparent';
      studioProductName.textContent = 'Your Custom Mockup';
      studioCredit.textContent = '';
      document.querySelectorAll('.product-thumb').forEach(function (t) { t.classList.remove('is-active'); });
      customMockupNote.style.display = 'block';
      colorControlsField.classList.add('is-disabled');
    };
    reader.readAsDataURL(file);
  });
  clearCustomMockup.addEventListener('click', function (e) {
    e.preventDefault();
    var firstThumb = document.querySelector('.product-thumb');
    if (firstThumb) selectProduct(products[0], firstThumb);
  });

  /* ---------- Transforms ---------- */
  function applyProductTransform() {
    productMount.style.transform =
      'translate(-50%,-50%) translate(' + productPos.x + 'px,' + productPos.y + 'px) rotate(' + productRot + 'deg)';
  }
  function applyLogoTransform() {
    logoMount.style.transform =
      'translate(-50%,-50%) translate(' + logoOffset.x + 'px,' + logoOffset.y + 'px)';
  }

  /* ---------- Pointer-based drag: move product, rotate product, move logo ----------
     Uses the Pointer Events API (one code path for mouse + touch + pen)
     with setPointerCapture so a drag keeps tracking even if the pointer
     leaves the element — the classic reason a drag "drops" mid-gesture. */
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function bindDrag(handleEl, opts) {
    var active = false;
    var startX = 0, startY = 0;
    var startState = null;
    handleEl.addEventListener('pointerdown', function (e) {
      if (opts.guard && !opts.guard()) return;
      active = true;
      startX = e.clientX; startY = e.clientY;
      startState = opts.getState();
      if (opts.activeClassEl) opts.activeClassEl.classList.add('is-dragging');
      handleEl.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    handleEl.addEventListener('pointermove', function (e) {
      if (!active) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      opts.onMove(dx, dy, startState, e);
    });
    function end(e) {
      if (!active) return;
      active = false;
      if (opts.activeClassEl) opts.activeClassEl.classList.remove('is-dragging');
      try { handleEl.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
    }
    handleEl.addEventListener('pointerup', end);
    handleEl.addEventListener('pointercancel', end);
  }

  // Move the whole product (translate happens in the canvas's own
  // unrotated coordinate space, so raw screen deltas map 1:1).
  bindDrag(productSvg, {
    activeClassEl: productMount,
    getState: function () { return { x: productPos.x, y: productPos.y }; },
    onMove: function (dx, dy, start) {
      productPos.x = clamp(start.x + dx, -70, 70);
      productPos.y = clamp(start.y + dy, -70, 70);
      applyProductTransform();
    }
  });

  // Rotate: angle from the mount's centre to the pointer, delta-applied
  // to the rotation the drag started at.
  bindDrag(rotateHandle, {
    getState: function () {
      var rect = productMount.getBoundingClientRect();
      var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      return { rot: productRot, cx: cx, cy: cy, startAngle: null };
    },
    onMove: function (dx, dy, start, e) {
      var angleNow = Math.atan2(e.clientY - start.cy, e.clientX - start.cx) * 180 / Math.PI;
      if (start.startAngle === null) start.startAngle = angleNow - productRot;
      productRot = Math.round(angleNow - start.startAngle);
      applyProductTransform();
    }
  });

  // Move the logo — screen-space deltas are rotated into the mount's
  // local (pre-rotation) frame so the logo tracks the pointer correctly
  // even while the product itself is spun to an angle.
  bindDrag(logoMount, {
    guard: function () { return !!logoDataUrl; },
    activeClassEl: logoMount,
    getState: function () { return { x: logoOffset.x, y: logoOffset.y }; },
    onMove: function (dx, dy, start) {
      var rot = isCustomMockup ? 0 : productRot;
      var rad = rot * Math.PI / 180;
      var cos = Math.cos(rad), sin = Math.sin(rad);
      var localDX = dx * cos + dy * sin;
      var localDY = -dx * sin + dy * cos;
      logoOffset.x = clamp(start.x + localDX, -150, 150);
      logoOffset.y = clamp(start.y + localDY, -150, 150);
      applyLogoTransform();
    }
  });

  /* ---------- Reset ---------- */
  resetLogoBtn.addEventListener('click', function () {
    logoDataUrl = null;
    logoMount.style.display = 'none';
    logoOverlay.src = '';
    logoUpload.value = '';
    logoFileName.style.display = 'none';
    productPos = { x: 0, y: 0 };
    productRot = 0;
    applyProductTransform();
    applyPositionPreset('center');
    positionBtns.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-position') === 'center'); });
    if (currentProduct.hasBack) setSide('front');
  });

  /* ---------- Render final composite onto an offscreen canvas ---------- */
  function svgToDataUri(svgEl) {
    var clone = svgEl.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    var xml = new XMLSerializer().serializeToString(clone);
    var b64 = btoa(unescape(encodeURIComponent(xml)));
    return 'data:image/svg+xml;base64,' + b64;
  }

  function renderCompositeVector(targetWidth, targetHeight, callback, onError) {
    try {
      var tempCanvas = document.createElement('canvas');
      tempCanvas.width = targetWidth; tempCanvas.height = targetHeight;
      var ctx = tempCanvas.getContext('2d');

      // Backdrop, matching the on-screen studio background.
      var bg = ctx.createLinearGradient(0, 0, 0, targetHeight);
      bg.addColorStop(0, '#ffffff');
      bg.addColorStop(1, '#efece2');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      var canvasRect = studioCanvas.getBoundingClientRect();
      var scaleX = targetWidth / canvasRect.width;
      var scaleY = targetHeight / canvasRect.height;

      var mountRect = productMount.getBoundingClientRect();
      var centerX = ((mountRect.left + mountRect.right) / 2 - canvasRect.left) * scaleX;
      var centerY = ((mountRect.top + mountRect.bottom) / 2 - canvasRect.top) * scaleY;
      var pw = PRODUCT_BOX * scaleX, ph = PRODUCT_BOX * scaleY;

      var productImg = new Image();
      productImg.onload = function () {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(productRot * Math.PI / 180);
        ctx.drawImage(productImg, -pw / 2, -ph / 2, pw, ph);
        ctx.restore();

        if (!logoDataUrl) { callback(tempCanvas); return; }

        var logoRect = logoMount.getBoundingClientRect();
        var lCenterX = ((logoRect.left + logoRect.right) / 2 - canvasRect.left) * scaleX;
        var lCenterY = ((logoRect.top + logoRect.bottom) / 2 - canvasRect.top) * scaleY;
        var lw = logoSize * scaleX, lh = logoSize * scaleY;

        var logoImg = new Image();
        logoImg.onload = function () {
          ctx.save();
          ctx.translate(lCenterX, lCenterY);
          ctx.rotate(productRot * Math.PI / 180);
          ctx.drawImage(logoImg, -lw / 2, -lh / 2, lw, lh);
          ctx.restore();
          callback(tempCanvas);
        };
        logoImg.onerror = function () { onError(new Error('logo load failed')); };
        logoImg.src = logoDataUrl;
      };
      productImg.onerror = function () { onError(new Error('product art render failed')); };
      productImg.src = svgToDataUri(productSvg);
    } catch (err) {
      onError(err);
    }
  }

  function renderCompositeCustomPhoto(targetWidth, targetHeight, callback, onError) {
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = targetWidth; tempCanvas.height = targetHeight;
    var ctx = tempCanvas.getContext('2d');

    var base = new Image();
    base.crossOrigin = 'anonymous';
    base.onload = function () {
      try {
        ctx.drawImage(base, 0, 0, targetWidth, targetHeight);
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        if (typeof currentColor === 'object' && currentColor.mode === 'gradient') {
          var grad;
          if (currentColor.direction === 'radial') {
            grad = ctx.createRadialGradient(targetWidth * 0.42, targetHeight * 0.32, 10, targetWidth * 0.5, targetHeight * 0.5, targetWidth * 0.75);
          } else if (currentColor.direction === 'vertical') {
            grad = ctx.createLinearGradient(0, 0, 0, targetHeight);
          } else if (currentColor.direction === 'horizontal') {
            grad = ctx.createLinearGradient(0, 0, targetWidth, 0);
          } else {
            grad = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
          }
          grad.addColorStop(0, currentColor.from);
          grad.addColorStop(1, currentColor.to);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = currentColor;
        }
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.restore();
      } catch (err) {
        onError(err);
        return;
      }

      if (!logoDataUrl) { finish(); return; }

      var canvasRect = studioCanvas.getBoundingClientRect();
      var logoRect = logoMount.getBoundingClientRect();
      var scaleX = targetWidth / canvasRect.width;
      var scaleY = targetHeight / canvasRect.height;

      var logo = new Image();
      logo.onload = function () {
        var w = logoRect.width * scaleX, h = logoRect.height * scaleY;
        var x = (logoRect.left - canvasRect.left) * scaleX;
        var y = (logoRect.top - canvasRect.top) * scaleY;
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(logo, x, y, w, h);
        ctx.restore();
        finish();
      };
      logo.src = logoDataUrl;

      function finish() {
        try { callback(tempCanvas); } catch (err) { onError(err); }
      }
    };
    base.onerror = function () { onError(new Error('image load failed')); };
    base.src = mockupImage.src;
  }

  /* ---------- Download PNG ---------- */
  downloadBtn.addEventListener('click', function () {
    if (!logoDataUrl) {
      alert('Upload your logo first, then download your mockup.');
      return;
    }
    var onErr = function () {
      alert("This mockup's source doesn't allow a browser download — please take a screenshot instead, or send us the design directly using the form below.");
    };
    var onDone = function (canvas) {
      var dataUrl;
      try {
        dataUrl = canvas.toDataURL('image/png');
      } catch (err) { onErr(); return; }
      var link = document.createElement('a');
      link.download = currentProduct.name.toLowerCase().replace(/\s+/g, '-') + '-mockup.png';
      link.href = dataUrl;
      link.click();
    };
    if (isCustomMockup) {
      renderCompositeCustomPhoto(1000, 1250, onDone, onErr);
    } else {
      renderCompositeVector(1000, 1000, onDone, onErr);
    }
  });

  /* ---------- Enquiry form ---------- */
  studioForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!logoDataUrl) {
      studioFormNote.textContent = 'Please upload your logo before sending your design.';
      studioFormNote.style.display = 'block';
      return;
    }
    studioFormNote.textContent = "Thanks! Your " + currentProduct.name.toLowerCase() + " mockup has been noted — our team will reach out shortly with pricing.";
    studioFormNote.style.display = 'block';
    studioForm.reset();
  });

  /* ---------- Init ---------- */
  applyProductTransform();
  renderProductArt();
  updateSideToggleAvailability();
  refreshMockupColor();
  applySize(sizeRange.value);
  applyPositionPreset('center');
})();
