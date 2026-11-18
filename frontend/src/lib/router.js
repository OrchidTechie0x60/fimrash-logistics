// Minimal path router: deep links like /track/FMR-KN-7Q2X9A work from SMS and WhatsApp.
// Vercel rewrites every path to index.html, so the browser URL is the source of truth.
// /rider and /ops are internal: reachable by URL only, never linked from public pages.
import { useEffect, useState } from 'react';

const TAB_PATHS = { home: '/', booking: '/send', tracking: '/track', rider: '/rider', ledger: '/ops' };
export const PUBLIC_TABS = new Set(['home', 'booking', 'tracking']);

export function parsePath(pathname = window.location.pathname) {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(window.location.search));
  // Legacy ?tab= links keep working.
  if (!parts.length && query.tab) {
    const legacy = { booking: 'booking', tracking: 'tracking', rider: 'rider', ledger: 'ledger' }[query.tab];
    if (legacy) return { tab: legacy, code: null, query };
  }

  switch (parts[0]) {
    case 'send':
      return { tab: 'booking', code: null, query };
    case 'track':
      return { tab: 'tracking', code: parts[1] ? decodeURIComponent(parts[1]).toUpperCase() : null, query };
    case 'rider':
      return { tab: 'rider', code: null, query };
    case 'ops':
      return { tab: 'ledger', code: null, query };
    default:
      return { tab: 'home', code: null, query };
  }
}

export function hrefFor(tab, code = null, query = null) {
  const base = tab === 'tracking' && code ? `/track/${encodeURIComponent(code)}` : TAB_PATHS[tab] || '/';
  const qs = query ? new URLSearchParams(Object.entries(query).filter(([, v]) => v != null && v !== '')).toString() : '';
  return qs ? `${base}?${qs}` : base;
}

export function navigate(tab, code = null, query = null) {
  const path = hrefFor(tab, code, query);
  if (window.location.pathname + window.location.search !== path) {
    window.history.pushState({}, '', path);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0 });
}

// For <a href> links: keep normal browser behaviour (new tab, copy link) but route in-app on plain clicks.
export function linkHandler(tab, code = null, query = null) {
  return (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(tab, code, query);
  };
}

export function useRoute() {
  const [route, setRoute] = useState(() => parsePath());
  useEffect(() => {
    const onPop = () => setRoute(parsePath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return route;
}
