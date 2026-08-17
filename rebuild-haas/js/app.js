/* Haas Creative Carpentry — enhancement only. Nothing here is a mechanism. */
(function () {
  'use strict';

  /* ---------- MARQUEE: clone to fill from ONE stored seed ---------- */
  var mq = document.querySelector('.marquee');
  if (mq) {
    var track = mq.querySelector('.mq-track');
    var seed = track.querySelector('.mq').innerHTML;   // stored once, never re-read
    var seedW = track.querySelector('.mq').scrollWidth;

    var fill = function () {
      var need = mq.clientWidth;
      var k = Math.max(1, Math.ceil(need / Math.max(1, seedW)));
      var html = new Array(k + 1).join(seed);
      track.innerHTML = '<ul class="mq">' + html + '</ul><ul class="mq">' + html + '</ul>';
      var one = track.querySelector('.mq').scrollWidth;
      track.style.setProperty('--one', one + 'px');
      // constant speed, floor of 46s so the cycle is never under 30s
      track.style.animationDuration = Math.max(46, one / 34) + 's';
    };
    fill();

    var t;
    addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () { seedW = seedW; fill(); }, 180);
    });
  }

  /* ---------- NAV: progress rail, section awareness, idle nudge ---------- */
  var rail = document.getElementById('rail');
  var nav = document.getElementById('nav');
  var links = [].slice.call(document.querySelectorAll('.nav__links a'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  var onScroll = function () {
    if (rail) {
      var max = document.documentElement.scrollHeight - innerHeight;
      rail.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    }
    var cur = -1;
    for (var i = 0; i < secs.length; i++) {
      if (secs[i] && secs[i].getBoundingClientRect().top <= innerHeight * 0.4) cur = i;
    }
    links.forEach(function (a, i) {
      if (i === cur) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (nav && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var idle = setTimeout(function () {
      if (scrollY < 40) {
        nav.classList.add('nudge');
        setTimeout(function () { nav.classList.remove('nudge'); }, 2000);
      }
    }, 8000);
    addEventListener('scroll', function () { clearTimeout(idle); }, { once: true, passive: true });
  }

  /* ---------- WORK tiles on touch: first tap flips, second tap opens ---------- */
  if (matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.tile').forEach(function (tile) {
      tile.addEventListener('click', function (e) {
        if (!tile.classList.contains('flip')) {
          e.preventDefault();
          document.querySelectorAll('.tile.flip').forEach(function (o) { o.classList.remove('flip'); });
          tile.classList.add('flip');
        }
      });
    });
  }

  /* ---------- the project overlay closes on Esc ---------- */
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && /^#p-/.test(location.hash)) location.hash = '#work';
  });

  /* ---------- the form validates before it is allowed to leave ---------- */
  var form = document.getElementById('submit');
  if (form) {
    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) { e.preventDefault(); form.reportValidity(); }
    });
  }
})();
