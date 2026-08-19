/* Jesse James Hardscaping — behaviour. Nothing here is the mechanism for anything;
   the page works with JS off. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = matchMedia('(hover: none)').matches;

  /* ---------- MARQUEE: clone from ONE stored seed until a copy fills the box ---------- */
  var box = document.querySelector('.marquee');
  if (box) {
    var first = box.querySelector('.mq');
    var seed = first.innerHTML;                       // the seed never grows
    var build = function () {
      var extra = box.querySelectorAll('.mq');
      for (var i = 1; i < extra.length; i++) extra[i].remove();
      first.innerHTML = seed;
      var guard = 0;
      while (first.scrollWidth < box.clientWidth && guard++ < 40) {
        first.insertAdjacentHTML('beforeend', seed);
      }
      box.appendChild(first.cloneNode(true));         // second copy: the loop needs it
    };
    build();
    var t;
    addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 180); });
  }

  /* ---------- NAV: section-aware aria-current + progress rail + one idle nudge ---------- */
  var links = [].slice.call(document.querySelectorAll('.nav__links a'));
  var rail = document.getElementById('navrail');
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var onScroll = function () {
    if (rail) {
      var h = document.documentElement.scrollHeight - innerHeight;
      rail.style.width = (h > 0 ? Math.min(100, (scrollY / h) * 100) : 0) + '%';
    }
    var here = -1;
    sections.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top <= innerHeight * 0.35) here = i;
    });
    links.forEach(function (a, i) {
      if (i === here) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var tel = document.querySelector('.nav__tel');
  if (tel && !reduce) {
    var nudged = false;
    setTimeout(function () {
      if (!nudged) { tel.classList.add('is-nudge'); nudged = true; }
    }, 8000);
  }

  /* ---------- WORK: slow auto-cycle of the second photo on touch ---------- */
  if (touch && !reduce) {
    var cards = [].slice.call(document.querySelectorAll('.pj__c'));
    var n = 0;
    setInterval(function () {
      cards.forEach(function (c) { c.classList.remove('is-flip'); });
      if (cards.length) cards[n % cards.length].classList.add('is-flip');
      n++;
    }, 2600);
  }

  /* ---------- BEFORE / AFTER: the range IS the control (§9.2b) ---------- */
  var ba = document.getElementById('ba');
  var r = document.getElementById('barange');
  if (ba && r) {
    var set = function () { ba.style.setProperty('--ba', r.value + '%'); };
    r.addEventListener('input', set);
    set();

    var kill = function () { ba.classList.remove('is-hinting'); };
    r.addEventListener('pointerdown', kill);
    r.addEventListener('keydown', kill);

    /* one sway, gated on BOTH plates having decoded */
    var plates = [].slice.call(ba.querySelectorAll('img'));
    Promise.all(plates.map(function (i) {
      return i.decode ? i.decode().catch(function () {}) : Promise.resolve();
    })).then(function () {
      if (reduce) return;
      ba.classList.add('is-hinting');
      ba.addEventListener('animationend', function () {
        ba.classList.remove('is-hinting');
        set();
      }, { once: true });
    });
  }
})();
