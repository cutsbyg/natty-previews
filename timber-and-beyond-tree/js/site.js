/* Natty template JS — shared verbatim by every client (owner name comes from <body data-owner>). Everything here is an enhancement; the page works without it. */
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

  /* ---- §9.3 the hero film: NUDGE IT, THEN GIVE UP QUIETLY ---------------
     The attributes alone are not enough on a phone. iOS refuses autoplay in Low Power Mode,
     and some Android data-saver modes refuse it too. play() returns a promise that REJECTS in
     those cases — unhandled, that is a console error on every affected visit and nothing else.
     So: ask once, and if the answer is no, remove the film and let the poster stand. That is
     condition 6 doing its job, not a failure. Never show the visitor a paused black box. */
  (function () {
    var v = document.querySelector('.hero__film');
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { v.remove(); return; }
    var p = v.play();
    if (p && p.catch) p.catch(function () { v.remove(); });
  })();

  /* ---- STICKY MOBILE CTA -------------------------------------------------
     Two observers, because the bar has two jobs and they are not the same job:
       1. APPEAR once the hero is gone. Not a scroll-px threshold — a pixel count is
          wrong on every viewport it was not measured on, and the hero's height differs
          by tier here (1.5 phone plate vs 2.6 wide).
       2. HIDE once the real form is on screen. This is the one that matters. The best
          documented test of this pattern found a sticky button that merely SCROLLED TO
          the form produced no significant lift — so a bar still shouting "free estimate"
          while the estimate form is right there is pure competition with itself.
     Plus a keyboard guard: iOS `position:fixed` does NOT respect the on-screen keyboard,
     so the bar floats over the very inputs it sent them to. It is hidden while any field
     in the form has focus — where it is useless anyway. -------------------------------- */
  (function () {
    var bar = document.getElementById('stick');
    if (!bar || !('IntersectionObserver' in window)) return;
    var hero = document.querySelector('.hero'),
        form = document.getElementById('submit');
    if (!hero || !form) return;

    bar.hidden = false;               // it exists in the HTML; reveal it to layout only now
    var pastHero = false, atForm = false, typing = false;
    function apply() { bar.classList.toggle('on', pastHero && !atForm && !typing); }

    new IntersectionObserver(function (es) {
      pastHero = !es[0].isIntersecting; apply();
    }, {threshold: 0}).observe(hero);

    // 25%: enough of the form on screen that it owns the moment
    new IntersectionObserver(function (es) {
      atForm = es[0].isIntersecting;
      // scrolling does not blur a focused input on touch, so a visitor who tapped a
      // field and then scrolled back up would lose the bar forever. Off-screen form
      // means the keyboard moment is over regardless of where focus is.
      if (!atForm) typing = false;
      apply();
    }, {threshold: 0.25}).observe(form);

    form.addEventListener('focusin',  function () { typing = true;  apply(); });
    form.addEventListener('focusout', function () { typing = false; apply(); });
  })();

  /* ---- §1.0d the form: validation runs, and it says what happened ------- */
  (function () {
    var f = document.getElementById('quote'), msg = document.getElementById('q-msg');
    if (!f) return;
    f.addEventListener('submit', function () {
      if (msg) msg.textContent = 'Sending it to ' + (document.body.dataset.owner || 'the owner') + '…';
    });
  })();
})();
