/* TrimTek — first-party only. No cookies, no IP, no tag manager, no third party. */
(function () {
  'use strict';

  /* ---------------------------------------------------------- 1  MARQUEE */
  var mq = document.querySelector('.marquee');
  if (mq) {
    var track = document.createElement('div');
    track.className = 'mqtrack';
    var seed = mq.querySelector('.mq');
    var seedHTML = seed.outerHTML;              // ONE stored seed; copy 1 never grows
    mq.replaceChild(track, seed);
    var fill = function () {
      track.innerHTML = seedHTML + seedHTML;
      var one = track.firstElementChild.scrollWidth;
      var need = mq.clientWidth * 2 + one;
      var guard = 0;
      while (track.scrollWidth < need && guard++ < 40) track.insertAdjacentHTML('beforeend', seedHTML);
      track.style.setProperty('--one', track.firstElementChild.scrollWidth + 'px');
    };
    fill();
    var t;
    addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fill, 180); });
  }

  /* ------------------------------------------------ 2  NAV RAIL + CURRENT */
  var fillBar = document.querySelector('.nav__railfill');
  var nav = document.querySelector('.nav');
  var links = [].slice.call(document.querySelectorAll('.nav__links a'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  var onScroll = function () {
    if (fillBar) {
      var max = document.documentElement.scrollHeight - innerHeight;
      fillBar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    }
    var here = -1;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i] && targets[i].getBoundingClientRect().top <= innerHeight * 0.35) here = i;
    }
    links.forEach(function (a, i) {
      if (i === here) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* idle nudge at 8s, once, and never under reduced motion */
  if (nav && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    var idle = setTimeout(function () {
      nav.classList.add('is-nudge');
      setTimeout(function () { nav.classList.remove('is-nudge'); }, 1200);
    }, 8000);
    ['scroll', 'pointerdown', 'keydown'].forEach(function (e) {
      addEventListener(e, function () { clearTimeout(idle); }, { once: true, passive: true });
    });
  }

  /* ------------------------------------------------------- 3  FIVE EVENTS */
  /* Instrumented by delegation, never by hand-added attributes on elements
     that a rebuild would drop. Bot filter on, nothing stored, nothing sent
     anywhere third-party: the owner's own server reads these. */
  var isBot = /bot|crawl|spider|headless|preview|lighthouse/i.test(navigator.userAgent);
  var sent = {};
  function send(name) {
    if (isBot || sent[name]) return;
    sent[name] = 1;
    try {
      navigator.sendBeacon && navigator.sendBeacon('api/ev', new Blob(
        [JSON.stringify({ e: name, p: location.pathname, t: Date.now() })],
        { type: 'application/json' }));
    } catch (e) { /* never break the page for a metric */ }
  }

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('[data-ev]');
    if (a) send(a.getAttribute('data-ev'));
  }, true);

  var form = document.querySelector('form[data-ev-submit]');
  if (form) form.addEventListener('submit', function () { send(form.getAttribute('data-ev-submit')); });

  var quote = document.getElementById('quote');
  if (quote && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting) { send('Reached CTA'); o.disconnect(); }
    }, { threshold: 0.25 }).observe(quote);
  }
})();
