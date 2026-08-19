/* First-party beacon. Relative path, no leading slash, no cookies, no IP stored.
   Five fixed events, instrumented BY DELEGATION so a rebuild cannot drop them. */
(function () {
  'use strict';
  if (navigator.webdriver) return;                 // bot filter

  var sent = {};
  function send(name) {
    if (sent[name]) return;
    sent[name] = 1;
    try {
      var body = JSON.stringify({ e: name, p: location.pathname, t: Date.now() });
      if (navigator.sendBeacon) navigator.sendBeacon('a.js', body);
    } catch (err) { /* never break the page for a metric */ }
  }
  window.__beaconSent = sent;

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a,button');
    if (!a) return;
    var href = (a.getAttribute('href') || '').toLowerCase();

    if (href.indexOf('tel:') === 0) return send('Call');                 // the money event
    if (href.indexOf('maps.app.goo.gl') > -1 || href.indexOf('google.com/maps') > -1) return send('Directions');
    if (a.type === 'submit' || href === '#book') return send('Reached CTA');
  }, true);

  document.addEventListener('submit', function () { send('Quote request'); }, true);

  var work = document.getElementById('work');
  if (work && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { send('Work viewed'); io.disconnect(); } });
    }, { threshold: 0.4 });
    io.observe(work);
  }
})();
