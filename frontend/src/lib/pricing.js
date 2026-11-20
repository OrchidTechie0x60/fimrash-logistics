// Live rate card for the price shown before booking. The server is authoritative; this mirrors it
// with the rates from /api/pricing (falls back to the defaults until they load).
import { useEffect, useState } from 'react';
import { getPricing } from '../services/api';
import { DEFAULT_RATES } from './pricingCore';

export { DEFAULT_RATES, PARCEL_SIZES, ROAD_FACTOR, quote, roadKm, tripMinutes } from './pricingCore';

let cached = null;
let inflight = null;
const subscribers = new Set();

// Live rate card, loaded once per page view (and again on pull-to-refresh).
export function usePricingRates() {
  const [rates, setRates] = useState(cached || DEFAULT_RATES);
  useEffect(() => {
    subscribers.add(setRates);
    if (!cached) {
      inflight = inflight || getPricing().then((r) => { cached = { ...DEFAULT_RATES, ...r }; return cached; });
      inflight.then(setRates).catch(() => { inflight = null; });
    }
    return () => { subscribers.delete(setRates); };
  }, []);
  return rates;
}

export function setCachedRates(rates) {
  cached = { ...DEFAULT_RATES, ...rates };
  subscribers.forEach((set) => set(cached));
}

// Re-fetch the rate card from the server and update every screen showing prices.
export async function refreshPricingRates() {
  const r = await getPricing();
  setCachedRates(r);
}
