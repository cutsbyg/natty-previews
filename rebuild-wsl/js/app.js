/* WSL — interaction only. Nothing here is the mechanism for anything (0y). */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- MARQUEE: author two, clone to fill from ONE stored seed ---------- */
  var mq = document.querySelector('.marquee');
  if (mq) {
    var first = mq.querySelector('.mq');
    var seed = first.innerHTML;                       // the one stored seed
    var build = function () {
      var w = mq.clientWidth;
      if (!w) return;
      // 1. every copy is identical: repeat the seed inside each until one copy >= container
      first.innerHTML = seed;
      var unit = first.scrollWidth || 1;
      var reps = Math.max(1, Math.ceil(w / unit));
      var body = new Array(reps + 1).join(seed) || seed;
      // 2. enough copies that the -100% slide never exposes paper
      var copies = 2, one = 0;
      while (mq.children.length > 1) mq.removeChild(mq.lastChild);
      first.innerHTML = body;
      one = first.scrollWidth;
      var need = Math.max(w * 2, w + one);
      while (mq.scrollWidth < need && copies < 24) {
        var c = first.cloneNode(true);
        mq.appendChild(c);
        copies++;
      }
    };
    build();
    var t;
    addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 180); });
  }

  /* ---- NAV: progress rail, section awareness, one idle nudge ------------ */
  var rail = document.querySelector('.nav__rail i');
  var nav = document.querySelector('.nav');
  if (rail) {
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      rail.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + '%';
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  var links = [].slice.call(document.querySelectorAll('.nav__links a'));
  if (links.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          a.removeAttribute('aria-current');
          if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['work', 'who', 'reviews', 'faq'].forEach(function (id) {
      var el = document.getElementById(id); if (el) io.observe(el);
    });
  }
  if (nav && !reduced) {
    var nudged = false;
    var idle = setTimeout(function () {
      if (!nudged && scrollY < 40) { nav.classList.add('nudge'); nudged = true; }
    }, 8000);
    addEventListener('scroll', function () { clearTimeout(idle); }, { once: true, passive: true });
  }

  /* ---- REVEAL: once, never again on scroll-back ------------------------- */
  if ('IntersectionObserver' in window && !reduced) {
    var targets = document.querySelectorAll('.band .h2, .tile, .rev, .who__fig, .crew, .stats li, .cta__fig');
    [].forEach.call(targets, function (el, i) { if (i < 60) el.classList.add('rv'); });
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    [].forEach.call(targets, function (el) { ro.observe(el); });
  }

  /* ---- LIGHTBOX: Esc leaves it (the × is a real link, JS-off safe) ------ */
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.querySelector('.lb:target')) {
      history.replaceState(null, '', '#work');
      location.hash = '#work';
    }
  });

  /* ---- FORM: validate before the browser posts (0y) --------------------- */
  var f = document.getElementById('submit');
  if (f) {
    f.addEventListener('submit', function (e) {
      if (!f.checkValidity()) { e.preventDefault(); f.reportValidity(); }
    });
  }
})();
