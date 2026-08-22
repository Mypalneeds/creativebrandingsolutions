/* ============================================================
   Creative Branding Solutions — Mockup Studio
   Self-contained product mockup builder: pick a product, upload
   a logo, drag/resize/recolor, download a PNG, send an enquiry.
   ============================================================ */

(function () {
  var canvasEl = document.getElementById('studioCanvas');
  if (!canvasEl) return; // only run this script on the Studio page

  /* ---------- Product catalogue ---------- */
  var products = [
    { id: 'tshirt',      name: 'T-Shirt',       cat: 'apparel' },
    { id: 'hoodie',       name: 'Hoodie',        cat: 'apparel' },
    { id: 'tanktop',      name: 'Tank Top',      cat: 'apparel' },
    { id: 'longsleeve',   name: 'Long Sleeve',   cat: 'apparel' },
    { id: 'polo',         name: 'Polo Shirt',    cat: 'apparel' },
    { id: 'mug',          name: 'Coffee Mug',    cat: 'drinkware' },
    { id: 'travelmug',    name: 'Travel Mug',    cat: 'drinkware' },
    { id: 'bottle',       name: 'Water Bottle',  cat: 'drinkware' },
    { id: 'tumbler',      name: 'Tumbler',       cat: 'drinkware' },
    { id: 'totebag',      name: 'Tote Bag',      cat: 'bags' },
    { id: 'backpack',     name: 'Backpack',      cat: 'bags' },
    { id: 'cap',          name: 'Cap',           cat: 'bags' },
    { id: 'beanie',       name: 'Beanie',        cat: 'bags' },
    { id: 'phonecase',    name: 'Phone Case',    cat: 'tech' },
    { id: 'laptopsleeve', name: 'Laptop Sleeve', cat: 'tech' },
    { id: 'mousepad',     name: 'Mouse Pad',     cat: 'tech' },
    { id: 'powerbank',    name: 'Power Bank',    cat: 'tech' },
    { id: 'notebook',     name: 'Notebook',      cat: 'print' },
    { id: 'sticker',      name: 'Sticker',       cat: 'print' },
    { id: 'poster',       name: 'Poster',        cat: 'print' }
  ];

  /* ---------- Color helpers ---------- */
  function clamp(n) { return Math.max(0, Math.min(255, n)); }
  function shade(hex, percent) {
    // percent > 0 lightens toward white, percent < 0 darkens toward black
    var f = parseInt(hex.slice(1), 16);
    var t = percent < 0 ? 0 : 255;
    var p = Math.abs(percent) / 100;
    var R = (f >> 16) & 0xff, G = (f >> 8) & 0xff, B = f & 0xff;
    var r = clamp(Math.round((t - R) * p) + R);
    var g = clamp(Math.round((t - G) * p) + G);
    var b = clamp(Math.round((t - B) * p) + B);
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  }
  // A believable "fabric/ceramic" line — visible on light colors, still reads on dark ones
  function outline(hex) {
    var f = parseInt(hex.slice(1), 16);
    var brightness = (((f >> 16) & 0xff) * 299 + ((f >> 8) & 0xff) * 587 + (f & 0xff) * 114) / 1000;
    return brightness > 200 ? shade(hex, -22) : shade(hex, 32);
  }
  // Blends two hex colors (weight 0 = all a, 1 = all b) — used to pick a
  // sensible accent color (stitching, outlines) when a gradient is applied.
  function mixHex(a, b, weight) {
    var fa = parseInt(a.slice(1), 16), fb = parseInt(b.slice(1), 16);
    var Ra = (fa >> 16) & 0xff, Ga = (fa >> 8) & 0xff, Ba = fa & 0xff;
    var Rb = (fb >> 16) & 0xff, Gb = (fb >> 8) & 0xff, Bb = fb & 0xff;
    var r = clamp(Math.round(Ra + (Rb - Ra) * weight));
    var g = clamp(Math.round(Ga + (Gb - Ga) * weight));
    var b2 = clamp(Math.round(Ba + (Bb - Ba) * weight));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b2).toString(16).slice(1);
  }

  /* ---------- Shared SVG building blocks ----------
     Everything in this block is reused by all 20 product generators below,
     so improving it here upgrades every product mockup automatically —
     no need to touch the individual generator functions. */
  function svgOpen(id, colorSpec) {
    var isGradient = colorSpec && typeof colorSpec === 'object';
    // `c` is the color every generator's accent details (stitching, seams,
    // outlines) are derived from — for a gradient we blend the two picked
    // colors so accents stay coherent with whatever the user chose.
    var c = isGradient ? mixHex(colorSpec.from, colorSpec.to, 0.5) : colorSpec;
    var light2 = shade(c, 50);   // brightest specular highlight
    var light = shade(c, 24);    // soft upper highlight
    var dark = shade(c, -20);    // core shadow
    var dark2 = shade(c, -40);   // deepest falloff / occlusion
    var stroke = outline(c);

    var bodyGradientTag;
    if (isGradient) {
      var from = colorSpec.from, to = colorSpec.to;
      var edgeLight = shade(from, 25);
      var edgeDark = shade(to, -25);
      var stops =
        "<stop offset='0%' stop-color='" + edgeLight + "'/>" +
        "<stop offset='28%' stop-color='" + from + "'/>" +
        "<stop offset='72%' stop-color='" + to + "'/>" +
        "<stop offset='100%' stop-color='" + edgeDark + "'/>";
      if (colorSpec.direction === 'radial') {
        bodyGradientTag = "<radialGradient id='g" + id + "' cx='42%' cy='32%' r='75%'>" + stops + "</radialGradient>";
      } else {
        var coords = { diagonal: "x1='15%' y1='0%' x2='85%' y2='100%'", vertical: "x1='50%' y1='0%' x2='50%' y2='100%'", horizontal: "x1='0%' y1='50%' x2='100%' y2='50%'" };
        bodyGradientTag = "<linearGradient id='g" + id + "' " + (coords[colorSpec.direction] || coords.diagonal) + ">" + stops + "</linearGradient>";
      }
    } else {
      // Richer multi-stop body gradient (was 3 stops, now 5) for a more
      // dimensional, "studio photographed" material read.
      bodyGradientTag =
        "<linearGradient id='g" + id + "' x1='18%' y1='0%' x2='82%' y2='100%'>" +
        "<stop offset='0%' stop-color='" + light2 + "'/>" +
        "<stop offset='24%' stop-color='" + light + "'/>" +
        "<stop offset='52%' stop-color='" + c + "'/>" +
        "<stop offset='78%' stop-color='" + dark + "'/>" +
        "<stop offset='100%' stop-color='" + dark2 + "'/>" +
        "</linearGradient>";
    }

    var defs =
      "<defs>" +
      bodyGradientTag +
      // Subtle top-down sheen usable as a glossy overlay highlight.
      "<linearGradient id='sheen" + id + "' x1='0%' y1='0%' x2='0%' y2='100%'>" +
      "<stop offset='0%' stop-color='#ffffff' stop-opacity='0.35'/>" +
      "<stop offset='16%' stop-color='#ffffff' stop-opacity='0.06'/>" +
      "<stop offset='100%' stop-color='#ffffff' stop-opacity='0'/>" +
      "</linearGradient>" +
      // Soft contact/ambient shadow gradient (used with a blur filter below).
      "<radialGradient id='shadow" + id + "' cx='50%' cy='50%' r='50%'>" +
      "<stop offset='0%' stop-color='#000000' stop-opacity='0.20'/>" +
      "<stop offset='55%' stop-color='#000000' stop-opacity='0.09'/>" +
      "<stop offset='100%' stop-color='#000000' stop-opacity='0'/>" +
      "</radialGradient>" +
      "<filter id='blur" + id + "' x='-60%' y='-60%' width='220%' height='220%'>" +
      "<feGaussianBlur stdDeviation='10'/>" +
      "</filter>" +
      "</defs>";
    return { defs: defs, fill: "url(#g" + id + ")", stroke: stroke, light: light, light2: light2, dark: dark, dark2: dark2, sheen: "url(#sheen" + id + ")" };
  }
  // Two-layer soft shadow: a wide, heavily blurred ambient shadow for
  // grounding + a tighter gradient contact shadow for definition.
  function groundShadow(id, cx, cy, rx, ry) {
    return "<ellipse cx='" + cx + "' cy='" + (cy + ry * 0.35) + "' rx='" + (rx * 1.35) + "' ry='" + (ry * 1.2) + "' fill='#0a1220' opacity='0.14' filter='url(#blur" + id + ")'/>" +
      "<ellipse cx='" + cx + "' cy='" + cy + "' rx='" + rx + "' ry='" + ry + "' fill='url(#shadow" + id + ")'/>";
  }
  // Neutral studio backdrop (gradient + vignette) drawn behind every mockup.
  // Colour-independent, so it never needs per-product edits either.
  function studioBackdrop(uid) {
    return "<defs>" +
      "<linearGradient id='backdrop" + uid + "' x1='0%' y1='0%' x2='0%' y2='100%'>" +
      "<stop offset='0%' stop-color='#eef1f6'/>" +
      "<stop offset='58%' stop-color='#e4e8ef'/>" +
      "<stop offset='100%' stop-color='#d6dbe4'/>" +
      "</linearGradient>" +
      "<radialGradient id='vignette" + uid + "' cx='50%' cy='36%' r='78%'>" +
      "<stop offset='0%' stop-color='#ffffff' stop-opacity='0.55'/>" +
      "<stop offset='55%' stop-color='#ffffff' stop-opacity='0'/>" +
      "<stop offset='100%' stop-color='#000000' stop-opacity='0.12'/>" +
      "</radialGradient>" +
      "</defs>" +
      "<rect x='0' y='0' width='400' height='500' fill='url(#backdrop" + uid + ")'/>" +
      "<rect x='0' y='0' width='400' height='500' fill='url(#vignette" + uid + ")'/>";
  }

  /* ---------- SVG generators (realistic shaded product renders) ---------- */
  var generators = {

    tshirt: function (c) {
      var s = svgOpen('tshirt', c);
      var d = "M172,42 Q200,62 228,42 L252,54 L302,66 Q320,72 322,90 L324,104 Q324,118 306,122 L288,124 Q266,116 250,98 L256,180 L252,260 L246,300 Q200,310 154,300 L148,260 L144,180 L150,98 Q134,116 112,124 L94,122 Q76,118 76,104 L78,90 Q80,72 98,66 L148,54 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('tshirt', 200, 340, 108, 15) +
        "<path d='" + d + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='" + d + "' fill='" + s.sheen + "'/>" +
        "<path d='M172,42 Q200,62 228,42' fill='none' stroke='" + s.stroke + "' stroke-width='3' stroke-linecap='round' opacity='0.7'/>" +
        "<path d='M148,54 L150,98 M252,54 L250,98' fill='none' stroke='" + s.dark + "' stroke-width='1.2' opacity='0.4'/>" +
        "<path d='M146,190 Q200,200 254,190' fill='none' stroke='" + s.dark + "' stroke-width='1' opacity='0.22'/>" +
        "</svg>";
    },

    hoodie: function (c) {
      var s = svgOpen('hoodie', c);
      var d = "M176,58 L252,58 L308,68 Q326,76 328,94 L332,224 Q332,240 316,246 L296,244 L252,116 L258,190 L254,300 L248,392 Q200,404 152,392 L146,300 L142,190 L148,116 L104,244 L84,246 Q68,240 68,224 L72,94 Q74,76 92,68 L148,58 Z";
      var hood = "M158,64 Q160,14 200,12 Q240,14 242,64 Q238,66 232,60 Q216,44 200,44 Q184,44 168,60 Q162,66 158,64 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('hoodie', 200, 430, 122, 15) +
        "<path d='" + d + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='" + d + "' fill='" + s.sheen + "'/>" +
        "<path d='" + hood + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='" + hood + "' fill='" + s.sheen + "'/>" +
        "<path d='M200,20 Q182,34 176,58 M200,20 Q218,34 224,58' stroke='" + s.dark + "' stroke-width='1.2' opacity='0.4' fill='none'/>" +
        "<circle cx='186' cy='74' r='2.8' fill='" + s.stroke + "' opacity='0.75'/><circle cx='214' cy='74' r='2.8' fill='" + s.stroke + "' opacity='0.75'/>" +
        "<path d='M186,74 Q182,108 176,140 M214,74 Q218,108 224,140' fill='none' stroke='" + s.dark + "' stroke-width='2' opacity='0.5'/>" +
        "<path d='M296,220 L332,206 L332,240 Q332,246 326,247 L300,244 Z' fill='" + s.light + "' stroke='" + s.stroke + "' stroke-width='1.8'/>" +
        "<path d='M104,220 L68,206 L68,240 Q68,246 74,247 L100,244 Z' fill='" + s.light + "' stroke='" + s.stroke + "' stroke-width='1.8'/>" +
        "<path d='M154,260 Q200,278 246,260 L250,330 Q200,346 150,330 Z' fill='none' stroke='" + s.stroke + "' stroke-width='1.8' opacity='0.55'/>" +
        "<path d='M154,260 Q200,278 246,260' fill='none' stroke='" + s.dark + "' stroke-width='1.2' opacity='0.3'/>" +
        "<path d='M152,384 Q200,396 248,384' fill='none' stroke='" + s.dark + "' stroke-width='1.2' opacity='0.3'/>" +
        "</svg>";
    },

    tanktop: function (c) {
      var s = svgOpen('tanktop', c);
      var d = "M175,50 Q200,82 225,50 Q246,58 254,80 Q262,100 256,128 L260,220 L256,300 L250,352 Q200,364 150,352 L144,300 L140,220 L144,128 Q138,100 146,80 Q154,58 175,50 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('tanktop', 200, 360, 98, 14) +
        "<path d='" + d + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='" + d + "' fill='" + s.sheen + "'/>" +
        "<path d='M182,50 L188,20 Q188,16 194,16 L198,16 L198,46 M218,50 L212,20 Q212,16 206,16 L202,16 L202,46' fill='none' stroke='" + s.stroke + "' stroke-width='2' stroke-linejoin='round' opacity='0.85'/>" +
        "<path d='M175,50 Q200,78 225,50' fill='none' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linecap='round' opacity='0.6'/>" +
        "<path d='M254,80 Q262,100 256,128 M146,80 Q138,100 144,128' fill='none' stroke='" + s.dark + "' stroke-width='1.2' opacity='0.4'/>" +
        "<path d='M142,240 Q200,250 258,240' fill='none' stroke='" + s.dark + "' stroke-width='1' opacity='0.2'/>" +
        "</svg>";
    },

    longsleeve: function (c) {
      var s = svgOpen('longsleeve', c);
      var d = "M172,42 Q200,62 228,42 L252,54 L296,64 Q312,70 314,86 L326,240 Q328,254 314,258 L296,254 L262,148 L256,180 L252,260 L246,300 Q200,310 154,300 L148,260 L144,180 L138,148 L104,254 L86,258 Q72,254 74,240 L86,86 Q88,70 104,64 L148,54 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('longsleeve', 200, 340, 112, 15) +
        "<path d='" + d + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='" + d + "' fill='" + s.sheen + "'/>" +
        "<path d='M172,42 Q200,62 228,42' fill='none' stroke='" + s.stroke + "' stroke-width='3' stroke-linecap='round' opacity='0.7'/>" +
        "<path d='M148,54 L138,148 M252,54 L262,148' fill='none' stroke='" + s.dark + "' stroke-width='1.2' opacity='0.4'/>" +
        "<path d='M146,190 Q200,200 254,190' fill='none' stroke='" + s.dark + "' stroke-width='1' opacity='0.22'/>" +
        "<path d='M76,236 L98,240' stroke='" + s.stroke + "' stroke-width='1.5' opacity='0.5'/><path d='M324,236 L302,240' stroke='" + s.stroke + "' stroke-width='1.5' opacity='0.5'/>" +
        "</svg>";
    },

    polo: function (c) {
      var s = svgOpen('polo', c);
      var d = "M172,48 L182,62 L164,86 L188,100 L182,60 L252,54 L302,66 Q320,72 322,90 L324,104 Q324,118 306,122 L288,124 Q266,116 250,98 L256,180 L252,260 L246,300 Q200,310 154,300 L148,260 L144,180 L150,98 Q134,116 112,124 L94,122 Q76,118 76,104 L78,90 Q80,72 98,66 L148,54 L218,60 L212,100 L236,86 L218,62 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('polo', 200, 340, 108, 15) +
        "<path d='" + d + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='" + d + "' fill='" + s.sheen + "'/>" +
        "<path d='M182,60 L172,48 L164,86 L188,100 Z' fill='" + s.light + "' stroke='" + s.stroke + "' stroke-width='2' stroke-linejoin='round'/>" +
        "<path d='M218,60 L228,48 L236,86 L212,100 Z' fill='" + s.light + "' stroke='" + s.stroke + "' stroke-width='2' stroke-linejoin='round'/>" +
        "<rect x='194' y='100' width='12' height='66' rx='2' fill='none' stroke='" + s.dark + "' stroke-width='1.5' opacity='0.6'/>" +
        "<circle cx='200' cy='118' r='2.6' fill='" + s.dark + "' opacity='0.6'/><circle cx='200' cy='140' r='2.6' fill='" + s.dark + "' opacity='0.6'/><circle cx='200' cy='162' r='2.6' fill='" + s.dark + "' opacity='0.6'/>" +
        "<path d='M148,54 L150,98 M252,54 L250,98' fill='none' stroke='" + s.dark + "' stroke-width='1.2' opacity='0.4'/>" +
        "<path d='M146,190 Q200,200 254,190' fill='none' stroke='" + s.dark + "' stroke-width='1' opacity='0.2'/>" +
        "</svg>";
    },

    mug: function (c) {
      var s = svgOpen('mug', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('mug', 200, 385, 110, 14) +
        "<path d='M300 185 Q355 185 355 232 Q355 279 300 279' fill='none' stroke='" + s.stroke + "' stroke-width='14' stroke-linecap='round'/>" +
        "<path d='M300 185 Q355 185 355 232 Q355 279 300 279' fill='none' stroke='" + s.fill + "' stroke-width='9' stroke-linecap='round'/>" +
        "<rect x='100' y='125' width='200' height='250' rx='8' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<rect x='100' y='125' width='200' height='250' rx='8' fill='" + s.sheen + "'/>" +
        "<ellipse cx='200' cy='125' rx='100' ry='14' fill='" + s.dark + "' opacity='0.6'/>" +
        "<ellipse cx='200' cy='123' rx='94' ry='11' fill='" + s.fill + "'/>" +
        "<rect x='118' y='145' width='16' height='210' rx='8' fill='#ffffff' opacity='0.28'/>" +
        "</svg>";
    },

    travelmug: function (c) {
      var s = svgOpen('travelmug', c);
      var d = "M140 100 L130 400 Q130 420 150 420 L250 420 Q270 420 270 400 L260 100 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('travelmug', 200, 425, 75, 12) +
        "<path d='" + d + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<path d='" + d + "' fill='" + s.sheen + "'/>" +
        "<ellipse cx='200' cy='100' rx='60' ry='16' fill='" + s.dark + "' opacity='0.55'/>" +
        "<rect x='170' y='68' width='60' height='18' rx='6' fill='" + s.stroke + "'/>" +
        "<rect x='177' y='72' width='46' height='6' rx='3' fill='#ffffff' opacity='0.25'/>" +
        "<rect x='150' y='150' width='12' height='230' rx='6' fill='#ffffff' opacity='0.25'/>" +
        "</svg>";
    },

    bottle: function (c) {
      var s = svgOpen('bottle', c);
      var d = "M160 90 L150 420 Q150 450 180 450 L220 450 Q250 450 250 420 L240 90 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('bottle', 200, 445, 65, 12) +
        "<rect x='172' y='48' width='56' height='42' rx='4' fill='" + s.stroke + "'/>" +
        "<rect x='178' y='52' width='44' height='8' rx='3' fill='#ffffff' opacity='0.3'/>" +
        "<path d='" + d + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<path d='" + d + "' fill='" + s.sheen + "'/>" +
        "<rect x='166' y='150' width='14' height='250' rx='7' fill='#ffffff' opacity='0.28'/>" +
        "</svg>";
    },

    tumbler: function (c) {
      var s = svgOpen('tumbler', c);
      var d = "M150 90 L140 400 Q140 430 175 430 L225 430 Q260 430 260 400 L250 90 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('tumbler', 200, 445, 68, 12) +
        "<path d='" + d + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<path d='" + d + "' fill='" + s.sheen + "'/>" +
        "<ellipse cx='200' cy='90' rx='50' ry='14' fill='" + s.dark + "' opacity='0.5'/>" +
        "<rect x='157' y='140' width='13' height='250' rx='6' fill='#ffffff' opacity='0.28'/>" +
        "</svg>";
    },

    totebag: function (c) {
      var s = svgOpen('totebag', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('totebag', 200, 446, 118, 14) +
        "<path d='M148,150 Q144,84 172,72' fill='none' stroke='" + s.stroke + "' stroke-width='9' stroke-linecap='round'/>" +
        "<path d='M148,150 Q144,84 172,72' fill='none' stroke='" + s.fill + "' stroke-width='5' stroke-linecap='round'/>" +
        "<path d='M252,150 Q256,84 228,72' fill='none' stroke='" + s.stroke + "' stroke-width='9' stroke-linecap='round'/>" +
        "<path d='M252,150 Q256,84 228,72' fill='none' stroke='" + s.fill + "' stroke-width='5' stroke-linecap='round'/>" +
        "<path d='M104,150 L296,150 L286,430 Q284,444 270,444 L130,444 Q116,444 114,430 Z' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='M104,150 L296,150 L286,430 Q284,444 270,444 L130,444 Q116,444 114,430 Z' fill='" + s.sheen + "'/>" +
        "<path d='M104,150 L296,150' fill='none' stroke='" + s.dark + "' stroke-width='1.5' opacity='0.5'/>" +
        "<path d='M104,150 L96,430 M296,150 L304,430' fill='none' stroke='" + s.dark + "' stroke-width='1.5' opacity='0.3'/>" +
        "<path d='M118,196 L282,196' stroke='" + s.dark + "' stroke-width='1' opacity='0.22' stroke-dasharray='4,4'/>" +
        "<path d='M118,430 Q200,442 282,430' fill='none' stroke='" + s.dark + "' stroke-width='1' opacity='0.2'/>" +
        "</svg>";
    },

    backpack: function (c) {
      var s = svgOpen('backpack', c);
      var body = "M116,140 Q112,120 132,112 L268,112 Q288,120 284,140 L288,400 Q288,428 260,430 L140,430 Q112,428 112,400 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('backpack', 200, 446, 105, 14) +
        "<path d='M150,96 Q140,180 148,300 Q150,340 168,360' fill='none' stroke='" + s.stroke + "' stroke-width='16' stroke-linecap='round' opacity='0.9'/>" +
        "<path d='M150,96 Q140,180 148,300 Q150,340 168,360' fill='none' stroke='" + s.fill + "' stroke-width='11' stroke-linecap='round'/>" +
        "<path d='M250,96 Q260,180 252,300 Q250,340 232,360' fill='none' stroke='" + s.stroke + "' stroke-width='16' stroke-linecap='round' opacity='0.9'/>" +
        "<path d='M250,96 Q260,180 252,300 Q250,340 232,360' fill='none' stroke='" + s.fill + "' stroke-width='11' stroke-linecap='round'/>" +
        "<path d='M172,92 Q172,66 200,66 Q228,66 228,92' fill='none' stroke='" + s.stroke + "' stroke-width='8' stroke-linecap='round'/>" +
        "<path d='" + body + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='" + body + "' fill='" + s.sheen + "'/>" +
        "<path d='M138,220 Q200,206 262,220 L266,340 Q200,356 134,340 Z' fill='" + s.light + "' stroke='" + s.stroke + "' stroke-width='2'/>" +
        "<path d='M138,220 Q200,206 262,220' fill='none' stroke='" + s.dark + "' stroke-width='1.2' opacity='0.4'/>" +
        "<path d='M140,222 Q200,209 260,222' fill='none' stroke='" + s.dark + "' stroke-width='1.5' stroke-dasharray='3,3' opacity='0.5'/>" +
        "<circle cx='255' cy='221' r='4' fill='" + s.stroke + "'/>" +
        "<rect x='120' y='270' width='14' height='24' rx='3' fill='" + s.dark + "' opacity='0.6'/>" +
        "<rect x='266' y='270' width='14' height='24' rx='3' fill='" + s.dark + "' opacity='0.6'/>" +
        "</svg>";
    },

    cap: function (c) {
      var s = svgOpen('cap', c);
      var crown = "M96,214 Q94,108 200,100 Q306,108 304,214 Q304,224 294,227 L106,227 Q96,224 96,214 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('cap', 200, 270, 128, 15) +
        "<path d='M108,216 Q104,246 128,258 Q200,272 292,246 Q308,240 306,228 Q302,220 292,222 Q200,242 118,220 Q110,216 108,216 Z' fill='" + s.dark + "' stroke='" + s.stroke + "' stroke-width='2'/>" +
        "<path d='M118,224 Q200,244 296,226' fill='none' stroke='" + s.dark2 + "' stroke-width='1' opacity='0.5'/>" +
        "<path d='" + crown + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='" + crown + "' fill='" + s.sheen + "'/>" +
        "<path d='M200,103 L200,225 M148,108 Q142,166 150,224 M252,108 Q258,166 250,224' stroke='" + s.dark + "' stroke-width='1.2' opacity='0.35' fill='none'/>" +
        "<circle cx='200' cy='105' r='6' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='1.5'/>" +
        "</svg>";
    },

    beanie: function (c) {
      var s = svgOpen('beanie', c);
      var body = "M122,260 Q118,150 200,138 Q282,150 278,260 L278,296 Q278,304 270,304 L130,304 Q122,304 122,296 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('beanie', 200, 330, 100, 14) +
        "<path d='" + body + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='M148,152 Q140,220 144,262 M252,152 Q260,220 256,262 M200,140 L200,264' stroke='" + s.dark + "' stroke-width='1.1' opacity='0.3' fill='none'/>" +
        "<rect x='122' y='262' width='156' height='42' rx='4' fill='" + s.dark + "' opacity='0.22' stroke='" + s.stroke + "' stroke-width='2'/>" +
        "<path d='M124,272 L276,272 M124,282 L276,282 M124,292 L276,292' stroke='" + s.dark + "' stroke-width='1' opacity='0.35'/>" +
        "<circle cx='200' cy='132' r='12' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='1.8'/>" +
        "<path d='M200,124 L200,140 M192,132 L208,132' stroke='" + s.dark + "' stroke-width='1' opacity='0.4'/>" +
        "<path d='" + body + "' fill='" + s.sheen + "'/>" +
        "</svg>";
    },

    phonecase: function (c) {
      var s = svgOpen('phonecase', c);
      var body = "M144,90 Q140,78 152,74 L248,74 Q260,78 256,90 L262,300 Q262,326 236,328 L164,328 Q138,326 138,300 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('phonecase', 200, 352, 78, 12) +
        "<path d='" + body + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='" + body + "' fill='" + s.sheen + "'/>" +
        "<rect x='160' y='86' width='58' height='58' rx='14' fill='" + s.dark + "' opacity='0.35' stroke='" + s.stroke + "' stroke-width='1.8'/>" +
        "<circle cx='178' cy='104' r='12' fill='" + s.light + "' stroke='" + s.stroke + "' stroke-width='1.5'/><circle cx='178' cy='104' r='5' fill='" + s.dark2 + "' opacity='0.6'/>" +
        "<circle cx='202' cy='104' r='12' fill='" + s.light + "' stroke='" + s.stroke + "' stroke-width='1.5'/><circle cx='202' cy='104' r='5' fill='" + s.dark2 + "' opacity='0.6'/>" +
        "<circle cx='178' cy='128' r='9' fill='" + s.light + "' stroke='" + s.stroke + "' stroke-width='1.5'/><circle cx='178' cy='128' r='4' fill='" + s.dark2 + "' opacity='0.6'/>" +
        "<rect x='134' y='150' width='6' height='26' rx='3' fill='" + s.stroke + "' opacity='0.7'/>" +
        "<rect x='260' y='140' width='6' height='20' rx='3' fill='" + s.stroke + "' opacity='0.7'/>" +
        "<rect x='260' y='170' width='6' height='36' rx='3' fill='" + s.stroke + "' opacity='0.7'/>" +
        "<rect x='185' y='312' width='30' height='5' rx='2.5' fill='" + s.dark + "' opacity='0.4'/>" +
        "</svg>";
    },

    laptopsleeve: function (c) {
      var s = svgOpen('laptopsleeve', c);
      var body = "M80,150 L320,150 Q328,150 328,158 L328,322 Q328,330 320,330 L80,330 Q72,330 72,322 L72,158 Q72,150 80,150 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('laptopsleeve', 200, 350, 130, 14) +
        "<path d='" + body + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<path d='" + body + "' fill='" + s.sheen + "'/>" +
        "<rect x='95' y='163' width='210' height='154' rx='5' fill='none' stroke='" + s.dark + "' stroke-width='1.5' opacity='0.4'/>" +
        "<path d='M300,232 L322,240 L300,248 Z' fill='" + s.stroke + "'/>" +
        "<path d='M300,232 L322,240 L300,248' fill='none' stroke='" + s.dark2 + "' stroke-width='1' opacity='0.3'/>" +
        "</svg>";
    },

    mousepad: function (c) {
      var s = svgOpen('mousepad', c);
      var body = "M90,180 Q90,164 106,164 L294,164 Q310,164 310,180 L310,320 Q310,336 294,336 L106,336 Q90,336 90,320 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('mousepad', 200, 344, 130, 12) +
        "<path d='" + body + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<path d='" + body + "' fill='" + s.sheen + "'/>" +
        "<rect x='90' y='320' width='220' height='16' rx='4' fill='" + s.dark + "' opacity='0.18'/>" +
        "</svg>";
    },

    powerbank: function (c) {
      var s = svgOpen('powerbank', c);
      var body = "M140,178 Q140,170 148,170 L252,170 Q260,170 260,178 L260,362 Q260,370 252,370 L148,370 Q140,370 140,362 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('powerbank', 200, 390, 90, 12) +
        "<path d='" + body + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<path d='" + body + "' fill='" + s.sheen + "'/>" +
        "<circle cx='200' cy='196' r='4.5' fill='" + s.dark + "' opacity='0.6'/>" +
        "<circle cx='182' cy='330' r='4' fill='none' stroke='" + s.dark + "' stroke-width='1.4' opacity='0.55'/>" +
        "<circle cx='195' cy='330' r='4' fill='none' stroke='" + s.dark + "' stroke-width='1.4' opacity='0.4'/>" +
        "<circle cx='208' cy='330' r='4' fill='none' stroke='" + s.dark + "' stroke-width='1.4' opacity='0.25'/>" +
        "<rect x='185' y='348' width='30' height='8' rx='4' fill='" + s.dark + "' opacity='0.45'/>" +
        "</svg>";
    },

    notebook: function (c) {
      var s = svgOpen('notebook', c);
      var cover = "M126,100 L290,100 Q290,100 290,100 L290,384 L126,384 Z";
      var coil = ["M116,110 Q128,110 128,120 Q128,130 116,130", "M116,136 Q128,136 128,146 Q128,156 116,156",
        "M116,162 Q128,162 128,172 Q128,182 116,182", "M116,188 Q128,188 128,198 Q128,208 116,208",
        "M116,214 Q128,214 128,224 Q128,234 116,234", "M116,240 Q128,240 128,250 Q128,260 116,260",
        "M116,266 Q128,266 128,276 Q128,286 116,286", "M116,292 Q128,292 128,302 Q128,312 116,312",
        "M116,318 Q128,318 128,328 Q128,338 116,338", "M116,344 Q128,344 128,354 Q128,364 116,364",
        "M116,370 Q128,370 128,378 Q128,384 116,384"].join(" ");
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('notebook', 200, 398, 112, 14) +
        "<rect x='130' y='106' width='168' height='276' rx='3' fill='#efece4'/>" +
        "<rect x='128' y='104' width='168' height='276' rx='3' fill='#f4f1ea'/>" +
        "<rect x='126' y='100' width='164' height='284' rx='4' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<rect x='126' y='100' width='164' height='284' rx='4' fill='" + s.sheen + "'/>" +
        "<g fill='none' stroke='" + s.dark2 + "' stroke-width='3' stroke-linecap='round' opacity='0.75'>" +
        "<path d='" + coil + "'/></g>" +
        "<rect x='266' y='100' width='10' height='284' fill='" + s.dark + "' opacity='0.4'/>" +
        "</svg>";
    },

    sticker: function (c) {
      var s = svgOpen('sticker', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('sticker', 200, 358, 105, 12) +
        "<circle cx='200' cy='250' r='106' fill='#f7f5ef' stroke='#e2ded0' stroke-width='1'/>" +
        "<circle cx='200' cy='250' r='103' fill='none' stroke='#c9c4b4' stroke-width='1.5' stroke-dasharray='5,4'/>" +
        "<circle cx='198' cy='248' r='95' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<circle cx='198' cy='248' r='95' fill='" + s.sheen + "'/>" +
        "<ellipse cx='168' cy='213' rx='30' ry='16' fill='#ffffff' opacity='0.22'/>" +
        "<path d='M280,175 Q300,190 296,215 Q286,206 270,206 Q276,190 280,175 Z' fill='#f7f5ef' stroke='#c9c4b4' stroke-width='1.2'/>" +
        "<path d='M270,206 Q286,206 296,215' fill='none' stroke='#c9c4b4' stroke-width='1' opacity='0.5'/>" +
        "</svg>";
    },

    poster: function (c) {
      var s = svgOpen('poster', c);
      var body = "M100,52 L300,50 L302,432 Q280,448 200,450 Q120,448 98,432 Z";
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('poster', 200, 464, 112, 13) +
        "<path d='" + body + "' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='" + body + "' fill='" + s.sheen + "'/>" +
        "<path d='M100,52 L300,50' fill='none' stroke='#ffffff' stroke-width='2' opacity='0.3'/>" +
        "<path d='M98,432 Q120,448 200,450 Q280,448 302,432' fill='none' stroke='" + s.dark + "' stroke-width='1.5' opacity='0.4'/>" +
        "<circle cx='112' cy='58' r='6' fill='" + s.dark2 + "'/><circle cx='112' cy='58' r='2.4' fill='#ffffff' opacity='0.6'/>" +
        "<circle cx='288' cy='58' r='6' fill='" + s.dark2 + "'/><circle cx='288' cy='58' r='2.4' fill='#ffffff' opacity='0.6'/>" +
        "</svg>";
    }
  };

  // Photographic finishing pass — fine material grain + a soft diagonal
  // studio-light sweep + a gentle vignette. Purely additive (alpha only, no
  // blend-modes, so it renders identically wherever the SVG is used — as an
  // <img> src, inline, or rasterized to PNG). Spliced in once per render in
  // svgToDataUrl below, so every one of the 20 products gets it for free.
  function realismPass(uid) {
    return "<defs>" +
      "<filter id='grain" + uid + "' x='0' y='0' width='100%' height='100%'>" +
      "<feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch' result='n'/>" +
      "<feColorMatrix in='n' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0'/>" +
      "</filter>" +
      "<linearGradient id='sweep" + uid + "' x1='8%' y1='0%' x2='78%' y2='100%'>" +
      "<stop offset='0%' stop-color='#ffffff' stop-opacity='0.20'/>" +
      "<stop offset='26%' stop-color='#ffffff' stop-opacity='0'/>" +
      "<stop offset='70%' stop-color='#ffffff' stop-opacity='0'/>" +
      "<stop offset='100%' stop-color='#000000' stop-opacity='0.06'/>" +
      "</linearGradient>" +
      "<radialGradient id='vig" + uid + "' cx='50%' cy='40%' r='74%'>" +
      "<stop offset='0%' stop-color='#000000' stop-opacity='0'/>" +
      "<stop offset='70%' stop-color='#000000' stop-opacity='0'/>" +
      "<stop offset='100%' stop-color='#000000' stop-opacity='0.10'/>" +
      "</radialGradient>" +
      "</defs>" +
      "<rect x='0' y='0' width='400' height='500' filter='url(#grain" + uid + ")' pointer-events='none'/>" +
      "<rect x='0' y='0' width='400' height='500' fill='url(#sweep" + uid + ")' pointer-events='none'/>" +
      "<rect x='0' y='0' width='400' height='500' fill='url(#vig" + uid + ")' pointer-events='none'/>";
  }

  function svgToDataUrl(id, color) {
    var svg = generators[id](color);
    // Every generator returns a self-contained <svg>...</svg> string. We
    // splice the shared studio backdrop in right after the opening tag, and
    // the realism pass in right before the closing tag — the two places
    // that touch all products, so upgrading the shared "camera" (backdrop,
    // grain, light sweep, vignette) never requires editing the 20
    // individual generator functions above.
    svg = svg.replace(/(<svg[^>]*>)/, '$1' + studioBackdrop(id));
    svg = svg.replace(/<\/svg>\s*$/, realismPass(id) + '</svg>');
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  /* ---------- State ---------- */
  var currentProduct = products[0];
  var currentColor = '#ffffff';           // string (solid) or {mode:'gradient', from, to, direction}
  var colorMode = 'solid';                // 'solid' | 'gradient'
  var isCustomMockup = false;             // true when the user uploaded their own base photo
  var currentPosition = 'center';
  var logoDataUrl = null;
  var isDragging = false;
  var dragOffsetX = 0, dragOffsetY = 0;

  var productGrid = document.getElementById('productGrid');
  var mockupImage = document.getElementById('mockupImage');
  var studioProductName = document.getElementById('studioProductName');
  var logoOverlay = document.getElementById('logoOverlay');
  var logoUpload = document.getElementById('logoUpload');
  var logoFileName = document.getElementById('logoFileName');
  var colorSwatches = document.getElementById('colorSwatches');
  var sizeRange = document.getElementById('sizeRange');
  var positionBtns = document.querySelectorAll('.position-btns button');
  var resetLogoBtn = document.getElementById('resetLogoBtn');
  var downloadBtn = document.getElementById('downloadBtn');
  var studioForm = document.getElementById('studioForm');
  var studioFormNote = document.getElementById('studioFormNote');
  var studioCanvas = document.getElementById('studioCanvas');
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

  /* ---------- Build product grid ---------- */
  products.forEach(function (p, index) {
    var thumb = document.createElement('div');
    thumb.className = 'product-thumb' + (index === 0 ? ' is-active' : '');
    thumb.setAttribute('data-cat', p.cat);
    thumb.innerHTML = '<img src="' + svgToDataUrl(p.id, '#ffffff') + '" alt="' + p.name + '"><span>' + p.name + '</span>';
    thumb.addEventListener('click', function () { selectProduct(p, thumb); });
    productGrid.appendChild(thumb);
  });

  function selectProduct(product, thumbEl) {
    currentProduct = product;
    exitCustomMockupMode();
    document.querySelectorAll('.product-thumb').forEach(function (t) { t.classList.remove('is-active'); });
    thumbEl.classList.add('is-active');
    studioProductName.textContent = product.name;
    mockupImage.src = svgToDataUrl(product.id, currentColor);
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
  var uploadBox = document.querySelector('.upload-box');
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
      logoOverlay.style.display = 'block';
      logoFileName.textContent = file.name;
      logoFileName.style.display = 'block';
      applyPosition(currentPosition);
      applySize(sizeRange.value);
    };
    reader.readAsDataURL(file);
  });

  /* ---------- Position presets ---------- */
  function applyPosition(position) {
    currentPosition = position;
    var top = 45, left = 50;
    if (position === 'left-chest') { top = 32; left = 35; }
    if (position === 'right-chest') { top = 32; left = 65; }
    if (position === 'center') { top = 45; left = 50; }
    logoOverlay.style.top = top + '%';
    logoOverlay.style.left = left + '%';
    logoOverlay.style.transform = 'translate(-50%, -50%)';
  }

  positionBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      positionBtns.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      applyPosition(btn.getAttribute('data-position'));
    });
  });

  /* ---------- Size slider ---------- */
  function applySize(size) {
    logoOverlay.style.maxWidth = size + 'px';
    logoOverlay.style.maxHeight = size + 'px';
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

  // Applies the current color/gradient to whichever product is on canvas —
  // no-op while a custom uploaded photo is showing, since recoloring only
  // makes sense for the generated product SVGs.
  function refreshMockupColor() {
    if (isCustomMockup) return;
    mockupImage.src = svgToDataUrl(currentProduct.id, currentColor);
  }

  /* ---------- Upload your own mockup photo ---------- */
  function exitCustomMockupMode() {
    if (!isCustomMockup) return;
    isCustomMockup = false;
    customMockupNote.style.display = 'none';
    colorControlsField.classList.remove('is-disabled');
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
      isCustomMockup = true;
      currentProduct = { id: 'custom', name: 'Your Mockup', cat: 'custom' };
      mockupImage.src = evt.target.result;
      studioProductName.textContent = 'Your Custom Mockup';
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

  /* ---------- Drag to reposition ---------- */
  logoOverlay.addEventListener('mousedown', startDrag);
  logoOverlay.addEventListener('touchstart', startDrag, { passive: true });
  document.addEventListener('mousemove', drag);
  document.addEventListener('touchmove', drag, { passive: true });
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);

  function getPoint(e) {
    if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  function startDrag(e) {
    if (!logoDataUrl) return;
    isDragging = true;
    logoOverlay.classList.add('is-dragging');
    var rect = logoOverlay.getBoundingClientRect();
    var pt = getPoint(e);
    dragOffsetX = pt.x - rect.left - rect.width / 2;
    dragOffsetY = pt.y - rect.top - rect.height / 2;
  }

  function drag(e) {
    if (!isDragging) return;
    var canvasRect = studioCanvas.getBoundingClientRect();
    var pt = getPoint(e);
    var x = pt.x - canvasRect.left - dragOffsetX;
    var y = pt.y - canvasRect.top - dragOffsetY;
    x = Math.max(0, Math.min(x, canvasRect.width));
    y = Math.max(0, Math.min(y, canvasRect.height));
    logoOverlay.style.left = (x / canvasRect.width * 100) + '%';
    logoOverlay.style.top = (y / canvasRect.height * 100) + '%';
    logoOverlay.style.transform = 'translate(-50%, -50%)';
  }

  function stopDrag() {
    isDragging = false;
    logoOverlay.classList.remove('is-dragging');
  }

  /* ---------- Reset ---------- */
  resetLogoBtn.addEventListener('click', function () {
    logoDataUrl = null;
    logoOverlay.style.display = 'none';
    logoOverlay.src = '';
    logoUpload.value = '';
    logoFileName.style.display = 'none';
  });

  /* ---------- Render final composite onto an offscreen canvas ---------- */
  function renderComposite(targetWidth, targetHeight, callback) {
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = targetWidth;
    tempCanvas.height = targetHeight;
    var ctx = tempCanvas.getContext('2d');

    var base = new Image();
    base.crossOrigin = 'anonymous';
    base.onload = function () {
      ctx.drawImage(base, 0, 0, targetWidth, targetHeight);

      if (!logoDataUrl) { callback(tempCanvas); return; }

      var canvasRect = studioCanvas.getBoundingClientRect();
      var overlayRect = logoOverlay.getBoundingClientRect();
      var scaleX = targetWidth / canvasRect.width;
      var scaleY = targetHeight / canvasRect.height;

      var logo = new Image();
      logo.onload = function () {
        var w = overlayRect.width * scaleX;
        var h = overlayRect.height * scaleY;
        var x = (overlayRect.left - canvasRect.left) * scaleX;
        var y = (overlayRect.top - canvasRect.top) * scaleY;
        ctx.drawImage(logo, x, y, w, h);
        callback(tempCanvas);
      };
      logo.src = logoDataUrl;
    };
    base.src = mockupImage.src;
  }

  /* ---------- Download PNG ---------- */
  downloadBtn.addEventListener('click', function () {
    if (!logoDataUrl) {
      alert('Upload your logo first, then download your mockup.');
      return;
    }
    renderComposite(1000, 1250, function (canvas) {
      var link = document.createElement('a');
      link.download = currentProduct.name.toLowerCase().replace(/\s+/g, '-') + '-mockup.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
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
  mockupImage.src = svgToDataUrl(currentProduct.id, currentColor);
  applySize(sizeRange.value);
})();