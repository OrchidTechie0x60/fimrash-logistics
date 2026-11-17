// Fimrash Logistics Services - API client (Vercel frontend <-> Whogohost PHP API)
// The server is the single source of truth. Failures surface as ApiError; nothing is faked locally.

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const TOKEN_KEY = 'fimrash_token';

export class ApiError extends Error {
  constructor(message, status = 0, data = {}) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch { /* storage unavailable (private mode) */ }
  },
};

export const getToken = () => storage.get(TOKEN_KEY);
export const setToken = (token) => storage.set(TOKEN_KEY, token || null);

// Components subscribe so an expired/revoked session signs the user out everywhere.
const unauthorizedListeners = new Set();
export const onUnauthorized = (fn) => {
  unauthorizedListeners.add(fn);
  return () => unauthorizedListeners.delete(fn);
};

async function request(method, path, body) {
  const headers = { Accept: 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Cannot reach the Fimrash server. Check your internet connection and try again.', 0);
  }

  let data = {};
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(
        API_BASE_URL
          ? 'The server returned an unexpected response. Please try again shortly.'
          : 'The app is not connected to its API (VITE_API_BASE_URL is not set).',
        res.status,
      );
    }
  }

  if (!res.ok) {
    if (res.status === 401 && token) {
      setToken(null);
      unauthorizedListeners.forEach((fn) => fn());
    }
    throw new ApiError(data.error || `Request failed (HTTP ${res.status})`, res.status, data);
  }
  return data;
}

// ── Auth ────────────────────────────────────────────────────────
export async function login({ role, identifier, secret }) {
  const data = await request('POST', '/api/auth/login', { role, identifier, secret });
  setToken(data.token);
  return data.user;
}
export const logout = () => setToken(null);
export const fetchMe = () => request('GET', '/api/auth/me').then((d) => d.user);
export const changeSecret = (current, next) => request('POST', '/api/auth/change-secret', { current, new: next });

// ── Public ──────────────────────────────────────────────────────
export const checkHealth = () => request('GET', '/api/health');
export const trackDelivery = (code) =>
  request('GET', `/api/track/${encodeURIComponent(code.trim().toUpperCase())}`).then((d) => d.delivery);

export const createDelivery = (form) =>
  request('POST', '/api/deliveries', {
    sender_type: form.senderType,
    sender_name: form.senderName,
    sender_phone: form.senderPhone,
    sender_landmark_id: form.senderLandmark,
    sender_landmark_detail: form.senderDetail,
    recipient_type: form.recipientType,
    recipient_name: form.recipientName,
    recipient_phone: form.recipientPhone,
    recipient_landmark_id: form.recipientLandmark,
    recipient_landmark_detail: form.recipientDetail,
    item_category: form.itemCategory,
    item_description: form.itemDescription,
    is_fragile: form.isFragile,
    special_instructions: form.deliveryNote,
    payment_mode: form.paymentMode,
    cod_amount: form.isCodActive ? Number(form.codAmount || 0) : 0,
  });

// ── Rider + admin ───────────────────────────────────────────────
export const listDeliveries = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return request('GET', `/api/deliveries${qs ? `?${qs}` : ''}`);
};
export const getDelivery = (id) => request('GET', `/api/deliveries/${id}`).then((d) => d.delivery);
export const updateDeliveryStatus = (id, status) =>
  request('POST', `/api/deliveries/${id}/status`, { status }).then((d) => d.delivery);
export const verifyOtp = (id, otp) => request('POST', `/api/deliveries/${id}/verify-otp`, { otp });
export const setAvailability = (status) => request('POST', '/api/rider/availability', { status }).then((d) => d.user);

// ── Admin ───────────────────────────────────────────────────────
export const assignDelivery = (id, riderId) =>
  request('POST', `/api/deliveries/${id}/assign`, { rider_id: riderId }).then((d) => d.delivery);
export const cancelDelivery = (id, reason) =>
  request('POST', `/api/deliveries/${id}/cancel`, { reason }).then((d) => d.delivery);
export const resetDeliveryOtp = (id) => request('POST', `/api/deliveries/${id}/reset-otp`, {});
export const markCodPaid = (id, reference) =>
  request('POST', `/api/deliveries/${id}/cod-payout`, { reference }).then((d) => d.delivery);
export const listRiders = () => request('GET', '/api/riders').then((d) => d.riders);
export const saveRider = (rider, id = null) =>
  request('POST', id ? `/api/riders/${id}` : '/api/riders', rider).then((d) => d.rider);
export const remitRiderCash = (riderId, receivedAmount, note = '') =>
  request('POST', `/api/riders/${riderId}/remit`, { received_amount: receivedAmount, note }).then((d) => d.remittance);
export const getReconciliation = () => request('GET', '/api/reconciliation');
