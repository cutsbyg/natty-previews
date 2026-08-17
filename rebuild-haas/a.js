/* First-party beacon. No cookies, no IP stored, no third party.
   Five fixed events, instrumented by delegation so a rebuild cannot drop them. */
(function () {
  'use strict';
  var seen = {};
  function send(ev) {
    try {
      var b = new Blob([JSON.stringify({ e: ev, p: location.pathname, t: Date.now() })],
        { type: 'application/json' });
      if (navigator.sendBeacon) navigator.sendBeacon('e', b);
    } catch (x) { /* a beacon never breaks the page */ }
  }
  function once(ev) { if (!seen[ev]) { seen[ev] = 1; send(ev); } }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a,button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^tel:/.test(href)) return send('Call');
    if (/google\.com\/maps/.test(href)) return send('Directions');
    if (a.type === 'submit') return send('Quote request');
    if (a.closest('.work')) return send('Work viewed');
    if (/#submit/.test(href)) return send('Reached CTA');
  }, true);

  var cta = document.getElementById('submit');
  if (cta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (rows, o) {
      rows.forEach(function (r) { if (r.isIntersecting) { once('Reached CTA'); o.disconnect(); } });
    }).observe(cta);
  }
  addEventListener('pagehide', function () { once('exit'); });
})();
