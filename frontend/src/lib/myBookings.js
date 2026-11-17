// Bookings made from this device. The handover code (OTP) is only ever returned to the
// sender once, at booking time, so we keep it here so the sender can re-share it later.

const KEY = 'fimrash_my_bookings';
const MAX = 30;

export function getMyBookings() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveMyBooking(delivery) {
  const entry = {
    trackingCode: delivery.trackingCode,
    otp: delivery.otp,
    recipientName: delivery.recipientName,
    recipientPhone: delivery.recipientPhone,
    createdAt: delivery.createdAt,
  };
  const list = [entry, ...getMyBookings().filter((b) => b.trackingCode !== entry.trackingCode)].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* storage full or unavailable */ }
}

export function updateMyBookingOtp(trackingCode, otp) {
  const list = getMyBookings().map((b) => (b.trackingCode === trackingCode ? { ...b, otp } : b));
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

export const findMyBooking = (trackingCode) =>
  getMyBookings().find((b) => b.trackingCode?.toUpperCase() === String(trackingCode || '').toUpperCase()) || null;
