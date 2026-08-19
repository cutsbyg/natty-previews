/* B&D — behaviour only. Nothing on this page depends on it: with JS off the whole
   thing renders, the headline and the buttons are there, and every photograph is
   already in the DOM. */
(function () {
  'use strict';
  var D = document, root = D.documentElement;
  root.classList.add('js');
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── scroll progress rail + scroll-velocity weight on the chrome ───────── */
  var rail = D.getElementById('rail'), nav = D.getElementById('nav');
  var last = 0, lastT = 0;
  function onScroll() {
    var y = scrollY, h = D.body.scrollHeight - innerHeight;
    if (rail) rail.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
    var now = performance.now(), dt = Math.max(16, now - lastT);
    var v = Math.min(1, Math.abs(y - last) / dt / 2.2);
    last = y; lastT = now;
    if (nav && !still) nav.style.boxShadow = '0 ' + (10 + v * 14).toFixed(1) + 'px ' +
      (30 + v * 26).toFixed(1) + 'px rgba(0,0,0,' + (0.18 + v * 0.16).toFixed(3) + ')';
    idle();
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── section-aware nav ─────────────────────────────────────────────────── */
  var links = [].slice.call(D.querySelectorAll('.nav-link'));
  var secs = links.map(function (a) { return D.querySelector(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    // Track what is actually in the reading band. Setting aria-current on entry alone
    // leaves the last section marked forever once it scrolls away again.
    var live = [];
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var i = secs.indexOf(e.target);
        if (i < 0) return;
        var at = live.indexOf(i);
        if (e.isIntersecting && at < 0) live.push(i);
        if (!e.isIntersecting && at >= 0) live.splice(at, 1);
      });
      links.forEach(function (a) { a.removeAttribute('aria-current'); });
      if (live.length) links[Math.min.apply(null, live)].setAttribute('aria-current', 'true');
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { if (s) io.observe(s); });

    /* reveal — the element is visible without this; the class only adds the travel */
    var rv = new IntersectionObserver(function (es) {
      es.forEach(function (e, n) {
        if (!e.isIntersecting) return;
        e.target.style.animationDelay = Math.min(5, n) * 100 + 'ms';
        e.target.classList.add('rv');
        rv.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    [].forEach.call(D.querySelectorAll('.pj, .rev, .stat, .fndphoto, .quote, .ctacard'),
      function (e) { rv.observe(e); });

    /* one count-up, on a quantity, once */
    var cu = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        cu.unobserve(e.target);
        var to = parseInt(e.target.getAttribute('data-to'), 10);
        if (still || !to) return;
        var t0 = performance.now();
        (function step(t) {
          var k = Math.min(1, (t - t0) / 900);
          e.target.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    [].forEach.call(D.querySelectorAll('[data-to]'), function (e) { cu.observe(e); });
  }

  /* ── cursor proximity, ±8px, on two elements ───────────────────────────── */
  if (!still && matchMedia('(hover:hover)').matches) {
    addEventListener('pointermove', function (ev) {
      var x = (ev.clientX / innerWidth - 0.5) * 16, y = (ev.clientY / innerHeight - 0.5) * 16;
      [].forEach.call(D.querySelectorAll('.par'), function (e) {
        e.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
    }, { passive: true });
  }

  /* ── idle nudge: three pulses, twice at most ───────────────────────────── */
  var timer, nudges = 0;
  function idle() {
    clearTimeout(timer);
    if (nudges >= 2 || still || !nav) return;
    timer = setTimeout(function () {
      nudges++;
      nav.classList.add('nudge');
      setTimeout(function () { nav.classList.remove('nudge'); nav.style.boxShadow = ''; }, 3400);
    }, 8000);
  }
  addEventListener('pointermove', idle, { passive: true });
  idle();

  /* ── the project lightbox — the card IS the project, so this is where it goes ── */
  var lb = D.getElementById('lb'), lbA = D.getElementById('lbA'), lbB = D.getElementById('lbB'),
      lbT = D.getElementById('lbT'), lbM = D.getElementById('lbM'), lbX = D.getElementById('lbX');
  var opener = null;
  D.addEventListener('click', function (ev) {
    var hit = ev.target.closest && ev.target.closest('[data-lb]');
    if (hit && lb) {
      var card = hit.closest('.pj');
      var a = card.querySelector('img.a'), b = card.querySelector('img.b');
      lbA.src = a.getAttribute('src'); lbA.alt = a.getAttribute('alt');
      lbB.src = b.getAttribute('src'); lbB.alt = b.getAttribute('alt');
      lbT.textContent = card.querySelector('h3').textContent;
      lbM.textContent = card.querySelector('.pj__t p').textContent;
      opener = hit;
      if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
      return;
    }
    if (ev.target === lbX || ev.target === lb) { lb.close ? lb.close() : lb.removeAttribute('open'); }
  });
  if (lb) lb.addEventListener('close', function () { if (opener) opener.focus(); });

  /* ── touch: the flip still has to happen without a pointer ─────────────── */
  if (!still && matchMedia('(hover:none)').matches) {
    var cards = [].slice.call(D.querySelectorAll('.pj')), n = 0;
    setInterval(function () {
      cards.forEach(function (c) { c.classList.remove('flip'); });
      if (cards.length) cards[n % cards.length].classList.add('flip');
      n++;
    }, 4600);
  }
})();

/* sticky mobile CTA — no form on this build, so the target is the CTA band itself */
(function () {
  var bar = document.getElementById('stick');
  if (!bar || !('IntersectionObserver' in window)) return;
  var hero = document.querySelector('.hero, #top'),
      cta = document.getElementById('cta');
  if (!hero || !cta) return;
  bar.hidden = false;
  var pastHero = false, atCta = false;
  function apply() { bar.classList.toggle('on', pastHero && !atCta); }
  new IntersectionObserver(function (es) { pastHero = !es[0].isIntersecting; apply(); },
    {threshold: 0}).observe(hero);
  new IntersectionObserver(function (es) { atCta = es[0].isIntersecting; apply(); },
    {threshold: 0.25}).observe(cta);
})();
