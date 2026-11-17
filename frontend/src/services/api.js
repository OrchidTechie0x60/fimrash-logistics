// Fimrash Logistics Services - Production API Client for Vercel <-> Whogohost Bridge
// Gracefully handles Whogohost REST API with automatic offline / fallback resilience

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export const isBackendConnected = () => Boolean(API_BASE_URL);

// Token helpers
export const getStoredToken = () => localStorage.getItem('fimrash_token') || null;
export const setStoredToken = (token) => {
  if (token) localStorage.setItem('fimrash_token', token);
  else localStorage.removeItem('fimrash_token');
};

const getAuthHeaders = () => {
  const token = getStoredToken();
  const headers = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Check health of the Whogohost backend
 */
export async function checkBackendHealth() {
  if (!API_BASE_URL) return { connected: false, message: 'VITE_API_BASE_URL not configured' };

  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { connected: true, data };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

/**
 * Authentication Login API (Rider & Admin)
 */
export async function loginApi({ identifier, pin, role }) {
  if (!API_BASE_URL) {
    // Offline local simulation
    if (role === 'rider') {
      const user = {
        role: 'rider',
        id: 'rider_04',
        name: 'Musa Garba',
        phone: '08156661246',
        bikeNumber: 'KN-942-TRN',
        zone: 'Kano Central'
      };
      return { success: true, user, token: 'offline_token_rider_04' };
    } else {
      const user = {
        role: 'admin',
        id: 'admin_ops',
        name: 'Kano Station Dispatcher',
        email: identifier,
        clearance: 'Level-3 Financial Controller'
      };
      return { success: true, user, token: 'offline_token_admin' };
    }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ identifier, pin, role })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    
    if (json.token) {
      setStoredToken(json.token);
    }
    return { success: true, user: json.user, token: json.token };
  } catch (err) {
    console.warn('[Fimrash API] Backend login failed, evaluating fallback:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all deliveries from Whogohost MySQL
 */
export async function getDeliveriesApi(fallbackDeliveries = []) {
  if (!API_BASE_URL) return { success: false, data: fallbackDeliveries, isFallback: true };

  try {
    const res = await fetch(`${API_BASE_URL}/api/deliveries`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { success: true, data: json.data || [], isFallback: false };
  } catch (err) {
    console.warn('[Fimrash API] Whogohost backend unreachable, using fallback storage:', err.message);
    return { success: false, data: fallbackDeliveries, isFallback: true, error: err.message };
  }
}

/**
 * Create a new consignment on Whogohost backend
 * Passes client-generated ID, tracking code, and OTP code to prevent desynchronization
 */
export async function createDeliveryApi(delivery) {
  if (!API_BASE_URL) return { success: true, delivery, isFallback: true };

  try {
    const payload = {
      id: delivery.id,
      tracking_code: delivery.trackingCode,
      otp_code: delivery.otpCode,
      sender_type: delivery.senderType || 'home',
      sender_name: delivery.senderName,
      sender_phone: delivery.senderPhone,
      sender_landmark_id: delivery.senderLandmark?.id || delivery.senderLandmark,
      sender_landmark_detail: delivery.senderDetail,
      recipient_type: delivery.recipientType || 'home',
      recipient_name: delivery.recipientName,
      recipient_phone: delivery.recipientPhone,
      recipient_landmark_id: delivery.recipientLandmark?.id || delivery.recipientLandmark,
      recipient_landmark_detail: delivery.recipientDetail,
      item_category: delivery.itemCategory,
      item_description: delivery.itemDescription,
      is_fragile: delivery.isFragile ? 1 : 0,
      special_instructions: delivery.deliveryNote || '',
      payment_mode: delivery.paymentMode || 'pay_on_delivery',
      cod_amount: delivery.codAmount || 0,
      delivery_fee: delivery.deliveryFee || 1000
    };

    const res = await fetch(`${API_BASE_URL}/api/deliveries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { 
      success: true, 
      delivery: { 
        ...delivery, 
        ...json.delivery,
        assignedRider: json.delivery?.assigned_rider || delivery.assignedRider 
      }, 
      isFallback: false 
    };
  } catch (err) {
    console.warn('[Fimrash API] Whogohost create delivery failed, saving locally:', err.message);
    return { success: true, delivery, isFallback: true, error: err.message };
  }
}

/**
 * Track single delivery with optional phone verification for unmasking OTP
 */
export async function trackDeliveryApi(code, phoneLast4 = '') {
  if (!API_BASE_URL) return { success: false, isFallback: true };

  try {
    const url = `${API_BASE_URL}/api/deliveries/${encodeURIComponent(code)}${phoneLast4 ? `?phone_last4=${phoneLast4}` : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { success: true, data: json.data, isFallback: false };
  } catch (err) {
    return { success: false, error: err.message, isFallback: true };
  }
}

/**
 * Update transit status (picked_up, in_transit, arrived)
 */
export async function updateDeliveryStatusApi(deliveryId, newStatus) {
  if (!API_BASE_URL) return { success: true, isFallback: true };

  try {
    const res = await fetch(`${API_BASE_URL}/api/deliveries/${deliveryId}/status`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders() 
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { success: true, isFallback: false };
  } catch (err) {
    console.warn('[Fimrash API] Whogohost status update failed, fallback:', err.message);
    return { success: true, isFallback: true };
  }
}

/**
 * Verify 4-digit recipient OTP handshake
 */
export async function verifyOtpApi(deliveryId, otpCode) {
  if (!API_BASE_URL) return { success: true, isFallback: true };

  try {
    const res = await fetch(`${API_BASE_URL}/api/deliveries/${deliveryId}/verify-otp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders() 
      },
      body: JSON.stringify({ otp_code: otpCode })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return { success: true, data: json, isFallback: false };
  } catch (err) {
    console.warn('[Fimrash API] Whogohost OTP verification fallback:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Remit rider cash pouch to station vault
 */
export async function remitRiderCashApi() {
  if (!API_BASE_URL) return { success: true, isFallback: true };

  try {
    const res = await fetch(`${API_BASE_URL}/api/remit-cash`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders() 
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { success: true, isFallback: false };
  } catch (err) {
    return { success: true, isFallback: true };
  }
}
