/* The owner's door — first-party, relative, no cookies, no IP, no tag manager.
   Five fixed events, instrumented by DELEGATION so a rebuild cannot drop them. */
(function () {
  'use strict';
  var sent = {};
  function send(name) {
    if (name === 'Call' || !sent[name]) {
      sent[name] = 1;
      try {
        navigator.sendBeacon && navigator.sendBeacon('a', new Blob(
          [JSON.stringify({ e: name, p: location.pathname, t: Date.now() })],
          { type: 'text/plain' }));
      } catch (err) { /* tracking never breaks the page */ }
      (window.__wsl = window.__wsl || []).push(name);
    }
  }

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a,button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^tel:/i.test(href)) return send('Call');
    if (/maps|directions/i.test(href)) return send('Directions');
    if (a.classList.contains('tile')) return send('Work viewed');
    if (a.classList.contains('btn') || a.type === 'submit') return send('Reached CTA');
  }, true);

  document.addEventListener('submit', function (ev) {
    if (ev.target && ev.target.id === 'submit') send('Quote request');
  }, true);

  var cta = document.getElementById('contact');
  if (cta && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { send('Reached CTA'); io.disconnect(); } });
    }, { threshold: 0.15 });
    io.observe(cta);
  }
  addEventListener('pagehide', function () { send('exit'); });
})();
