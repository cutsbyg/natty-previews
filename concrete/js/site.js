/* Gingrich Concrete — nav state, marquee fill, project lightbox. No dependencies. */
(function () {
  'use strict';

  /* ---- nav: section-aware aria-current, progress rail, one idle nudge ---- */
  var nav = document.getElementById('nav');
  var rail = nav.querySelector('.nav__rail');
  var links = [].slice.call(nav.querySelectorAll('.nav__links a'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    rail.style.setProperty('--prog', (h > 0 ? (scrollY / h) * 100 : 0) + '%');
    var best = -1;
    targets.forEach(function (el, i) {
      if (el && el.getBoundingClientRect().top <= innerHeight * 0.35) best = i;
    });
    links.forEach(function (a, i) {
      if (i === best) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  setTimeout(function () {
    if (scrollY < 40) {
      nav.classList.add('is-nudge');
      setTimeout(function () { nav.classList.remove('is-nudge'); }, 2200);
    }
  }, 8000);

  /* ---- marquee: clone from ONE stored seed until the track fills twice over ---- */
  var mq = document.querySelector('.mq');
  var bar = document.querySelector('.marquee');
  var seed = mq ? mq.innerHTML : '';
  function fill() {
    if (!mq) return;
    mq.innerHTML = seed;
    var one = mq.scrollWidth;
    if (!one) return;
    var copies = Math.max(2, Math.ceil(bar.clientWidth / one) + 1);
    var html = '';
    for (var i = 0; i < copies; i++) html += seed;
    mq.innerHTML = html;
  }
  fill();
  var t;
  addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fill, 160); });

  /* ---- projects: every card opens that project, larger, with its caption ---- */
  var lb = document.getElementById('lb');
  var lbimg = document.getElementById('lbimg');
  var lbcap = document.getElementById('lbcap');
  var cards = [].slice.call(document.querySelectorAll('.pj a[data-lb]'));
  cards.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var img = a.querySelector('img');
      lbimg.src = img.getAttribute('src');
      lbimg.alt = img.alt;
      lbcap.textContent = a.querySelector('.pj__t').textContent + ' — ' +
                          a.querySelector('.pj__k').textContent;
      if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
      lb.dataset.from = cards.indexOf(a);
    });
  });
  lb.querySelector('.lb__x').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', function () {
    var a = cards[lb.dataset.from | 0];
    if (a) a.focus();
  });

  /* ---- the form must actually submit; validate before any enhancement ---- */
  var form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) { e.preventDefault(); form.reportValidity(); }
    });
  }
})();
