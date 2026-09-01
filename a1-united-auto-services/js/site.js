/* site.js — bb-v4 reference behaviors, generalized. First-party only: no cookies,
   no IP, no third party. Site slug comes from <body data-site>; analytics is OPTIONAL —
   a deployed site only sends events if ../analytics.json exists beside it. */
(function () {
  'use strict';

  var SITE = document.body.getAttribute('data-site') || location.pathname.split('/').filter(Boolean)[0] || 'site';

  /* ---- the five events (no-ops until analytics.json resolves) ------------ */
  var sent = {};
  var _cfg = fetch('../analytics.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .catch(function () { return null; });
  function ev(name, detail) {
    if (name === 'Work viewed' || name === 'Reached CTA') { if (sent[name]) return; sent[name] = 1; }
    var body = JSON.stringify({ s: SITE, e: name, d: detail || '', p: location.pathname });
    if (navigator.sendBeacon) {
      _cfg.then(function (c) { if (c && c.url) { try { navigator.sendBeacon(c.url + '/e', body); } catch (x) {} } });
    }
  }
  ev('Visit');

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : e.target.parentElement;
    if (!t || !t.closest) return;
    if (t.closest('a[href^="tel:"]')) ev('Call', t.closest('a[href^="tel:"]').getAttribute('href'));
    if (t.closest('a[href*="google.com/maps"]')) ev('Directions');
    var hit = t.closest('.card__hit');
    if (hit) ev('Work viewed', (hit.querySelector('.card__s') || {}).textContent || '');
  }, true);

  /* lead capture: full form payload -> collector -> forwarded to the client's CRM */
  function sendLead(form) {
    try {
      var o = { s: SITE };
      var fd = new FormData(form);
      fd.forEach(function (v, k) {
        if (typeof v !== 'string' || !v) return;
        if (o[k] === undefined) o[k] = v;
        else if (Array.isArray(o[k])) o[k].push(v);
        else o[k] = [o[k], v];
      });
      _cfg.then(function (c) {
        if (c && c.url) fetch(c.url + '/lead', { method: 'POST', mode: 'no-cors',
          keepalive: true, body: JSON.stringify(o),
          headers: { 'Content-Type': 'text/plain' } }).catch(function () {});
      }).catch(function () {});
    } catch (e) {}
  }
  var form = document.getElementById('submit');
  if (form) form.addEventListener('submit', function () { ev('Quote request'); sendLead(form); });

  var cta = document.getElementById('quote');
  if (cta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (rows) {
      rows.forEach(function (r) { if (r.isIntersecting) ev('Reached CTA'); });
    }, { threshold: 0.15 }).observe(cta);
  }

  /* ---- nav: progress rail + section-aware aria-current ------------------ */
  var rail = document.getElementById('rail');
  var links = [].slice.call(document.querySelectorAll('.nav__links a'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var tick;
  function paint() {
    tick = 0;
    if (rail) {
      var h = document.documentElement.scrollHeight - innerHeight;
      rail.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + '%';
    }
    var best = -1;
    secs.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top <= innerHeight * 0.4) best = i;
    });
    links.forEach(function (a, i) {
      if (i === best) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', function () { if (!tick) tick = requestAnimationFrame(paint); }, { passive: true });
  paint();

  /* ---- add to project: card button pre-fills the quote form -------------- */
  var picks = [];
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.card__add') : null;
    if (!b) return;
    var want = b.getAttribute('data-want');   // free text - never interpolate into a selector
    [].forEach.call(document.querySelectorAll('.opts input'), function (i) {
      if (i.value === want) i.checked = true;
    });
    var p = b.getAttribute('data-product');
    if (picks.indexOf(p) < 0) picks.push(p);
    var hid = document.getElementById('f-products');
    if (hid) hid.value = picks.join(', ');
    var line = document.getElementById('picked');
    if (line) { line.textContent = 'On your project: ' + picks.join(', '); line.hidden = false; }
    b.textContent = 'Added ✓';
    b.classList.add('on');
    ev('Add to project', p);
  });

  /* ---- scroll-in rise (Hormozi pass): section children fade up once ------ */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var riseObs = new IntersectionObserver(function (rows) {
      rows.forEach(function (r) {
        if (r.isIntersecting) { r.target.classList.add('on'); riseObs.unobserve(r.target); }
      });
    }, { threshold: 0.12 });
    [].slice.call(document.querySelectorAll('.band .wrap > *, .card, .pj')).forEach(function (el) {
      el.classList.add('rise'); riseObs.observe(el);
    });
  }

  /* ---- a CTA under the LEAD project only (Grady 8/31) ---- */
  (function () {
    var bar = document.querySelector('.pj:first-child .pj__bar');
    if (!bar) return;
    var a = document.createElement('a');
    a.className = 'pj__cta';
    a.href = '#quote';
    a.textContent = 'Get a free estimate';
    bar.appendChild(a);
  })();

  /* ---- the word "free" in the form heading goes gold ---- */
  (function () {
    var h = document.querySelector('#quote h2');
    if (h) h.innerHTML = h.textContent.replace(/free/i, function (m) { return '<span class="gold">' + m + '</span>'; });
  })();

  /* ---- before/after slider ---- */
  [].forEach.call(document.querySelectorAll('.ba'), function (ba) {
    var r = ba.querySelector('.ba__range'), after = ba.querySelector('.ba__after'),
        bar = ba.querySelector('.ba__bar'), knob = ba.querySelector('.ba__knob');
    if (!r || !after) return;
    function set(v) {
      after.style.clipPath = 'inset(0 0 0 ' + v + '%)';
      if (bar) bar.style.left = v + '%';
      if (knob) knob.style.left = v + '%';
    }
    r.addEventListener('input', function () { auto = false; set(r.value); });
    /* direct pointer drive - follows the finger anywhere on the photo. The panel cap (min)
       only applies when the glass panel actually overlays the photo (desktop). */
    var dragging = false, settleTimer = null, settleAnim = null;
    function bounds() {
      var glass = document.querySelector('.glass');
      var overlaid = glass && getComputedStyle(glass).position === 'absolute';
      return [overlaid ? (+r.min || 0) : 0, +r.max || 100];
    }
    function drive(e) {
      var rect = ba.getBoundingClientRect();
      var b = bounds();
      var v = Math.max(b[0], Math.min(b[1], (e.clientX - rect.left) / rect.width * 100));
      r.value = v;
      set(v);
    }
    function settleToAfter() {
      var b = bounds(), from = +r.value, to = b[1], t0 = null;
      if (settleAnim) cancelAnimationFrame(settleAnim);
      var step = function (ts) {
        if (dragging) return;
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / 600);
        var v = from + (to - from) * (1 - Math.pow(1 - k, 3));
        r.value = v;
        set(v);
        if (k < 1) settleAnim = requestAnimationFrame(step);
      };
      settleAnim = requestAnimationFrame(step);
    }
    ba.addEventListener('pointerdown', function (e) {
      auto = false; dragging = true;
      if (settleTimer) clearTimeout(settleTimer);
      if (settleAnim) cancelAnimationFrame(settleAnim);
      if (ba.setPointerCapture) { try { ba.setPointerCapture(e.pointerId); } catch (x) {} }
      drive(e);
    });
    ba.addEventListener('pointermove', function (e) { if (dragging) drive(e); });
    function release() {
      dragging = false;
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(settleToAfter, 1000);   /* one beat, then glide to the AFTER */
    }
    ba.addEventListener('pointerup', release);
    ba.addEventListener('pointercancel', release);
    set(r.value || 50);
    /* slow pulse between the endpoints until the viewer takes over (reduced-motion: off) */
    var auto = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (auto) {
      var lo = +r.min || 0, hi = +r.max || 100, t0 = null;
      var loop = function (ts) {
        if (!auto) return;
        if (t0 === null) t0 = ts;
        // two reveal passes (1.5 cycles), then rest on the AFTER
        if (ts - t0 >= 10500) { r.value = hi; set(hi); auto = false; return; }
        var v = lo + (hi - lo) * (0.5 - 0.5 * Math.cos((ts - t0) / 7000 * 2 * Math.PI));
        r.value = v;
        set(v);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  });

  /* ---- dwell: one beacon per view with seconds on page (3s..30min) ------- */
  var t0 = Date.now(), dwelled = false;
  function dwell() {
    if (dwelled) return;
    dwelled = true;
    var s = Math.round((Date.now() - t0) / 1000);
    if (s >= 3 && s <= 1800) ev('Dwell', String(s));
  }
  addEventListener('pagehide', dwell);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') dwell();
  });

  /* ---- one gesture per photograph: on touch the first tap flips ---------- */
  if (matchMedia('(hover: none)').matches) {
    document.addEventListener('click', function (e) {
      var hit = e.target.closest ? e.target.closest('.card__hit') : null;
      if (!hit) return;
      var card = hit.closest('.card');
      if (card && !card.classList.contains('is-flip')) { e.preventDefault(); card.classList.add('is-flip'); }
    });
  }

  /* ---- sticky CTA waits for a scroll (Grady 9/1: invisible on first load) - */
  var qb = document.querySelector('.quote-bubble');
  if (qb) {
    var qbUpd = function () { qb.classList.toggle('show', window.scrollY > 160); };
    window.addEventListener('scroll', qbUpd, { passive: true });
    qbUpd();
  }
})();
