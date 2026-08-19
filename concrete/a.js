/* First-party tracking. Five fixed events, instrumented by delegation only —
   never by attributes added to the markup, because attributes die at the next
   rebuild and the dashboard then reports zero calls forever.
   No cookies, no IP, no third party. */
(function () {
  'use strict';
  if (/bot|crawl|spider|headless|lighthouse|preview/i.test(navigator.userAgent)) return;

  var sent = {};
  function send(name) {
    if (sent[name] && name !== 'Call') return;
    sent[name] = 1;
    var body = JSON.stringify({ e: name, p: location.pathname, t: Date.now(), w: innerWidth });
    if (navigator.sendBeacon) navigator.sendBeacon('a.js', body);
    else { var x = new XMLHttpRequest(); x.open('POST', 'a.js', true); x.send(body); }
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a,button');
    if (!a) return;
    var href = (a.getAttribute('href') || '').toLowerCase();
    if (href.indexOf('tel:') === 0) return send('Call');
    if (href.indexOf('maps.google') > -1 || href.indexOf('/maps') > -1) return send('Directions');
    if (a.closest('.pj')) return send('Work viewed');
  }, true);

  document.addEventListener('submit', function (e) {
    if (e.target.closest('.form')) send('Quote request');
  }, true);

  var cta = document.getElementById('submit');
  if (cta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (rows, obs) {
      rows.forEach(function (r) { if (r.isIntersecting) { send('Reached CTA'); obs.disconnect(); } });
    }, { threshold: 0.25 }).observe(cta);
  }
})();
