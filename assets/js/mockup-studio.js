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
    var light2 = shade(c, 46);   // brightest specular highlight
    var light = shade(c, 22);    // soft upper highlight
    var dark = shade(c, -15);    // core shadow
    var dark2 = shade(c, -32);   // deepest falloff / occlusion
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
    return "<ellipse cx='" + cx + "' cy='" + (cy + ry * 0.35) + "' rx='" + (rx * 1.35) + "' ry='" + (ry * 1.2) + "' fill='#0a1220' opacity='0.10' filter='url(#blur" + id + ")'/>" +
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
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('tshirt', 200, 470, 130, 16) +
        "<path d='M100 50 L120 30 L140 30 Q150 30 150 40 L150 100 L250 100 L250 40 Q250 30 260 30 L280 30 L300 50 L320 80 L330 90 L330 120 L310 120 L310 480 Q310 490 300 490 L100 490 Q90 490 90 480 L90 120 L70 120 L70 90 Z' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='M150 40 Q200 62 250 40' fill='none' stroke='" + s.dark + "' stroke-width='4' stroke-linecap='round' opacity='0.55'/>" +
        "<path d='M150 100 Q200 118 250 100' fill='none' stroke='" + s.dark + "' stroke-width='1.5' opacity='0.35'/>" +
        "<path d='M110 140 Q108 300 112 460 M290 140 Q292 300 288 460' fill='none' stroke='" + s.dark + "' stroke-width='1.2' opacity='0.25'/>" +
        "</svg>";
    },

    hoodie: function (c) {
      var s = svgOpen('hoodie', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('hoodie', 200, 480, 140, 16) +
        "<path d='M90 60 L110 30 L130 20 Q150 20 150 40 L150 60 L170 50 L230 50 L250 60 L250 40 Q250 20 270 20 L290 30 L310 60 L330 80 L340 100 L340 140 L320 140 L320 480 Q320 495 305 495 L95 495 Q80 495 80 480 L80 140 L60 140 L60 100 Z' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='M150 40 Q200 5 250 40 Q200 55 150 40' fill='" + s.dark + "' opacity='0.45'/>" +
        "<path d='M185 90 L182 200 M215 90 L218 200' fill='none' stroke='" + s.dark + "' stroke-width='2' opacity='0.5'/>" +
        "<rect x='160' y='195' width='80' height='60' rx='8' fill='none' stroke='" + s.dark + "' stroke-width='1.5' opacity='0.4'/>" +
        "</svg>";
    },

    tanktop: function (c) {
      var s = svgOpen('tanktop', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('tanktop', 200, 475, 100, 14) +
        "<path d='M120 50 L140 30 Q150 30 150 40 L150 100 L250 100 L250 40 Q250 30 260 30 L280 50 L280 480 Q280 490 270 490 L130 490 Q120 490 120 480 Z' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='M150 40 Q200 58 250 40' fill='none' stroke='" + s.dark + "' stroke-width='3' opacity='0.5'/>" +
        "</svg>";
    },

    longsleeve: function (c) {
      var s = svgOpen('longsleeve', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('longsleeve', 200, 480, 140, 16) +
        "<path d='M50 80 L100 50 L120 30 L140 30 Q150 30 150 40 L150 100 L250 100 L250 40 Q250 30 260 30 L280 30 L300 50 L350 80 L360 100 L340 120 L340 300 L320 300 L310 120 L310 480 Q310 490 300 490 L100 490 Q90 490 90 480 L90 120 L80 300 L60 300 L60 120 L40 100 Z' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='M150 40 Q200 60 250 40' fill='none' stroke='" + s.dark + "' stroke-width='3' opacity='0.5'/>" +
        "<path d='M105 130 L90 290 M295 130 L310 290' fill='none' stroke='" + s.dark + "' stroke-width='1.2' opacity='0.3'/>" +
        "</svg>";
    },

    polo: function (c) {
      var s = svgOpen('polo', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('polo', 200, 470, 130, 16) +
        "<path d='M100 50 L120 30 L140 30 Q150 30 150 40 L150 100 L180 100 L180 160 L220 160 L220 100 L250 100 L250 40 Q250 30 260 30 L280 30 L300 50 L320 80 L330 90 L330 120 L310 120 L310 480 Q310 490 300 490 L100 490 Q90 490 90 480 L90 120 L70 120 L70 90 Z' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5' stroke-linejoin='round'/>" +
        "<path d='M180 100 L180 160 L220 160 L220 100' fill='none' stroke='" + s.dark + "' stroke-width='2' opacity='0.55'/>" +
        "<circle cx='200' cy='125' r='3' fill='" + s.dark + "' opacity='0.5'/><circle cx='200' cy='148' r='3' fill='" + s.dark + "' opacity='0.5'/>" +
        "</svg>";
    },

    mug: function (c) {
      var s = svgOpen('mug', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('mug', 200, 385, 110, 14) +
        "<path d='M300 185 Q355 185 355 232 Q355 279 300 279' fill='none' stroke='" + s.stroke + "' stroke-width='14' stroke-linecap='round'/>" +
        "<path d='M300 185 Q355 185 355 232 Q355 279 300 279' fill='none' stroke='" + s.fill + "' stroke-width='9' stroke-linecap='round'/>" +
        "<rect x='100' y='125' width='200' height='250' rx='8' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<ellipse cx='200' cy='125' rx='100' ry='14' fill='" + s.dark + "' opacity='0.6'/>" +
        "<ellipse cx='200' cy='123' rx='94' ry='11' fill='" + s.fill + "'/>" +
        "<rect x='118' y='145' width='16' height='210' rx='8' fill='#ffffff' opacity='0.28'/>" +
        "</svg>";
    },

    travelmug: function (c) {
      var s = svgOpen('travelmug', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('travelmug', 200, 425, 75, 12) +
        "<path d='M140 100 L130 400 Q130 420 150 420 L250 420 Q270 420 270 400 L260 100 Z' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<ellipse cx='200' cy='100' rx='60' ry='16' fill='" + s.dark + "' opacity='0.55'/>" +
        "<rect x='170' y='68' width='60' height='18' rx='6' fill='" + s.stroke + "'/>" +
        "<rect x='177' y='72' width='46' height='6' rx='3' fill='#ffffff' opacity='0.25'/>" +
        "<rect x='150' y='150' width='12' height='230' rx='6' fill='#ffffff' opacity='0.25'/>" +
        "</svg>";
    },

    bottle: function (c) {
      var s = svgOpen('bottle', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('bottle', 200, 445, 65, 12) +
        "<rect x='172' y='48' width='56' height='42' rx='4' fill='" + s.stroke + "'/>" +
        "<rect x='178' y='52' width='44' height='8' rx='3' fill='#ffffff' opacity='0.3'/>" +
        "<path d='M160 90 L150 420 Q150 450 180 450 L220 450 Q250 450 250 420 L240 90 Z' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<rect x='166' y='150' width='14' height='250' rx='7' fill='#ffffff' opacity='0.28'/>" +
        "</svg>";
    },

    tumbler: function (c) {
      var s = svgOpen('tumbler', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('tumbler', 200, 445, 68, 12) +
        "<path d='M150 90 L140 400 Q140 430 175 430 L225 430 Q260 430 260 400 L250 90 Z' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<ellipse cx='200' cy='90' rx='50' ry='14' fill='" + s.dark + "' opacity='0.5'/>" +
        "<rect x='157' y='140' width='13' height='250' rx='6' fill='#ffffff' opacity='0.28'/>" +
        "</svg>";
    },

    totebag: function (c) {
      var s = svgOpen('totebag', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('totebag', 200, 460, 115, 14) +
        "<path d='M140 150 Q140 75 200 75 Q260 75 260 150' fill='none' stroke='" + s.stroke + "' stroke-width='9' stroke-linecap='round'/>" +
        "<rect x='100' y='150' width='200' height='300' rx='6' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<path d='M100 195 L300 195' stroke='" + s.dark + "' stroke-width='1.5' opacity='0.35'/>" +
        "<path d='M120 150 L110 450 M280 150 L290 450' stroke='" + s.dark + "' stroke-width='1' opacity='0.25'/>" +
        "</svg>";
    },

    backpack: function (c) {
      var s = svgOpen('backpack', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('backpack', 200, 435, 100, 14) +
        "<path d='M160 100 Q160 48 200 48 Q240 48 240 100' fill='none' stroke='" + s.stroke + "' stroke-width='9' stroke-linecap='round'/>" +
        "<rect x='120' y='100' width='160' height='320' rx='22' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<rect x='158' y='195' width='84' height='90' rx='8' fill='" + s.dark + "' opacity='0.28'/>" +
        "<path d='M155 190 L245 190 M155 290 L245 290' stroke='" + s.dark + "' stroke-width='1.5' opacity='0.4'/>" +
        "<path d='M132 415 L132 460 M268 415 L268 460' stroke='" + s.stroke + "' stroke-width='6' stroke-linecap='round'/>" +
        "</svg>";
    },

    cap: function (c) {
      var s = svgOpen('cap', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('cap', 200, 255, 130, 16) +
        "<path d='M92 224 Q90 260 130 268 Q220 280 310 240 Q315 236 308 228 Q300 224 290 226 Q200 240 100 222 Z' fill='" + s.dark + "' opacity='0.85'/>" +
        "<path d='M100 220 Q100 115 200 115 Q300 115 300 220 Q300 232 288 234 Q200 250 112 234 Q100 232 100 220 Z' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<path d='M200 118 L200 220 M150 122 L158 222 M250 122 L242 222' stroke='" + s.dark + "' stroke-width='1.2' opacity='0.35'/>" +
        "<circle cx='200' cy='120' r='7' fill='" + s.dark + "' opacity='0.7'/>" +
        "</svg>";
    },

    beanie: function (c) {
      var s = svgOpen('beanie', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('beanie', 200, 300, 95, 14) +
        "<path d='M120 250 Q120 145 200 145 Q280 145 280 250 L280 300 Q280 322 258 322 L142 322 Q120 322 120 300 Z' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<rect x='120' y='282' width='160' height='40' fill='" + s.dark + "' opacity='0.3'/>" +
        "<path d='M120 282 L280 282' stroke='" + s.dark + "' stroke-width='1.5' opacity='0.4'/>" +
        "<circle cx='200' cy='135' r='11' fill='" + s.dark + "' opacity='0.6'/>" +
        "</svg>";
    },

    phonecase: function (c) {
      var s = svgOpen('phonecase', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('phonecase', 200, 335, 75, 12) +
        "<rect x='140' y='80' width='120' height='240' rx='18' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<rect x='152' y='92' width='96' height='170' rx='6' fill='#1e293b' opacity='0.15'/>" +
        "<circle cx='200' cy='295' r='11' fill='" + s.dark + "' opacity='0.4'/>" +
        "<rect x='185' y='88' width='30' height='5' rx='2.5' fill='" + s.dark + "' opacity='0.4'/>" +
        "</svg>";
    },

    laptopsleeve: function (c) {
      var s = svgOpen('laptopsleeve', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('laptopsleeve', 200, 350, 130, 14) +
        "<rect x='80' y='150' width='240' height='180' rx='10' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<rect x='95' y='163' width='210' height='154' rx='5' fill='none' stroke='" + s.dark + "' stroke-width='1.5' opacity='0.4'/>" +
        "<path d='M300 235 L320 240 L300 245 Z' fill='" + s.stroke + "'/>" +
        "</svg>";
    },

    mousepad: function (c) {
      var s = svgOpen('mousepad', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('mousepad', 200, 340, 130, 12) +
        "<rect x='90' y='180' width='220' height='160' rx='20' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<rect x='90' y='180' width='220' height='16' rx='8' fill='#ffffff' opacity='0.2'/>" +
        "</svg>";
    },

    powerbank: function (c) {
      var s = svgOpen('powerbank', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('powerbank', 200, 390, 90, 12) +
        "<rect x='140' y='170' width='120' height='200' rx='18' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<rect x='150' y='182' width='12' height='176' rx='6' fill='#ffffff' opacity='0.28'/>" +
        "<circle cx='200' cy='195' r='4' fill='" + s.dark + "' opacity='0.6'/>" +
        "<rect x='185' y='340' width='30' height='8' rx='4' fill='" + s.dark + "' opacity='0.5'/>" +
        "</svg>";
    },

    notebook: function (c) {
      var s = svgOpen('notebook', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('notebook', 200, 395, 110, 14) +
        "<rect x='108' y='100' width='184' height='284' rx='4' fill='" + s.dark + "' opacity='0.5'/>" +
        "<rect x='114' y='100' width='178' height='280' rx='4' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<rect x='114' y='100' width='178' height='16' fill='#ffffff' opacity='0.18'/>" +
        "</svg>";
    },

    sticker: function (c) {
      var s = svgOpen('sticker', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('sticker', 200, 355, 105, 12) +
        "<circle cx='200' cy='250' r='103' fill='none' stroke='" + s.stroke + "' stroke-width='2' stroke-dasharray='6,5' opacity='0.6'/>" +
        "<circle cx='200' cy='250' r='95' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<ellipse cx='170' cy='215' rx='30' ry='16' fill='#ffffff' opacity='0.2'/>" +
        "</svg>";
    },

    poster: function (c) {
      var s = svgOpen('poster', c);
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>" + s.defs +
        groundShadow('poster', 200, 460, 115, 14) +
        "<rect x='100' y='50' width='200' height='400' fill='" + s.fill + "' stroke='" + s.stroke + "' stroke-width='2.5'/>" +
        "<path d='M280 430 L300 450 L300 430 Z' fill='" + s.dark + "' opacity='0.5'/>" +
        "<rect x='100' y='50' width='200' height='14' fill='#ffffff' opacity='0.15'/>" +
        "</svg>";
    }
  };

  function svgToDataUrl(id, color) {
    var svg = generators[id](color);
    // Every generator returns a self-contained <svg>...</svg> string. We
    // splice the shared studio backdrop in right after the opening tag —
    // this is the one place that touches all products, so the backdrop
    // (and any future shared-engine upgrade) never requires editing the
    // 20 individual generator functions above.
    svg = svg.replace(/(<svg[^>]*>)/, '$1' + studioBackdrop(id));
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