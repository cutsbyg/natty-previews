/* First-party beacon. No cookies, no IP stored, no tag manager.
   Five fixed events, instrumented by DELEGATION so a rebuild cannot
   strip hand-added attributes and leave the dashboard reporting zero. */
(function () {
  'use strict';
  if (navigator.webdriver) return;                     /* bot filter */
  var sent = {};
  function send(name) {
    if (sent[name] && name !== 'Work viewed') return;
    sent[name] = 1;
    var body = JSON.stringify({ e: name, p: location.pathname, t: Date.now() });
    if (navigator.sendBeacon) navigator.sendBeacon('a', body);
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a,button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) return send('Call');
    if (a.closest('.tile')) return send('Work viewed');
    if (href.indexOf('maps.google') > -1) return send('Directions');
    if (href === '#submit' || href === '#quote') return send('Reached CTA');
  }, true);
  var f = document.getElementById('submit');
  if (f) f.addEventListener('submit', function () { send('Quote request'); });
  var q = document.getElementById('quote');
  if (q && window.IntersectionObserver) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) send('Reached CTA'); });
    }, { threshold: 0.25 }).observe(q);
  }
})();
