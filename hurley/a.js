/* The owner's door — first-party only. No cookies, no IP, no tag manager.
   Five fixed events, instrumented by delegation so a rebuild cannot drop them. */
(function () {
  'use strict';
  if (navigator.webdriver) return;                       /* bot filter */

  var sent = {};
  function send(name) {
    if (sent[name]) return;
    sent[name] = 1;
    try {
      var body = JSON.stringify({ e: name, p: location.pathname, t: Date.now() });
      if (navigator.sendBeacon) navigator.sendBeacon('a/collect', body);
    } catch (err) { /* never break the page for a metric */ }
  }

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest ? ev.target.closest('a,button') : null;
    if (!a) return;
    var href = (a.getAttribute('href') || '').toLowerCase();
    if (href.indexOf('tel:') === 0) return send('Call');
    if (href.indexOf('maps.google') > -1 || href.indexOf('goo.gl/maps') > -1) return send('Directions');
    if (a.closest('.pjs') || a.closest('.lb')) return send('Work viewed');
    if (href.indexOf('#submit') === 0) return send('Reached CTA');
    if (a.type === 'submit') return send('Quote request');
  }, true);

  var form = document.querySelector('.form');
  if (form) form.addEventListener('submit', function () { send('Quote request'); });

  var cta = document.getElementById('submit');
  if (cta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting) { send('Reached CTA'); o.disconnect(); }
    }, { threshold: 0.25 }).observe(cta);
  }
})();
