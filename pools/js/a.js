/* The owner's door. First-party, relative, no cookies, no IP, no tag manager.
   Five fixed events, all instrumented by DELEGATION — a hand-added attribute dies
   at the next rebuild and the dashboard then reports zero calls forever. */
(function () {
  'use strict';
  if (/bot|crawl|spider|headless|lighthouse|preview/i.test(navigator.userAgent)) return;

  var seen = {};
  function send(name) {
    if (seen[name]) return;
    seen[name] = 1;
    try {
      navigator.sendBeacon('a', new Blob(
        [JSON.stringify({ e: name, p: location.pathname, t: Date.now() })],
        { type: 'application/json' }));
    } catch (err) { /* the page never depends on this */ }
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    if (t.closest('a[href^="tel:"]')) send('Call');                 // the money event
    else if (t.closest('a[href*="google.com/maps"]')) send('Directions');
  }, true);

  var form = document.querySelector('form[action="/api/lead"]');
  if (form) form.addEventListener('submit', function () { send('Quote request'); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (!x.isIntersecting) return;
        if (x.target.id === 'work') send('Work viewed');
        if (x.target.id === 'cta') send('Reached CTA');
      });
    }, { threshold: 0.25 });
    ['work', 'cta'].forEach(function (id) {
      var el = document.getElementById(id); if (el) io.observe(el);
    });
  }
})();
