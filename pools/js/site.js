/* Superior Pools — interactions. Everything here is an enhancement; with JS off
   the page still reads, the form still posts and every card still goes somewhere. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------- marquee
     One stored seed. Copy 1 is grown to fill the container FIRST, then cloned —
     growing it after cloning is what desyncs the loop. */
  var mq = document.querySelector('.marquee');
  if (mq) {
    var seed = Array.prototype.map.call(mq.querySelector('.mq').children,
      function (li) { return li.cloneNode(true); });

    var fill = function () {
      var first = mq.querySelector('.mq');
      Array.prototype.slice.call(mq.querySelectorAll('.mq')).forEach(function (c, i) {
        if (i) c.remove();
      });
      first.innerHTML = '';
      seed.forEach(function (li) { first.appendChild(li.cloneNode(true)); });
      var guard = 0;
      while (first.scrollWidth < mq.clientWidth && guard++ < 40) {
        seed.forEach(function (li) { first.appendChild(li.cloneNode(true)); });
      }
      guard = 0;
      while (mq.scrollWidth < mq.clientWidth * 2 && guard++ < 40) {
        mq.appendChild(first.cloneNode(true));
      }
    };
    fill();
    var t;
    addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fill, 180); });
  }

  /* ---------------------------------------------------------- nav */
  var nav = document.querySelector('.nav');
  var rail = document.getElementById('rail');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));

  if (rail) {
    var paint = function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      rail.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + '%';
    };
    addEventListener('scroll', paint, { passive: true });
    paint();
  }

  if (links.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var a = links.filter(function (l) { return l.hash === '#' + e.target.id; })[0];
        if (!a) return;
        if (e.isIntersecting) { links.forEach(function (l) { l.removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['work', 'types', 'people', 'faq'].forEach(function (id) {
      var el = document.getElementById(id); if (el) io.observe(el);
    });
  }

  if (nav && !reduce) {
    var idle = setTimeout(function () { nav.classList.add('is-nudge'); }, 8000);
    ['scroll', 'pointerdown', 'keydown'].forEach(function (ev) {
      addEventListener(ev, function () { clearTimeout(idle); nav.classList.remove('is-nudge'); },
        { once: true, passive: true });
    });
  }

  /* ---------------------------------------------------------- project lightbox
     3.5a: the card goes to THAT project, larger. With JS off the href is the
     client's own page for the same job, so the promise holds either way. */
  var lb = document.getElementById('lb');
  var CAP = {
    carlisle: ['Carlisle sport pool and pavilion — Cumberland County, 2024. 20′×’40′, ' +
      '6′ uniform depth, vinyl-over tanning ledge and steps, cantilever concrete coping, ' +
      'automatic pool cover, pavilion with a built-in shed and an extended concrete patio.'],
    duncannon: ['Duncannon pool and pavilion — Perry County, 2024. 18′×’36′, 8′ deep, ' +
      '8′ walk-in steps, cantilever concrete coping, stamped and stained patio, pavilion with a ' +
      'built-in shed, boulder retaining wall, fencing and a pool heater.'],
    newville: ['Newville sport pool and pavilion — Cumberland County, 2024. 16′×’32′, ' +
      '6′ uniform depth, 6′ walk-in steps, stamped and stained border accent, custom pavilion, ' +
      'boulder retaining wall, outdoor lighting and boiler heating.']
  };
  if (lb && typeof lb.showModal === 'function') {
    document.addEventListener('click', function (e) {
      var card = e.target.closest ? e.target.closest('.pj') : null;
      if (!card) return;
      e.preventDefault();
      var key = card.getAttribute('data-pj');
      lb.querySelector('.lb__img').src = card.querySelector('.pj__a').src;
      lb.querySelector('.lb__img').alt = card.querySelector('.pj__a').alt;
      lb.querySelector('.lb__img2').src = card.querySelector('.pj__b').src;
      lb.querySelector('.lb__img2').alt = card.querySelector('.pj__b').alt;
      lb.querySelector('.lb__cap').textContent = CAP[key] ? CAP[key][0] : '';
      lb.showModal();
    });
    lb.querySelector('.lb__x').addEventListener('click', function () { lb.close(); });
    lb.querySelector('.lb__more').addEventListener('click', function () { lb.close(); });
  }
})();
