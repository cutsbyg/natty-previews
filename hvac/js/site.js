/* Fitzpatrick — behaviour. Everything here enhances; nothing here is the mechanism. */
(function () {
  'use strict';

  /* ── MARQUEE: clone from ONE stored seed until a single copy fills the container ──
     The track slides translateX(-100%) of one copy's own width, so
     one copy's width must be >= the container width, and the track >= 2x. */
  var mq = document.getElementById('mqSeed');
  var bar = mq && mq.parentElement;
  if (mq && bar) {
    var seed = mq.cloneNode(true);           // the seed never grows
    seed.removeAttribute('id');

    function fill() {
      // reset to one pristine copy
      bar.querySelectorAll('.mq').forEach(function (n, i) { if (i) n.remove(); });
      var first = bar.querySelector('.mq');
      first.replaceWith(seed.cloneNode(true));
      first = bar.querySelector('.mq');
      first.id = 'mqSeed';
      mq = first;

      // grow copy 1 by appending seed items until it alone covers the container
      var guard = 0;
      while (mq.scrollWidth < bar.clientWidth && guard++ < 40) {
        seed.childNodes.forEach(function (n) {
          if (n.nodeType === 1) mq.appendChild(n.cloneNode(true));
        });
      }
      // then a second copy so the loop is seamless (dot carries across the seam)
      var two = mq.cloneNode(true);
      two.removeAttribute('id');
      two.setAttribute('aria-hidden', 'true');
      bar.appendChild(two);
    }

    fill();
    var t;
    addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fill, 180); });
  }

  /* ── NAV: section-aware aria-current, 2px progress rail, one idle nudge at 8s ── */
  var links = [].slice.call(document.querySelectorAll('.nav__links a'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var rail = document.getElementById('railFill');

  function onScroll() {
    var y = scrollY + innerHeight * 0.32, cur = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    links.forEach(function (a, i) {
      if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    if (rail) {
      var max = document.documentElement.scrollHeight - innerHeight;
      rail.style.width = (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + '%';
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var nudged = false;
  setTimeout(function () {
    if (nudged || scrollY > 40) return;
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    var cue = document.querySelector('.cue');
    if (!cue) return;
    cue.animate(
      [{ transform: 'translate(-50%,0)' }, { transform: 'translate(-50%,14px)' }, { transform: 'translate(-50%,0)' }],
      { duration: 900, iterations: 2, easing: 'cubic-bezier(.4,0,.2,1)' }
    );
    nudged = true;
  }, 8000);
  addEventListener('scroll', function () { nudged = true; }, { once: true, passive: true });

  /* ── FORM: validate before the real post. novalidate is on, so run the check. ── */
  var form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var old = form.querySelector('.f-err');
      if (old) old.remove();
      if (form.checkValidity()) return;          // real POST proceeds
      e.preventDefault();
      var bad = form.querySelector(':invalid');
      var p = document.createElement('p');
      p.className = 'f-err';
      p.textContent = 'We need your name and a phone number to call you back.';
      form.insertBefore(p, form.lastElementChild);
      if (bad) bad.focus();
    });
  }

  /* ── LIGHTBOX: Esc closes, focus returns ── */
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && /^#p\d+$/.test(location.hash)) location.hash = '#work';
  });
})();
