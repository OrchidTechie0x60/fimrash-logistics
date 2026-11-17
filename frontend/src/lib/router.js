// Minimal path router: deep links like /track/FMR-KN-7Q2X9A work from SMS and WhatsApp.
// Vercel rewrites every path to index.html, so the browser URL is the source of truth.
import { useEffect, useState } from 'react';

const TAB_PATHS = { booking: '/', tracking: '/track', rider: '/rider', ledger: '/ops' };

export function parsePath(pathname = window.location.pathname) {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  // Legacy ?tab= links keep working.
  const legacyTab = new URLSearchParams(window.location.search).get('tab');
  if (!parts.length && legacyTab && TAB_PATHS[legacyTab]) return { tab: legacyTab, code: null };

  switch (parts[0]) {
    case 'track':
      return { tab: 'tracking', code: parts[1] ? decodeURIComponent(parts[1]).toUpperCase() : null };
    case 'rider':
      return { tab: 'rider', code: null };
    case 'ops':
      return { tab: 'ledger', code: null };
    default:
      return { tab: 'booking', code: null };
  }
}

export function navigate(tab, code = null) {
  const path = tab === 'tracking' && code ? `/track/${encodeURIComponent(code)}` : TAB_PATHS[tab] || '/';
  if (window.location.pathname + window.location.search !== path) {
    window.history.pushState({}, '', path);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0 });
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
