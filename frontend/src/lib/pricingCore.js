// Pure pricing formula, identical to backend/src/Pricing.php (fare_parity.php checks every pair).
import { getLandmark } from '../data/kanoLandmarks.js';

export const ROAD_FACTOR = 1.35;
export const PARCEL_SIZES = ['small', 'medium', 'large'];

export const DEFAULT_RATES = {
  base: 800,
  perKm: 220,
  minimum: 1500,
  rounding: 100,
  sizeSmall: 0,
  sizeMedium: 500,
  sizeLarge: 1500,
  fragile: 300,
  codPercent: 1.5,
  codMinimum: 200,
};

const toRad = (deg) => (deg * Math.PI) / 180;

export function roadKm(fromId, toId) {
  const a = getLandmark(fromId);
  const b = getLandmark(toId);
  if (!a || !b) return 0;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const straight = 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
  return Math.floor(straight * ROAD_FACTOR * 10 + 0.5) / 10;
}

export const tripMinutes = (km) => Math.floor(8 + km * 2.8 + 0.5);

export function quote(rates, fromId, toId, { size = 'small', fragile = false, cod = 0 } = {}) {
  const km = roadKm(fromId, toId);
  const distance = rates.base + rates.perKm * km;
  const sizeFee = rates[`size${size.charAt(0).toUpperCase()}${size.slice(1)}`] ?? 0;
  const fragileFee = fragile ? rates.fragile : 0;
  const codFee = cod > 0 ? Math.max(rates.codMinimum, (cod * rates.codPercent) / 100) : 0;
  const raw = Math.max(rates.minimum, distance + sizeFee + fragileFee + codFee);
  const step = Math.max(1, rates.rounding);
  const fee = Math.ceil(Math.floor(raw * 100 + 0.5) / 100 / step) * step;
  return {
    fee,
    km,
    minutes: tripMinutes(km),
    breakdown: { distance: Math.round(distance), size: sizeFee, fragile: fragileFee, cod: Math.round(codFee), minimum: rates.minimum },
  };
}
