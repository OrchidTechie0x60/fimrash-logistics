// Pull-to-refresh for the Android app (no-op in browsers, which have their own).
// Pull down from the top of the page: the current screen re-fetches its data.
// Screens without data to refresh (the homepage) reload the page instead.
import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { isNativeApp } from '../lib/native';
import { runRefresh } from '../lib/refresh';

const TRIGGER = 72; // px of (dampened) pull needed to refresh
const MAX = 110;

// Don't hijack drags that start inside something that scrolls on its own, or on form fields/maps.
function startsInScrollable(target) {
  for (let el = target; el && el !== document.body; el = el.parentElement) {
    if (el.matches?.('input, textarea, select, [contenteditable="true"], [data-no-pull]')) return true;
    if (el.scrollTop > 0) return true;
  }
  return false;
}

export default function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const state = useRef({ startY: 0, startX: 0, active: false, pull: 0, busy: false });

  useEffect(() => {
    if (!isNativeApp()) return undefined;
    document.documentElement.classList.add('native-app');
    const s = state.current;

    const onStart = (e) => {
      if (s.busy || e.touches.length !== 1 || window.scrollY > 0 || startsInScrollable(e.target)) return;
      s.startY = e.touches[0].clientY;
      s.startX = e.touches[0].clientX;
      s.active = true;
      s.pull = 0;
    };

    const onMove = (e) => {
      if (!s.active) return;
      const dy = e.touches[0].clientY - s.startY;
      const dx = Math.abs(e.touches[0].clientX - s.startX);
      if (dy <= 0 || window.scrollY > 0 || dx > dy) {
        if (s.pull) { s.pull = 0; setPull(0); }
        if (dy < 0 || dx > dy) s.active = false;
        return;
      }
      if (e.cancelable) e.preventDefault(); // stop the WebView's own overscroll while pulling
      s.pull = Math.min(MAX, dy * 0.5);
      setPull(s.pull);
    };

    const onEnd = async () => {
      if (!s.active) return;
      s.active = false;
      const triggered = s.pull >= TRIGGER;
      s.pull = 0;
      if (!triggered) { setPull(0); return; }
      s.busy = true;
      setRefreshing(true);
      setPull(TRIGGER * 0.75);
      try {
        const handled = await runRefresh();
        const hasTypedInput = [...document.querySelectorAll('input, textarea')].some((el) => el.value);
        if (!handled && !hasTypedInput) { window.location.reload(); return; }
        await new Promise((r) => setTimeout(r, 350)); // let the spinner register
      } finally {
        s.busy = false;
        setRefreshing(false);
        setPull(0);
      }
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  if (!pull && !refreshing) return null;
  const progress = Math.min(1, pull / TRIGGER);
  return (
    <div
      className="fixed left-1/2 top-0 z-[60] pointer-events-none"
      style={{ transform: `translate(-50%, ${Math.max(8, pull - 24)}px)`, transition: state.current.active ? 'none' : 'transform 200ms ease-out' }}
      role="status"
      aria-live="polite"
    >
      <div className="w-10 h-10 rounded-full bg-white text-[#14215c] shadow-lg border border-slate-200 flex items-center justify-center">
        <RefreshCw
          className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
          style={refreshing ? undefined : { transform: `rotate(${progress * 270}deg)`, opacity: 0.4 + progress * 0.6 }}
        />
      </div>
      <span className="sr-only">{refreshing ? 'Refreshing' : progress >= 1 ? 'Release to refresh' : 'Pull to refresh'}</span>
    </div>
  );
}
