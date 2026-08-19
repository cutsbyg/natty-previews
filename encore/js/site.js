/* Encore Roofing — site-v2. Everything here is an enhancement; the page works without it. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---- §2.a MARQUEE ----------------------------------------------------
     The track slides translateX(-100%) of ONE COPY'S OWN WIDTH, so
     "one copy >= container" must hold or blank paper scrolls past. Clone from a
     stored SEED, never from copy 1 — growing copy 1 desyncs the loop. */
  (function () {
    var box = document.querySelector('.marquee');
    var one = box && box.querySelector('.mq');
    if (!one) return;
    var seed = one.cloneNode(true);            // the seed, captured before any cloning
    function fill() {
      while (box.children.length > 1) box.removeChild(box.lastChild);
      one.innerHTML = seed.innerHTML;
      // grow ONE copy until it is at least as wide as the container
      while (one.scrollWidth < box.clientWidth) {
        var kids = seed.cloneNode(true).children;
        while (kids.length) one.appendChild(kids[0]);
      }
      // then a second copy so the tail of the loop is never empty
      box.appendChild(one.cloneNode(true));
    }
    fill();
    var t;
    addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fill, 180); });
  })();

  /* ---- §10 NAV: progress rail, section-aware aria-current, idle nudge ---- */
  (function () {
    var rail = document.getElementById('rail');
    var links = [].slice.call(document.querySelectorAll('.nav__links a'));
    var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    function onScroll() {
      var h = document.documentElement.scrollHeight - innerHeight;
      if (rail) rail.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
      var best = -1;
      secs.forEach(function (s, i) {
        if (s && s.getBoundingClientRect().top <= innerHeight * 0.4) best = i;
      });
      links.forEach(function (a, i) {
        if (i === best) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!reduce) {
      var tel = document.querySelector('.nav__tel');
      var idle = setTimeout(function () {
        if (tel && scrollY < 40) { tel.classList.add('nudge'); setTimeout(function () { tel.classList.remove('nudge'); }, 1400); }
      }, 8000);
      addEventListener('scroll', function () { clearTimeout(idle); }, { once: true, passive: true });
    }
  })();

  /* ---- §9.2b BEFORE/AFTER: a real <input type=range> IS the control ------ */
  (function () {
    var ba = document.querySelector('.ba');
    var r = ba && ba.querySelector('.ba__range');
    if (!r) return;
    var hinted = false;
    function set() {
      ba.style.setProperty('--ba', r.value + '%');
      r.setAttribute('aria-valuenow', r.value);
    }
    r.addEventListener('input', function () {
      if (!hinted) { hinted = true; ba.classList.remove('is-hinting'); }
      set();
    });
    set();
    // Gate the sway on BOTH plates decoding, or it plays against a blank frame.
    if (reduce) return;
    var imgs = [].slice.call(ba.querySelectorAll('img'));
    Promise.all(imgs.map(function (i) { return i.decode ? i.decode().catch(function () {}) : Promise.resolve(); }))
      .then(function () { if (!hinted) ba.classList.add('is-hinting'); });
  })();

  /* ---- §1.0d the form: validation runs, and it says what happened ------- */
  (function () {
    var f = document.getElementById('quote'), msg = document.getElementById('q-msg');
    if (!f) return;
    f.addEventListener('submit', function () {
      if (msg) msg.textContent = 'Sending it to Scott…';
    });
  })();
})();
