// Shared display helpers

export const naira = (amount) => `₦${Number(amount || 0).toLocaleString('en-NG')}`;

export const statusLabel = (status) =>
  ({
    pending: 'Awaiting courier',
    assigned: 'Courier assigned',
    picked_up: 'Picked up',
    in_transit: 'In transit',
    arrived: 'At destination',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  })[status] || status;

export const timeOf = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }) : '';

export const dateTimeOf = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-NG', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos',
      })
    : '';

// 08031234567 -> 2348031234567 for wa.me links
export const whatsappNumber = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('234')) return digits;
  if (digits.startsWith('0')) return `234${digits.slice(1)}`;
  return digits;
};

export const isNigerianMobile = (phone) => {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length === 13) digits = `0${digits.slice(3)}`;
  else if (digits.length === 10 && /^[789]/.test(digits)) digits = `0${digits}`;
  return /^0[789][01]\d{8}$/.test(digits);
};

export const trackingUrl = (code) => `${window.location.origin}/track/${code}`;
