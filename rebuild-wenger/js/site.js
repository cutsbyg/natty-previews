/* Wenger's Flooring — behaviour. No libraries, no external requests. */
(function () {
  'use strict';
  var touch = window.matchMedia('(hover: none)').matches;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. the hero drag-to-compare ---------- */
  var cmp = document.getElementById('cmp');
  var grip = document.getElementById('grip');
  if (cmp && grip) {
    var set = function (pct) {
      pct = Math.max(2, Math.min(98, pct));
      cmp.style.setProperty('--split', pct + '%');
      grip.setAttribute('aria-valuenow', Math.round(pct));
      grip.setAttribute('aria-valuetext', Math.round(pct) + ' percent finished floor');
    };
    var fromEvent = function (e) {
      var r = cmp.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    };
    grip.addEventListener('pointerdown', function (e) {
      grip.setPointerCapture(e.pointerId);
      cmp.classList.remove('nudge');
      e.preventDefault();
    });
    grip.addEventListener('pointermove', function (e) {
      if (grip.hasPointerCapture && grip.hasPointerCapture(e.pointerId)) fromEvent(e);
    });
    cmp.addEventListener('pointerdown', function (e) {
      if (e.target === grip || grip.contains(e.target)) return;
      cmp.classList.remove('nudge');
      fromEvent(e);
    });
    grip.addEventListener('keydown', function (e) {
      var n = parseFloat(grip.getAttribute('aria-valuenow'));
      var step = e.shiftKey ? 10 : 4;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { set(n - step); e.preventDefault(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { set(n + step); e.preventDefault(); }
      else if (e.key === 'Home') { set(2); e.preventDefault(); }
      else if (e.key === 'End') { set(98); e.preventDefault(); }
    });
    /* one nudge, first view only, never under reduced motion, never a sweep */
    if (!still) {
      var seen = false;
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting && !seen) { seen = true; cmp.classList.add('nudge'); }
        });
      }, { threshold: 0.5 });
      io.observe(cmp);
    }
  }

  /* ---------- 2. the marquee: clone one stored seed until the track fills ---------- */
  var mq = document.getElementById('mq');
  if (mq) {
    var seed = mq.cloneNode(true);          /* stored once; copy 1 is never grown */
    var band = mq.parentNode;
    var fill = function () {
      mq.innerHTML = '';
      var one = seed.cloneNode(true);
      while (one.firstChild) mq.appendChild(one.firstChild);
      var guard = 0;
      /* one copy must be at least as wide as the container, or blank paper scrolls past */
      while (mq.scrollWidth < band.clientWidth && guard++ < 40) {
        var more = seed.cloneNode(true);
        while (more.firstChild) mq.appendChild(more.firstChild);
      }
      var oneCopy = mq.scrollWidth;
      /* then a second copy so translateX(-100%) of one copy's own width loops seamlessly */
      var dup = mq.cloneNode(true);
      while (dup.firstChild) mq.appendChild(dup.firstChild);
      mq.dataset.oneCopy = oneCopy;
    };
    fill();
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t); t = setTimeout(fill, 180);
    });
  }

  /* ---------- 3. nav: section-aware, progress rail, one idle nudge ---------- */
  var rail = document.getElementById('rail');
  var nav = document.getElementById('nav');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var onScroll = function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (rail) rail.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    var cur = -1;
    secs.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top <= 120) cur = i;
    });
    links.forEach(function (a, i) {
      if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (!still && nav) {
    var idle = setTimeout(function () { nav.classList.add('nudge'); }, 8000);
    window.addEventListener('scroll', function () { clearTimeout(idle); nav.classList.remove('nudge'); }, { once: true });
  }

  /* ---------- 4. work tiles: slow auto-cycle on touch (hover/focus is CSS) ---------- */
  if (touch && !still) {
    var phs = document.querySelectorAll('.tile__ph');
    var vis = [];
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var i = vis.indexOf(en.target);
        if (en.isIntersecting && i < 0) vis.push(en.target);
        if (!en.isIntersecting && i >= 0) { vis.splice(i, 1); en.target.classList.remove('flip'); }
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(phs, function (p) { if (p.querySelector('.tile__b')) io2.observe(p); });
    setInterval(function () {
      vis.forEach(function (p) { p.classList.toggle('flip'); });
    }, 3200);
  }

  /* ---------- 5. project lightbox — the card lands on that project ---------- */
  var lb = document.getElementById('lb'), lbBody = document.getElementById('lbBody'), lbX = document.getElementById('lbX');
  if (lb && lb.showModal) {
    document.querySelectorAll('.tile').forEach(function (tile) {
      tile.addEventListener('click', function (e) {
        e.preventDefault();
        var imgs = tile.querySelectorAll('.tile__ph img');
        var html = '<h4>' + tile.querySelector('.tile__t').textContent + '</h4>' +
                   '<p>' + tile.querySelector('.tile__m').textContent + '</p><div class="lbg">';
        Array.prototype.forEach.call(imgs, function (im) {
          html += '<img src="' + im.getAttribute('src') + '" alt="' + im.getAttribute('alt').replace(/"/g, '&quot;') + '">';
        });
        lbBody.innerHTML = html + '</div>';
        lb.showModal();
      });
    });
    lbX.addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }

  /* ---------- 6. the form. JS only enhances; the POST is the mechanism ---------- */
  var form = document.getElementById('submit'), ok = document.getElementById('formOk');
  if (form) {
    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) { form.reportValidity(); e.preventDefault(); return; }
      if (!window.fetch) return;                       /* let the real POST happen */
      e.preventDefault();
      fetch(form.action, { method: 'POST', body: new FormData(form) })
        .then(function (r) { if (!r.ok) throw 0; form.reset(); ok.classList.add('on'); })
        .catch(function () { form.submit(); });   /* fail VISIBLY, never a false thank-you */
    });
  }
})();
