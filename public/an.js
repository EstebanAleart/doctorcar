/* an.js — snippet de analytics propio. Liviano, sin deps.
 * Captura PAGEVIEW + CLICK + CONVERSION y los manda a la RPC segura ingest_event
 * (Supabase de analytics pvzdtmygdsfgwncnzpsj). visitor_id persistente cruza dominios.
 * NO trackea /admin. Instalar una vez en el layout: <script src="/an.js" defer></script>
 */
(function () {
  'use strict';
  var SB_URL = 'https://pvzdtmygdsfgwncnzpsj.supabase.co';
  var SB_KEY = 'sb_publishable_YU3gGG18MkkBB2WfSIrgXw_wdRng1wh';

  // ── ID del proyecto ─────────────────────────────────────────────────────
  // data-site en el <script> = id ESTABLE del proyecto (unifica multi-dominio, ej. PP .com.ar+.eu).
  // Sin data-site cae al hostname (cada dominio = su propio sitio). La URL real siempre queda en el evento.
  var _me = document.currentScript;
  var SITE_KEY = (_me && _me.getAttribute('data-site')) || null;

  // ── NO trackear admin (ni login del admin) ─────────────────────────────
  function isBlocked() { return /^\/(admin|api)(\/|$)/i.test(location.pathname); }
  if (isBlocked()) return;

  // ── visitor id persistente (cruza dominios si compartís el storage) ────
  var vid;
  try {
    vid = localStorage.getItem('an_vid');
    if (!vid) { vid = (crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(16).slice(2)); localStorage.setItem('an_vid', vid); }
  } catch (e) { vid = 'anon-' + Math.random().toString(16).slice(2); }
  function sid() { try { return sessionStorage.getItem('an_sid') || null; } catch (e) { return null; } }
  function setSid(v) { try { if (v) sessionStorage.setItem('an_sid', v); } catch (e) {} }

  function q(name) { try { return new URL(location.href).searchParams.get(name); } catch (e) { return null; } }
  function domain() { return location.hostname.replace(/^www\./, ''); }

  function send(type, extra) {
    if (isBlocked()) return;
    var body = {
      p_domain: SITE_KEY || domain(), p_visitor: vid, p_event_type: type,
      p_url: location.href, p_path: location.pathname, p_session: sid(),
      p_referrer: document.referrer || null,
      p_utm_source: q('utm_source'), p_utm_medium: q('utm_medium'), p_utm_campaign: q('utm_campaign'),
      p_device: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      p_ua: navigator.userAgent
    };
    if (extra) for (var k in extra) body[k] = extra[k];
    try {
      fetch(SB_URL + '/rest/v1/rpc/ingest_event', {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY },
        body: JSON.stringify(body)
      }).then(function (r) { return r.ok ? r.json() : null; })
        .then(function (s) { if (typeof s === 'string') setSid(s); })
        .catch(function () {});
    } catch (e) {}
  }

  // ── PAGEVIEW (inicial + en cambios de ruta SPA de Next) ────────────────
  send('PAGEVIEW');
  var lastPath = location.pathname;
  function onRoute() { if (location.pathname !== lastPath) { lastPath = location.pathname; if (!isBlocked()) send('PAGEVIEW'); } }
  ['pushState', 'replaceState'].forEach(function (m) {
    var orig = history[m];
    history[m] = function () { var r = orig.apply(this, arguments); setTimeout(onRoute, 0); return r; };
  });
  window.addEventListener('popstate', onRoute);

  // ── CLICK / CONVERSION ─────────────────────────────────────────────────
  // Un elemento con data-goal="clave" cuenta como CONVERSION; el resto de a/button = CLICK.
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest && e.target.closest('a,button,[data-goal]');
    if (!el) return;
    var goal = el.getAttribute('data-goal');
    var sel = el.matches('a[data-cta]') ? 'a[data-cta]'
            : (el.tagName.toLowerCase() + (el.id ? '#' + el.id : (el.getAttribute('data-cta') ? '[data-cta]' : '')));
    send(goal ? 'CONVERSION' : 'CLICK', {
      p_element: sel,
      p_goal_key: goal || null,
      p_revenue_cents: el.getAttribute('data-revenue') ? parseInt(el.getAttribute('data-revenue'), 10) : null
    });
  }, true);
})();
