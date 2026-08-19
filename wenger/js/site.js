(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ── MARQUEE ──────────────────────────────────────────────────────────────
     The track slides -100% of ONE copy's own width, so one copy must be at
     least as wide as the container or blank paper scrolls past. No fixed copy
     count in HTML can satisfy that, so: clone to fill from one stored seed. */
  var mq = document.getElementById('mq'), bar = mq.parentNode;
  var SEED = ['Elliottsburg', 'Quality. Satisfaction.', 'Perry County', 'Cumberland County',
    'Reliable. Integrity.', 'Dauphin County', 'Franklin County', 'Juniata County',
    'Mifflin County', 'Carpet, hardwood, vinyl and tile'];

  function fillMarquee() {
    Array.prototype.slice.call(bar.querySelectorAll('.mq')).forEach(function (n, i) { if (i) n.remove(); });
    mq.innerHTML = '';
    var one = document.createDocumentFragment();
    SEED.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; one.appendChild(li); });
    mq.appendChild(one);
    var seedW = mq.scrollWidth, need = bar.clientWidth;
    var reps = Math.max(1, Math.ceil(need / Math.max(seedW, 1)));
    var seedHTML = mq.innerHTML;                       // ONE stored seed
    for (var i = 1; i < reps; i++) mq.insertAdjacentHTML('beforeend', seedHTML);
    bar.appendChild(mq.cloneNode(true));               // second copy -> seamless loop
  }
  fillMarquee();
  var t; addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fillMarquee, 180); });

  /* ── NAV: section-aware, progress rail, idle nudge ───────────────────────── */
  var rail = document.getElementById('rail'), nav = document.getElementById('nav');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function onScroll() {
    var h = document.documentElement;
    rail.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100).toFixed(2) + '%';
    var best = -1;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= 120) best = i; });
    links.forEach(function (a, i) {
      if (i === best) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (!reduce) setTimeout(function () {
    nav.classList.add('nudge'); setTimeout(function () { nav.classList.remove('nudge'); }, 1300);
  }, 8000);

  /* ── WORK: slow auto-cycle on touch, and a real destination per card ─────── */
  var touch = matchMedia('(hover:none)').matches;
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  if (touch && !reduce) {
    var n = 0;
    setInterval(function () {
      var two = cards.filter(function (c) { return c.querySelector('.b'); });
      if (!two.length) return;
      two.forEach(function (c) { c.classList.remove('flip'); });
      two[n % two.length].classList.add('flip'); n++;
    }, 3200);
  }

  /* ── WORK ROWS: mouse press-and-drag ─────────────────────────────────────────
     Touch swipe, trackpad and wheel are native to overflow-x. A mouse only gets the
     scrollbar, so drag it here — and swallow the click that ends a drag, or letting
     go over a card opens its lightbox. */
  Array.prototype.slice.call(document.querySelectorAll('.row')).forEach(function (r) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    r.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; x0 = e.clientX; l0 = r.scrollLeft;
    });
    r.addEventListener('pointermove', function (e) {
      if (!down) return;
      var d = e.clientX - x0;
      /* capture only ONCE A DRAG IS REAL. Capturing on pointerdown retargets the
         following click to the row, which swallows every plain click on a card. */
      if (!moved && Math.abs(d) > 4) { moved = true; r.setPointerCapture(e.pointerId); }
      if (moved) r.scrollLeft = l0 - d;
    });
    r.addEventListener('pointerup', function (e) {
      if (!down) return;
      down = false;
      if (moved) { try { r.releasePointerCapture(e.pointerId); } catch (err) { } }
    });
    r.addEventListener('click', function (e) {
      if (moved) { moved = false; e.preventDefault(); e.stopPropagation(); }
    }, true);
  });

  var lb = document.getElementById('lb');
  cards.forEach(function (c) {
    c.addEventListener('click', function (e) {
      e.preventDefault();
      var a = c.querySelector('.a'), b = c.querySelector('.b');
      var title = c.querySelector('.card__t').textContent, meta = c.querySelector('.card__m').textContent;
      lb.innerHTML =
        '<div style="padding:1rem 1rem .4rem;display:flex;justify-content:space-between;gap:1rem;align-items:baseline">' +
        '<strong style="font:800 1.4rem/1.15 sans-serif">' + title + '</strong>' +
        '<button id="lbx" style="min-height:44px;min-width:44px;border:2px solid #1c1a17;background:#f7f4ef;' +
        'font:800 1.2rem/1 sans-serif;cursor:pointer;border-radius:4px" aria-label="Close">&times;</button></div>' +
        '<div style="display:grid;gap:.5rem;grid-template-columns:' + (b ? '1fr 1fr' : '1fr') + ';padding:0 1rem">' +
        '<img src="' + a.src + '" alt="' + a.alt + '" style="width:100%">' +
        (b ? '<img src="' + b.src + '" alt="' + b.alt + '" style="width:100%">' : '') + '</div>' +
        '<p style="padding:.9rem 1rem 1.2rem;color:rgba(28,26,23,.6);font:400 1rem/1.4 sans-serif">' + meta + '</p>';
      lb.showModal();
      lb.querySelector('#lbx').addEventListener('click', function () { lb.close(); });
    });
  });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });

  /* ── FORM ────────────────────────────────────────────────────────────────── */
  document.getElementById('quote').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!this.name.value.trim() || !this.phone.value.trim()) {
      (this.name.value.trim() ? this.phone : this.name).focus(); return;
    }
    document.getElementById('thanks').hidden = false;
  });
})();

/* sticky mobile CTA — same contract as Encore/Hurley */
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
