/* §3.5 engagement floor. Everything here is decoration over a page that already renders
   without it (§1b fail-visible) — no state that the CSS depends on. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // scroll progress rail
  var bar = document.querySelector('.prog__b');
  if (bar) {
    var tick = function () {
      var h = document.documentElement;
      var p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      bar.style.width = (p * 100).toFixed(2) + '%';
    };
    addEventListener('scroll', tick, { passive: true });
    addEventListener('resize', tick);
    tick();
  }

  // §2.a MARQUEE — clone to fill. The animation slides each copy by translateX(-100%), i.e.
  // 100% of ONE COPY's width, so on any viewport wider than one copy the band runs out of
  // items and scrolls a blank stretch with no ◆ separators in it. Two authored copies cannot
  // fix that: the condition is (one copy >= container), which depends on the client's town
  // list and the visitor's screen. So: grow copy 1 until it covers the frame, then clone it
  // until the track is at least twice the container. Every copy stays identical, or the
  // -100% loop distance stops matching the copy it belongs to.
  var marquees = [].slice.call(document.querySelectorAll('.marquee'));
  function fillMarquees() {
    marquees.forEach(function (m) {
      var first = m.querySelector('.mq');
      if (!first) return;
      if (!first.dataset.seed) first.dataset.seed = first.innerHTML;
      first.innerHTML = first.dataset.seed;                       // reset before re-fitting
      [].slice.call(m.querySelectorAll('.mq')).forEach(function (c, i) { if (i) c.remove(); });
      var guard = 0;
      // the duplicated items are decoration; the aria-label on .marquee already names the towns
      while (first.scrollWidth < m.clientWidth && guard++ < 12) {
        var t = document.createElement('template');
        t.innerHTML = first.dataset.seed;
        [].slice.call(t.content.querySelectorAll('li')).forEach(function (li) {
          li.setAttribute('aria-hidden', 'true');
        });
        first.appendChild(t.content);
      }
      guard = 0;
      // TWO copies minimum, always — not just "track >= 2x container". A single copy that is
      // already wider than the frame still runs out: translateX(-100%) walks it entirely off
      // the left, and there is nothing behind it. On a 375px phone one copy is 1942px, which
      // clears 2x the container on its own and would otherwise skip the clone.
      while ((m.querySelectorAll('.mq').length < 2 || m.scrollWidth < m.clientWidth * 2)
             && guard++ < 12) {
        var c = first.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        c.removeAttribute('data-seed');
        m.appendChild(c);
      }
    });
  }
  if (marquees.length) {
    fillMarquees();
    // a laptop docked to a wide monitor crosses the threshold live
    var mqW = innerWidth, mqT;
    addEventListener('resize', function () {
      if (innerWidth === mqW) return;
      mqW = innerWidth;
      clearTimeout(mqT); mqT = setTimeout(fillMarquees, 200);
    });
  }

  // section-aware nav
  var links = [].slice.call(document.querySelectorAll('.nav-link'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var i = targets.indexOf(e.target);
        if (i < 0) return;
        if (e.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute('aria-current'); });
          links[i].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (t) { if (t) io.observe(t); });
  }

  // §3.5 cursor proximity, ±8px, on the two large photographs. Never on the hero panel:
  // that rect is a measured value (§1a step 7) and a transform would move it.
  var prox = [].slice.call(document.querySelectorAll('[data-prox]'));
  if (prox.length && !reduce && matchMedia('(hover: hover)').matches) {
    addEventListener('pointermove', function (e) {
      prox.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        var d = Math.hypot(dx, dy), reach = Math.max(r.width, r.height);
        if (d > reach) { el.style.transform = ''; return; }
        var k = (1 - d / reach) * 8;
        el.style.transform = 'translate(' + (dx / d * k).toFixed(1) + 'px,' +
                                            (dy / d * k).toFixed(1) + 'px)';
      });
    }, { passive: true });
  }

  // touch fork for the project photo swap (§2.3) — hover has no touch equivalent, so the
  // payload arrives on a slow cycle instead. Guarded on decode so a card never flips to an
  // image that has not painted.
  if (matchMedia('(hover: none)').matches && !reduce) {
    var cards = [].slice.call(document.querySelectorAll('[data-cycle]'));
    var n = 0;
    setInterval(function () {
      cards.forEach(function (c) { c.classList.remove('flip'); });
      if (!cards.length) return;
      var c = cards[n % cards.length];
      var b = c.querySelector('.b');
      if (b && b.complete && b.naturalWidth) c.classList.add('flip');
      n++;
    }, 4200);
  }

  // count-up once, on quantities only (§3.5). The final value is already in the HTML, so
  // JS-off is correct — and data-suffix restores the "+" the old version ate.
  var nums = [].slice.call(document.querySelectorAll('[data-count]'));
  if (!reduce && 'IntersectionObserver' in window && nums.length) {
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io2.unobserve(e.target);
        var el = e.target, end = parseInt(el.dataset.count, 10);
        var sfx = el.dataset.suffix || '', t0 = null;
        var step = function (t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / 900);
          el.textContent = Math.round(end * (0.15 + 0.85 * k * (2 - k))) + sfx;
          if (k < 1) requestAnimationFrame(step); else el.textContent = end + sfx;
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io2.observe(el); });
  }


  // §3.5a — a project card opens THAT project. These pages are one page, so a project has no URL
  // of its own; the lightbox is the destination rather than a borrowed one. Native <dialog> is
  // doing the work here: focus trap, Esc to close and inertness behind it are all free.
  var lb = document.querySelector('.lb');
  if (lb) {
    var ph = lb.querySelector('.lb__ph'), cap = lb.querySelector('.lb__cap');
    var shot = function (src, alt) {
      var i = document.createElement('img'); i.src = src; i.alt = alt || ''; return i;
    };
    document.addEventListener('click', function (e) {
      var card = e.target.closest && e.target.closest('[data-lb]');
      if (card) {
        var a = card.querySelector('img.a'), b = card.querySelector('img.b'),
            bar = card.querySelector('.pj__bar b, .card__t'),
            sub = card.querySelector('.pj__bar i, .card__m');
        ph.textContent = '';
        if (a) ph.appendChild(shot(a.currentSrc || a.src, a.alt));
        if (b) ph.appendChild(shot(b.currentSrc || b.src, b.alt));
        ph.style.gridTemplateColumns = b ? '1fr 1fr' : '1fr';
        cap.querySelector('b').textContent = bar ? bar.textContent : '';
        cap.querySelector('i').textContent = sub ? sub.textContent : '';
        if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
        return;
      }
      // Click anywhere outside the content closes it. <dialog> puts the backdrop on the element
      // itself, so a click that lands ON .lb rather than a child is a backdrop click.
      if (e.target === lb || (e.target.closest && e.target.closest('.lb__x'))) lb.close();
    });
  }


  // §1a.16 the fly-through. data-fly on the hotspot names the film; frame 1 of that film is the
  // hero photograph itself, so the reveal is invisible — the page just starts moving. Chained
  // segments (data-fly-then) play back-to-back: segment A's last frame is segment B's first.
  // Phone gets it too (2026-08-16). It used to be gated to (min-width:861px) — the reasoning
  // was that the pop is a hover effect and a phone has no hover. But the fly-through is the
  // single most expensive-feeling thing on the page and phones are most of the traffic. On
  // touch it becomes two taps instead of hover-then-click: tap the house to ARM it (the photo
  // lifts, the tag becomes a real button), tap again to play.
  var fly = document.querySelector('.hero__fly');
  if (fly) {
    var hero = document.querySelector('.hero');
    var film = document.createElement('video');
    film.className = 'hero__film'; film.muted = true; film.playsInline = true; film.preload = 'auto';
    film.setAttribute('aria-label', 'Fly-through of the house');
    var media = document.querySelector('.hero__media');
    media.appendChild(film);
    var x = document.createElement('button');
    x.type = 'button'; x.className = 'hero__film-x'; x.textContent = '×';
    x.setAttribute('aria-label', 'Close the fly-through');
    media.appendChild(x);
    var srcs = [fly.dataset.fly].concat(fly.dataset.flyThen ? [fly.dataset.flyThen] : []);
    var at = 0, playing = false;
    function stop () {
      playing = false; hero.classList.remove('flying'); hero.classList.remove('armed');
      film.classList.remove('on');
      setTimeout(function () { film.pause(); at = 0; }, 400);   // fade first, then stop
    }
    function playSeg (i) {
      at = i; film.src = srcs[i]; film.currentTime = 0;
      film.play().catch(stop);
    }
    film.addEventListener('ended', function () {
      if (at + 1 < srcs.length) { playSeg(at + 1); return; }
      setTimeout(stop, 1400);                                   // hold the payoff, then return
    });
    // On a mouse the pop is hover and the click plays. On touch there is no hover, so the
    // first tap stands in for it: arm, and only the second tap plays. Without this the film
    // starts on an accidental tap of the photograph, which is the whole top of the screen.
    var touch = matchMedia('(hover: none)').matches;
    fly.addEventListener('click', function () {
      if (playing) return;
      if (touch && !hero.classList.contains('armed')) { hero.classList.add('armed'); return; }
      hero.classList.remove('armed');
      playing = true; hero.classList.add('flying'); film.classList.add('on');
      playSeg(0);
    });
    // tapping anywhere else disarms, so the lift is not left stuck on
    document.addEventListener('click', function (e) {
      if (!playing && hero.classList.contains('armed') &&
          !(e.target.closest && e.target.closest('.hero__fly'))) hero.classList.remove('armed');
    });
    x.addEventListener('click', stop);
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && playing) stop(); });
  }

})();

/* sticky mobile CTA — same contract as the other builds */
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
