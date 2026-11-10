(function (root) {
  const nav = root.navigator;
  const off = nav.webdriver || nav.globalPrivacyControl === true || nav.doNotTrack === '1' || !/^https?:$/.test(location.protocol);

  function send(e, data) {
    if (off) return;
    if (e === 'checkout') {
      try {
        if (sessionStorage.getItem('dstar_checkout_seen')) return;
        sessionStorage.setItem('dstar_checkout_seen', '1');
      } catch {}
    }
    const body = JSON.stringify({ e, ...data });
    try {
      if (nav.sendBeacon && nav.sendBeacon('/api/evento', new Blob([body], { type: 'application/json' }))) return;
    } catch {}
    try {
      fetch('/api/evento', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
    } catch {}
  }

  function source() {
    const utm = new URLSearchParams(location.search).get('utm_source');
    if (utm && /^[a-z0-9._-]{1,40}$/i.test(utm)) return utm.toLowerCase();
    let host = '';
    try { host = new URL(document.referrer).hostname.replace(/^www\./, ''); } catch {}
    if (!host || host === location.hostname) return 'directo';
    const known = [['instagram', /(^|\.)instagram\.com$/], ['facebook', /(^|\.)facebook\.com$|(^|\.)fb\.me$/], ['tiktok', /(^|\.)tiktok\.com$/], ['x', /(^|\.)(t\.co|x\.com|twitter\.com)$/], ['google', /(^|\.)google\./], ['whatsapp', /whatsapp/]];
    const hit = known.find(([, re]) => re.test(host));
    return hit ? hit[0] : host.slice(0, 40);
  }

  function device() {
    if (root.matchMedia('(max-width: 768px)').matches) return 'movil';
    return root.matchMedia('(max-width: 1024px)').matches ? 'tablet' : 'escritorio';
  }

  function pageView() {
    let visit = false;
    try {
      visit = !sessionStorage.getItem('dstar_visit');
      sessionStorage.setItem('dstar_visit', '1');
    } catch {}
    const path = location.pathname.toLowerCase().replace(/[^a-z0-9._/-]/g, '').replace(/\.html$/, '').replace(/\/index$/, '/').slice(0, 100) || '/';
    send('view', { path, visit, ...(visit ? { source: source(), device: device() } : {}) });
  }

  const queue = [];
  root.DSTAR_TRACK = (e, data) => (document.prerendering ? queue.push([e, data]) : send(e, data || {}));
  if (document.prerendering) {
    document.addEventListener('prerenderingchange', () => {
      pageView();
      queue.splice(0).forEach(([e, data]) => send(e, data || {}));
    }, { once: true });
  } else pageView();
})(window);
