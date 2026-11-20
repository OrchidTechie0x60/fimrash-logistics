// Pull-to-refresh registry. Screens register what "refresh" means for them (re-fetch their data),
// so pulling down updates the data without reloading the app or wiping a half-filled form.
import { useEffect, useRef } from 'react';

const handlers = new Set();

export function useRefreshHandler(fn) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const handler = () => ref.current?.();
    handlers.add(handler);
    return () => handlers.delete(handler);
  }, []);
}

// Runs every registered handler. Returns false when the current screen registered none.
export async function runRefresh() {
  if (handlers.size === 0) return false;
  await Promise.allSettled([...handlers].map((h) => h()));
  return true;
}
