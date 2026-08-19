/* First-party analytics beacon. One tag, same origin, no cookies, no IP.
   <script defer src="/a.js"></script>

   What it sends and nothing more: a random id it made up for this browser, a random id for this
   tab, which page, how far down the page the visitor got, how long they stayed, where they came
   from (host only), a coarse device class, and which of the five conversion actions they took.
   There is no fingerprinting here — no canvas, no fonts, no screen metrics, no IP. "Returning
   visitor" works because the browser keeps its own id, not because we recognise anything about it.

   Loudly harmless: the page renders and functions identically with this file blocked or absent. */
(function () {
  'use strict';
  // In production the Host header names the site and this is just '/api/e'. The override exists
  // so the whole thing can be exercised on localhost, where every client shares one hostname.
  var API = '/api/e';
  try {
    var q = new URLSearchParams(location.search).get('site');
    if (q) API += '?site=' + encodeURIComponent(q);
  } catch (e) {}

  function id() {
    try { return crypto.randomUUID(); }
    catch (e) { return String(Date.now()) + Math.random().toString(36).slice(2); }
  }

  // localStorage survives the tab closing, which is the whole basis of new-vs-returning.
  // Private mode and a cleared browser both make a returning visitor look new — that is a known
  // and acceptable undercount of "returning", and it is the honest cost of not tracking people.
  var isNew = 0, vid, sid;
  try {
    vid = localStorage.getItem('_av');
    if (!vid) { vid = id(); localStorage.setItem('_av', vid); isNew = 1; }
    sid = sessionStorage.getItem('_as');
    if (!sid) { sid = id(); sessionStorage.setItem('_as', sid); }
  } catch (e) {
    // Storage blocked. Still count the visit; it just looks like a brand-new person every time.
    vid = vid || id(); sid = sid || id(); isNew = 1;
  }

  var W = window, D = document;
  var device = matchMedia('(max-width: 700px)').matches ? 'phone'
             : matchMedia('(max-width: 1100px)').matches ? 'tablet' : 'desktop';
  var ref = '';
  try { ref = D.referrer ? new URL(D.referrer).hostname.replace(/^www\./, '') : ''; } catch (e) {}
  if (ref === location.hostname.replace(/^www\./, '')) ref = '';   // internal clicks are not sources

  function post(e, viaBeacon) {
    e.visitor = vid; e.session = sid; e.nw = isNew;
    e.path = location.pathname || '/';
    var s = JSON.stringify(e);
    // sendBeacon is the only transport the browser promises to finish during unload; a normal
    // fetch is cancelled with the page and the exit event silently never arrives.
    if (viaBeacon && navigator.sendBeacon) {
      try { if (navigator.sendBeacon(API, new Blob([s], { type: 'text/plain' }))) return; } catch (x) {}
    }
    try { fetch(API, { method: 'POST', body: s, keepalive: true,
                       headers: { 'content-type': 'text/plain' } }); } catch (x) {}
  }

  post({ kind: 'view', ref: ref, device: device });

  // ---- how far down they got -------------------------------------------------------------
  var deepest = 0;
  function mark() {
    var h = D.documentElement;
    var total = Math.max(h.scrollHeight, D.body ? D.body.scrollHeight : 0);
    var seen = (W.scrollY || h.scrollTop || 0) + W.innerHeight;
    var pct = total > 0 ? (seen / total) * 100 : 100;
    if (pct > deepest) deepest = Math.min(100, pct);
  }
  addEventListener('scroll', mark, { passive: true });
  addEventListener('resize', mark);
  mark();

  // ---- the exit --------------------------------------------------------------------------
  // Which page they left from and how far they had got. Fired once; re-armed if the page comes
  // back out of the back/forward cache, which otherwise loses the second visit entirely.
  var t0 = Date.now(), gone = false;
  function leave() {
    if (gone) return;
    gone = true;
    mark();
    post({ kind: 'exit', device: device, scroll: Math.round(deepest), dwell: Date.now() - t0 }, true);
  }
  addEventListener('pagehide', leave);
  // On document, not window. visibilitychange is dispatched at the document and only reaches
  // window by bubbling — true in a real browser, but it makes the one event that carries scroll
  // depth depend on propagation for no reason.
  D.addEventListener('visibilitychange', function () { if (D.visibilityState === 'hidden') leave(); });
  addEventListener('pageshow', function (e) { if (e.persisted) { gone = false; t0 = Date.now(); } });

  // ---- conversions -----------------------------------------------------------------------
  // Delegated, never hand-tagged: these pages are regenerated from the blueprint, and attributes
  // added to individual links survive until the next rebuild and then report zero forever — which
  // reads as "the site isn't working", the most expensive false negative available.
  function label(el) {
    var h = el.querySelector('h2,h3,h4'), img = el.querySelector('img[alt]');
    var s = el.getAttribute('aria-label') || (h && h.textContent) ||
            (img && img.getAttribute('alt')) || el.textContent || '';
    return s.replace(/\s+/g, ' ').trim().slice(0, 80);
  }
  addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest && ev.target.closest('a, button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    // Call first: several CTAs are themselves tel: links, and the call is the money event.
    if (href.indexOf('tel:') === 0) return post({ kind: 'Call', device: device, label: a.className });
    if (/maps\.google|google\.[a-z.]+\/maps/.test(href)) return post({ kind: 'Directions', device: device });
    if (a.closest('#work')) return post({ kind: 'Work viewed', device: device, label: label(a) });
    // §1a.16 — the hero fly-through counts as viewing work; it IS the flagship project
    if (a.closest('.hero__fly'))
      return post({ kind: 'Work viewed', device: device, label: 'flythrough' });
    if (href.indexOf('mailto:') === 0 || a.classList.contains('btn') || /contact/i.test(href))
      return post({ kind: 'Quote request', device: device, label: label(a).slice(0, 40) });
  }, { passive: true });

  // A real form on the page, if one is ever added, is the strongest conversion there is.
  addEventListener('submit', function (ev) {
    if (ev.target && ev.target.tagName === 'FORM')
      post({ kind: 'Quote request', device: device, label: 'form' }, true);
  }, true);
})();
