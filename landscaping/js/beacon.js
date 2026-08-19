/* First-party tracking. Five fixed events, instrumented by delegation only.
   No cookies, no IP stored, no third party. The server at /a decides what to keep. */
(function () {
  'use strict';
  if (/bot|crawl|spider|headless|preview|lighthouse/i.test(navigator.userAgent)) return;

  var sent = {};
  function send(name) {
    if (sent[name]) return;
    sent[name] = 1;
    var body = new URLSearchParams({ e: name, p: location.pathname, r: document.referrer || '' });
    if (navigator.sendBeacon) navigator.sendBeacon('a', body);
    else fetch('a', { method: 'POST', body: body, keepalive: true }).catch(function () {});
  }

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a,button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^tel:/.test(href)) return send('Call');
    if (a.dataset && a.dataset.ev === 'dir') return send('Directions');
    if (a.dataset && a.dataset.ev === 'work') return send('Work viewed');
    if (a.dataset && a.dataset.ev === 'cta') return send('Reached CTA');
  }, true);

  var form = document.querySelector('form.fm');
  if (form) form.addEventListener('submit', function () { send('Quote request'); });

  var cta = document.getElementById('submit');
  if (cta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting) { send('Reached CTA'); o.disconnect(); }
    }, { threshold: 0.25 }).observe(cta);
  }
})();
