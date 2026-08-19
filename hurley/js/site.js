/* Hurley Electric — no dependencies, no third-party anything. */
(function () {
  'use strict';

  /* ---- MARQUEE: author one seed, clone to fill (§2.a) ---------------- */
  var mq = document.getElementById('mq');
  if (mq) {
    var SEED = [
      'Quality electrical', 'Solutions', 'Mechanicsburg', 'Harrisburg', 'Carlisle',
      'Hershey', 'Cumberland County', 'Dauphin County', 'Perry County', 'York County',
      'Adams County', 'Lancaster County', 'Lebanon County', 'Open 24 hours',
      'PA licence 031867'
    ];
    var seedHTML = SEED.map(function (t) { return '<li>' + t + '</li>'; }).join('');
    var fill = function () {
      var box = mq.parentNode.clientWidth;
      mq.innerHTML = seedHTML;                       // one copy, always from the seed
      var one = mq.scrollWidth || 1;
      var k = Math.max(1, Math.ceil(box / one));     // a GROUP wide enough to fill the bar
      var group = '';
      for (var i = 0; i < k; i++) group += seedHTML;
      mq.innerHTML = group + group;                  // two groups; the track slides -50%
    };
    fill();
    var t;
    addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fill, 180); });
  }

  /* ---- REVEAL once, never on scroll-back ---------------------------- */
  var rv = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) {
    for (var i = 0; i < rv.length; i++) rv[i].classList.add('on');
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    for (var j = 0; j < rv.length; j++) io.observe(rv[j]);
  }

  /* ---- NAV: progress rail, section awareness, one idle nudge -------- */
  var nav = document.querySelector('.nav');
  var links = [].slice.call(document.querySelectorAll('.nav__links a'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  var onScroll = function () {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    nav.style.setProperty('--prog', (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%');
    var here = -1;
    for (var k = 0; k < secs.length; k++) {
      if (secs[k] && secs[k].getBoundingClientRect().top <= 120) here = k;
    }
    links.forEach(function (a, n) {
      if (n === here) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  setTimeout(function () {
    if (scrollY < 40) {
      nav.classList.add('idle');
      setTimeout(function () { nav.classList.remove('idle'); }, 2000);
    }
  }, 8000);

  /* ---- FORM: validate before it goes (§0y) -------------------------- */
  var form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
      }
    });
  }
})();

/* sticky mobile CTA — same contract as Encore (appear past hero, hide at form + while
   typing; typing resets when the form scrolls off because touch scroll never blurs) */
(function () {
  var bar = document.getElementById('stick');
  if (!bar || !('IntersectionObserver' in window)) return;
  var hero = document.querySelector('.hero'),
      form = document.getElementById('submit');
  if (!hero || !form) return;
  bar.hidden = false;
  var pastHero = false, atForm = false, typing = false;
  function apply() { bar.classList.toggle('on', pastHero && !atForm && !typing); }
  new IntersectionObserver(function (es) { pastHero = !es[0].isIntersecting; apply(); },
    {threshold: 0}).observe(hero);
  new IntersectionObserver(function (es) {
    atForm = es[0].isIntersecting;
    if (!atForm) typing = false;
    apply();
  }, {threshold: 0.25}).observe(form);
  form.addEventListener('focusin',  function () { typing = true;  apply(); });
  form.addEventListener('focusout', function () { typing = false; apply(); });
})();
