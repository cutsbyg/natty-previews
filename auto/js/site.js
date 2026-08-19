/* Cain and Sons' — behaviour. No third-party anything. */
(function () {
  'use strict';

  /* ---- marquee: clone one stored seed until the track fills (§2.a) ---- */
  var mq = document.getElementById('mq');
  if (mq) {
    var seed = mq.innerHTML;               // ONE stored seed — never re-read the grown copy
    var box = mq.parentElement;
    var fill = function () {
      mq.innerHTML = seed + seed;          // author two
      var one = mq.scrollWidth / 2;
      var need = box.clientWidth;
      var copies = 2;
      while (one * copies < need * 2 && copies < 24) { mq.innerHTML += seed; copies++; }
      // one copy's own width must be >= the container, or blank paper scrolls past
      while (mq.scrollWidth / copies < need && copies < 24) { mq.innerHTML += seed; copies++; }
    };
    fill();
    var t;
    addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fill, 180); });
  }

  /* ---- nav: progress rail + section-aware aria-current ---- */
  var rail = document.getElementById('navrail');
  var links = [].slice.call(document.querySelectorAll('.nav__links a'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  function onScroll() {
    if (rail) {
      var h = document.documentElement.scrollHeight - innerHeight;
      rail.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    }
    var best = -1;
    for (var i = 0; i < secs.length; i++) {
      if (secs[i] && secs[i].getBoundingClientRect().top <= 140) best = i;
    }
    links.forEach(function (a, i) {
      if (i === best) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- idle nudge at 8s, once ---- */
  var nudged = false;
  setTimeout(function () {
    if (nudged || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    nudged = true;
    var b = document.querySelector('.glass__act .btn');
    if (!b) return;
    b.animate(
      [{ transform: 'translate(0,0)' }, { transform: 'translate(3px,3px)' }, { transform: 'translate(0,0)' }],
      { duration: 620, easing: 'cubic-bezier(.4,0,.2,1)' }
    );
  }, 8000);

  /* ---- the form must actually validate before it posts (§0y) ---- */
  var form = document.getElementById('lead');
  if (form) {
    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
      }
    });
  }
})();
