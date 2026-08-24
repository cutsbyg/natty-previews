/* QnC Construction — page behaviour only.
   Nothing here talks to analytics: the beacon (/a.js) instruments the page by delegation,
   so this file never calls a global that may not exist. Everything degrades: with JS off the
   page renders whole, the headline and the buttons are there, and every link still works. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ── scroll progress rail + scroll-velocity weight ── */
  var rail = $('#rail'), nav = $('#nav'), lastY = 0, lastT = 0;
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - innerHeight;
    var y = scrollY;
    if (rail) rail.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    var now = performance.now(), v = Math.abs(y - lastY) / Math.max(1, now - lastT);
    if (nav) nav.style.boxShadow = y > 8
      ? '0 ' + Math.min(22, 10 + v * 14).toFixed(1) + 'px 30px rgba(0,0,0,.28)'
      : '0 10px 30px rgba(0,0,0,.22)';
    lastY = y; lastT = now;
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── section-aware nav ── */
  var links = $$('.nav-link');
  var secs = links.map(function (a) { return $(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var i = secs.indexOf(e.target);
        if (i < 0) return;
        if (e.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute('aria-current'); });
          links[i].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { if (s) io.observe(s); });
  }

  /* ── project lightbox: the card IS the project, so it opens that project ── */
  $$('#work .pj').forEach(function (card) {
    card.addEventListener('click', function () {
      var d = document.getElementById(card.getAttribute('data-lb'));
      if (d && d.showModal) d.showModal(); else if (d) d.setAttribute('open', '');
    });
  });
  $$('.lb').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    var x = $('[data-close]', d);
    if (x) x.addEventListener('click', function () { d.close(); });
  });

  /* ── touch fork for the second photograph: hover is not available on a finger ── */
  if (!matchMedia('(hover: hover)').matches && !reduce) {
    var cards = $$('#work .pj'), i = 0;
    setInterval(function () {
      cards.forEach(function (c) { c.classList.remove('flip'); });
      cards[i % cards.length].classList.add('flip');
      i++;
    }, 4200);
  }

  /* ── count-up, once, on quantities only. The final value is already in the HTML. ── */
  var nums = $$('[data-to]');
  if (nums.length && 'IntersectionObserver' in window && !reduce) {
    var no = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        no.unobserve(e.target);
        var el = e.target, to = parseInt(el.getAttribute('data-to'), 10), t0 = null;
        function step(t) {
          if (t0 === null) t0 = t;
          var p = Math.min(1, (t - t0) / 900);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step); else el.textContent = to;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { no.observe(n); });
  }

  /* ── cursor proximity, ±8px, on the panel figure and the founder frame ── */
  if (matchMedia('(hover: hover)').matches && !reduce) {
    $$('.hero__cut img, .founder__frame').forEach(function (el) {
      var box = el.closest('.hero__panel') || el;
      box.addEventListener('pointermove', function (e) {
        var r = box.getBoundingClientRect();
        var dx = ((e.clientX - r.left) / r.width - .5) * 16;
        var dy = ((e.clientY - r.top) / r.height - .5) * 16;
        el.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      });
      box.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ── idle nudge: three pulses at 8s, twice maximum ── */
  var cue = $('.cue'), fired = 0, timer;
  function arm() {
    clearTimeout(timer);
    if (fired >= 2 || !cue || reduce) return;
    timer = setTimeout(function () {
      if (scrollY > 40) return;
      fired++;
      cue.classList.add('nudge');
      setTimeout(function () { cue.classList.remove('nudge'); arm(); }, 3200);
    }, 8000);
  }
  ['pointerdown', 'keydown', 'scroll'].forEach(function (ev) {
    addEventListener(ev, arm, { passive: true });
  });
  arm();
})();
