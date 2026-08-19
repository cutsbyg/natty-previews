/* First-party. Five fixed events, instrumented by delegation only.
   No cookies, no IP stored, no third party. The server decides who may read them. */
(function () {
  'use strict';
  if (navigator.webdriver) return;                       // bot filter
  var seen = {};
  function send(name) {
    if (seen[name] === 1 && name !== 'Call') return;
    seen[name] = 1;
    try {
      navigator.sendBeacon('e', new Blob(
        [JSON.stringify({ e: name, p: location.pathname, t: Date.now() })],
        { type: 'application/json' }
      ));
    } catch (err) { /* never break the page for a metric */ }
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    if (t.closest('a[href^="tel:"]')) send('Call');                 // the money event
    if (t.closest('a[href*="maps"], a[href*="Directions"]')) send('Directions');
    if (t.closest('#work a')) send('Work viewed');
  }, true);

  document.addEventListener('submit', function () { send('Quote request'); }, true);

  var cta = document.getElementById('submit');
  if (cta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (rows, io) {
      rows.forEach(function (r) { if (r.isIntersecting) { send('Reached CTA'); io.disconnect(); } });
    }, { threshold: 0.25 }).observe(cta);
  }
})();
