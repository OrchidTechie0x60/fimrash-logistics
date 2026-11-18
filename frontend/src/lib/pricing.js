// Live rate card for the price shown before booking. The server is authoritative; this mirrors it
// with the rates from /api/pricing (falls back to the defaults until they load).
import { useEffect, useState } from 'react';
import { getPricing } from '../services/api';
import { DEFAULT_RATES } from './pricingCore';

export { DEFAULT_RATES, PARCEL_SIZES, ROAD_FACTOR, quote, roadKm, tripMinutes } from './pricingCore';

let cached = null;
let inflight = null;

// Live rate card, loaded once per page view.
export function usePricingRates() {
  const [rates, setRates] = useState(cached || DEFAULT_RATES);
  useEffect(() => {
    if (cached) return undefined;
    let alive = true;
    inflight = inflight || getPricing().then((r) => { cached = { ...DEFAULT_RATES, ...r }; return cached; });
    inflight.then((r) => alive && setRates(r)).catch(() => { inflight = null; });
    return () => { alive = false; };
  }, []);
  return rates;
}

export function setCachedRates(rates) {
  cached = { ...DEFAULT_RATES, ...rates };
}
