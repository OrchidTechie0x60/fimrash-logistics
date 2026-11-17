import React, { useState } from 'react';
import { 
  Truck, MapPin, Phone, ShieldCheck, CheckCircle2, 
  AlertTriangle, ArrowRight, Banknote, Navigation, Compass, UserCheck, Package,
  QrCode, Scan
} from 'lucide-react';

export default function RiderConsole({ deliveries, onUpdateDeliveryStatus, onVerifyOtpAndDeliver }) {
  const activeDeliveries = deliveries.filter(d => d.status !== 'delivered');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(activeDeliveries[0]?.id || null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [deliveryCashConfirmed, setDeliveryCashConfirmed] = useState(false);
  const [codCashConfirmed, setCodCashConfirmed] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [qrScanSuccess, setQrScanSuccess] = useState(false);

  const currentDelivery = deliveries.find(d => d.id === selectedDeliveryId) || activeDeliveries[0];

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const fullEnteredOtp = otpDigits.join('');

  // QR Handshake Scanner simulation
  const handleSimulateQrScan = () => {
    if (!currentDelivery) return;
    const targetOtp = String(currentDelivery.otpCode);
    setOtpDigits(targetOtp.split(''));
    setDeliveryCashConfirmed(true);
    setCodCashConfirmed(true);
    setQrScanSuccess(true);
    setTimeout(() => setQrScanSuccess(false), 3000);
  };

  const handleVerifyHandshake = (e) => {
    e.preventDefault();
    if (!currentDelivery) return;

    const isPayOnDelivery = currentDelivery.paymentMode === 'pay_on_delivery';
    const isCod = Number(currentDelivery.codAmount || 0) > 0;

    // Delivery fee collection check for pay on delivery
    if (isPayOnDelivery && !deliveryCashConfirmed) {
      setOtpError(`Dole ne ka tabbatar da karɓar kuɗin jigila ₦${Number(currentDelivery.deliveryFee).toLocaleString()} (Please confirm collecting physical delivery fee) kafin kammala aiki!`);
      return;
    }

    // CoD item value collection check
    if (isCod && !codCashConfirmed) {
      setOtpError(`Dole ne ka tabbatar da karɓar kuɗin kaya CoD ₦${Number(currentDelivery.codAmount).toLocaleString()} na mai kayan (Vendor item fee collection must be confirmed)!`);
      return;
    }

    if (fullEnteredOtp !== String(currentDelivery.otpCode)) {
      setOtpError('Lambar sirri ba daidai ba! (Invalid 4-Digit OTP). Ask recipient to check their Fimrash tracking SMS/link.');
      return;
    }

    setOtpError(null);
    const feeToCollect = isPayOnDelivery ? Number(currentDelivery.deliveryFee) : 0;
    const codToCollect = isCod ? Number(currentDelivery.codAmount) : 0;
    const totalCash = feeToCollect + codToCollect;

    onVerifyOtpAndDeliver(currentDelivery.id, totalCash);
    setOtpDigits(['', '', '', '']);
    setDeliveryCashConfirmed(false);
    setCodCashConfirmed(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Driver Identity Card - Standard Comfortable Sizing */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl">
              🏍️
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentDelivery?.assignedRider?.name || 'Musa Garba'}
                </h1>
                <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                  Active Dispatcher
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Bike: {currentDelivery?.assignedRider?.bikeNumber || 'KN-942-TRN'} • Kano Metro Corridor
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">Active Shift</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {activeDeliveries.length} <span className="text-xs font-sans text-slate-400">Jobs</span>
            </span>
          </div>
        </div>

        {/* Deliveries selector tabs */}
        {activeDeliveries.length > 0 ? (
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {activeDeliveries.map((del) => {
              const isSelected = currentDelivery?.id === del.id;
              return (
                <button
                  key={del.id}
                  onClick={() => {
                    setSelectedDeliveryId(del.id);
                    setOtpError(null);
                    setOtpDigits(['', '', '', '']);
                    setDeliveryCashConfirmed(false);
                    setCodCashConfirmed(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap border shrink-0 transition-all flex items-center space-x-2 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>{del.trackingCode}</span>
                  <span className="opacity-75 text-xs font-mono font-normal">
                    (₦{Number(del.deliveryFee).toLocaleString()})
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            Babu sauran aikin da ke jiran aikawa a yanzu (All deliveries completed).
          </div>
        )}
      </div>

      {currentDelivery ? (
        <div className="glass-card rounded-2xl p-5 sm:p-7 space-y-6 shadow-sm">
          {/* Active Job Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Waybill</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {currentDelivery.trackingCode}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md font-bold uppercase bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {currentDelivery.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Kaya: <strong className="text-slate-900 dark:text-white">{currentDelivery.itemDescription}</strong> ({currentDelivery.itemCategory})
              </p>
            </div>

            {/* Quick Optical Handshake Scan */}
            <button
              type="button"
              onClick={handleSimulateQrScan}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl border border-slate-700 transition flex items-center space-x-2 cursor-pointer self-start sm:self-auto shadow-sm"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Duba Recipient QR Handshake</span>
            </button>
          </div>

          {qrScanSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>An tantance QR Pass na mai karɓa! Lambar sirri ta shiga ta atomatik.</span>
            </div>
          )}

          {/* Sender & Recipient Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            {/* Origin (Sender) */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Wajen Karɓa (Pickup Origin)</span>
                </span>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                  {currentDelivery.senderType || 'home'}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  {currentDelivery.senderLandmark?.name}
                </span>
                <span className="text-slate-600 dark:text-slate-300 block text-xs mt-0.5">
                  {currentDelivery.senderDetail}
                </span>
                <span className="text-slate-400 text-[11px] block mt-1">
                  Mai aikawa: {currentDelivery.senderName}
                </span>
              </div>

              <a
                href={`tel:${currentDelivery.senderPhone}`}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline pt-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Kira Mai Aikawa: {currentDelivery.senderPhone}</span>
              </a>
            </div>

            {/* Destination (Recipient) */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span className="flex items-center space-x-1">
                  <Navigation className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Wajen Kaiwa (Drop-off Destination)</span>
                </span>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                  {currentDelivery.recipientType || 'home'}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  {currentDelivery.recipientLandmark?.name}
                </span>
                <span className="text-slate-600 dark:text-slate-300 block text-xs mt-0.5">
                  {currentDelivery.recipientDetail}
                </span>
                <span className="text-slate-400 text-[11px] block mt-1">
                  Mai karɓa: {currentDelivery.recipientName}
                </span>
              </div>

              <a
                href={`tel:${currentDelivery.recipientPhone}`}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline pt-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Kira Mai Karɓa: {currentDelivery.recipientPhone}</span>
              </a>
            </div>
          </div>

          {/* Courier Action Buttons for Stages */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Sabunta Matsayin Aiki (Corridor Transit Milestones)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => onUpdateDeliveryStatus(currentDelivery.id, 'picked_up')}
                disabled={currentDelivery.status !== 'pending' && currentDelivery.status !== 'assigned'}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold py-3 px-3 rounded-xl text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>1. Na Karɓi Kayan (Picked Up)</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateDeliveryStatus(currentDelivery.id, 'in_transit')}
                disabled={currentDelivery.status !== 'picked_up'}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold py-3 px-3 rounded-xl text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>2. Ina Kan Hanyar Kaiwa (In Transit)</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateDeliveryStatus(currentDelivery.id, 'arrived')}
                disabled={currentDelivery.status !== 'in_transit'}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold py-3 px-3 rounded-xl text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>3. Na Isa Wajen Mai Karɓa (Arrived)</span>
              </button>
            </div>
          </div>

          {/* Secure Handshake 4-Digit OTP Pad */}
          <div className="p-5 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white text-xs sm:text-sm font-bold uppercase tracking-wider">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Tantance Lambar Sirri (4-Digit Handshake OTP)</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Kada ka miƙa kayan har sai ka karɓi lambar sirri guda 4 da aka aika wa mai karɓa ta SMS/WhatsApp pass.
            </p>

            <form onSubmit={handleVerifyHandshake} className="space-y-4">
              {/* Delivery Fee Cash Confirmation Checkbox */}
              {currentDelivery.paymentMode === 'pay_on_delivery' ? (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="confirm-delivery-cash"
                    checked={deliveryCashConfirmed}
                    onChange={(e) => setDeliveryCashConfirmed(e.target.checked)}
                    className="mt-0.5 w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="confirm-delivery-cash" className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold cursor-pointer">
                    Na tabbatar na karɓi tsabar kuɗin jigila <span className="font-bold underline text-emerald-600 dark:text-emerald-400">₦{Number(currentDelivery.deliveryFee).toLocaleString()}</span> a hannun mai karɓar kaya.
                  </label>
                </div>
              ) : (
                <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-3.5 rounded-xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                  ✅ Kuɗin jigila an biya tun farko (Prepaid delivery fee — Babu kuɗin aikawa da za ka karɓa).
                </div>
              )}

              {/* Real Merchant CoD Item Value Confirmation */}
              {Number(currentDelivery.codAmount || 0) > 0 && (
                <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-4 rounded-xl flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="confirm-cod-cash"
                    checked={codCashConfirmed}
                    onChange={(e) => setCodCashConfirmed(e.target.checked)}
                    className="mt-0.5 w-5 h-5 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="confirm-cod-cash" className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold cursor-pointer">
                    Na karɓi tsabar kuɗin kaya CoD na mai shago/baker <span className="font-bold underline text-amber-700 dark:text-amber-400 font-mono">₦{Number(currentDelivery.codAmount).toLocaleString()}</span> don mayarwa ga mai aikawa.
                  </label>
                </div>
              )}

              {/* 4 Large Digit Input Boxes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Shigar da Lambar Sirri (Enter 4-Digit OTP)
                </label>
                <div className="flex justify-center gap-3 sm:gap-4">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      id={`otp-box-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otpDigits[idx]}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl font-bold font-mono rounded-xl bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-900 dark:text-white transition"
                    />
                  ))}
                </div>
              </div>

              {otpError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Big Confirm Button */}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl text-center text-sm sm:text-base shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Kammala Isarwa (Confirm OTP &amp; Clear Delivery)</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 text-center text-slate-500">
          <p className="text-sm">Babu aikin da aka zaɓa (No delivery selected).</p>
        </div>
      )}
    </div>
  );
}
