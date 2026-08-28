/* a.js — first-party only. No cookies, no IP, no tag manager, no third party.
   Five fixed events, instrumented by delegation so a rebuild cannot drop them. */
(function () {
  'use strict';

  /* ---- the five events ------------------------------------------------- */
  var sent = {};
  var _cfg = fetch('../analytics.json', { cache: 'no-store' }).then(function (r) { return r.json(); });
  function ev(name, detail) {
    if (name === 'Work viewed' || name === 'Reached CTA') { if (sent[name]) return; sent[name] = 1; }
    var body = JSON.stringify({ s: 'bb-v4', e: name, d: detail || '', p: location.pathname });
    if (navigator.sendBeacon) {
      _cfg.then(function (c) { if (c && c.url) { try { navigator.sendBeacon(c.url + '/e', body); } catch (x) {} } }).catch(function () {});
    }
    if (window.console && console.debug) console.debug('[a]', name, detail || '');
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : e.target.parentElement;
    if (!t || !t.closest) return;
    if (t.closest('a[href^="tel:"]')) ev('Call', t.closest('a[href^="tel:"]').getAttribute('href'));
    if (t.closest('a[href*="google.com/maps"]')) ev('Directions');
    var hit = t.closest('.card__hit');
    if (hit) ev('Work viewed', (hit.querySelector('.card__s') || {}).textContent || '');
  }, true);


  /* lead capture: full form payload -> our collector -> forwarded to the client's GHL */
  function sendLead(form, site) {
    try {
      var o = { s: site };
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
          headers: { 'Content-Type': 'text/plain' } });
      }).catch(function () {});
    } catch (e) {}
  }

  var form = document.getElementById('submit');
  if (form) form.addEventListener('submit', function () { ev('Quote request'); sendLead(form, 'bb-v4'); });

  var cta = document.getElementById('quote');
  if (cta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (rows) {
      rows.forEach(function (r) { if (r.isIntersecting) ev('Reached CTA'); });
    }, { threshold: 0.15 }).observe(cta);
  }

  /* ---- marquee: clone from ONE stored seed until the track has no hole --- */
  var box = document.querySelector('.marquee');
  var seed = document.getElementById('mqseed');
  if (box && seed) {
    var HTML = seed.innerHTML;              // the seed, read once and never re-read from a grown copy
    var timer;
    var fill = function () {
      var copies = box.querySelectorAll('.mq');
      for (var i = 1; i < copies.length; i++) copies[i].parentNode.removeChild(copies[i]);
      seed.innerHTML = HTML;
      var guard = 0;
      while (seed.scrollWidth < box.clientWidth && guard++ < 24) seed.innerHTML += HTML;
      var twin = seed.cloneNode(true);
      twin.removeAttribute('id');
      box.appendChild(twin);                // one copy >= container, track >= 2x container
    };
    fill();
    addEventListener('resize', function () { clearTimeout(timer); timer = setTimeout(fill, 150); });
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

  /* ---- add to pricing: card button pre-fills the quote form -------------- */
  var picks = [];
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.card__add') : null;
    if (!b) return;
    var box = document.querySelector('.opts input[value="' + b.getAttribute('data-want') + '"]');
    if (box) box.checked = true;
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
    [].slice.call(document.querySelectorAll('.band .wrap > *, .card')).forEach(function (el) {
      el.classList.add('rise'); riseObs.observe(el);
    });
  }

  /* ---- §8.4 one gesture per photograph: on touch the first tap flips ----- */
  if (matchMedia('(hover: none)').matches) {
    document.addEventListener('click', function (e) {
      var hit = e.target.closest ? e.target.closest('.card__hit') : null;
      if (!hit) return;
      var card = hit.closest('.card');
      if (card && !card.classList.contains('is-flip')) { e.preventDefault(); card.classList.add('is-flip'); }
    });
  }
})();
