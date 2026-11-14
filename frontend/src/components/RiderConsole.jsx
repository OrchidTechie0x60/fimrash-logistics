import React, { useState } from 'react';
import { 
  Truck, MapPin, Phone, ShieldCheck, CheckCircle2, 
  AlertTriangle, ArrowRight, Banknote, Navigation, Compass, UserCheck, Package
} from 'lucide-react';

export default function RiderConsole({ deliveries, onUpdateDeliveryStatus, onVerifyOtpAndDeliver }) {
  const activeDeliveries = deliveries.filter(d => d.status !== 'delivered');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(activeDeliveries[0]?.id || null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [deliveryCashConfirmed, setDeliveryCashConfirmed] = useState(false);
  const [otpError, setOtpError] = useState(null);

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

  const handleVerifyHandshake = (e) => {
    e.preventDefault();
    if (!currentDelivery) return;

    // Delivery fee collection check for pay on delivery
    if (currentDelivery.paymentMode === 'pay_on_delivery' && !deliveryCashConfirmed) {
      setOtpError(`Dole ne ka tabbatar da karɓar kuɗin jigila ₦${currentDelivery.deliveryFee.toLocaleString()} (Please confirm collecting physical delivery fee) kafin kammala aiki!`);
      return;
    }

    if (fullEnteredOtp !== currentDelivery.otpCode) {
      setOtpError('Lambar sirri ba daidai ba! (Invalid 4-Digit OTP). Ask recipient to check their Fimrash tracking SMS/link.');
      return;
    }

    setOtpError(null);
    const cashCollected = currentDelivery.paymentMode === 'pay_on_delivery' ? currentDelivery.deliveryFee : 0;
    onVerifyOtpAndDeliver(currentDelivery.id, cashCollected);
    setOtpDigits(['', '', '', '']);
    setDeliveryCashConfirmed(false);
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
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Musa Garba</h1>
                <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                  Rider #04
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Bike: KN-942-TRN • Kano Central Dispatch Fleet
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
                    (₦{del.deliveryFee.toLocaleString()})
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs text-center font-medium">
            Dukkan ayyukan jigila sun kammala (All delivery jobs cleared for this shift).
          </div>
        )}
      </div>

      {currentDelivery ? (
        <div className="glass-card rounded-2xl p-5 sm:p-7 space-y-6">
          {/* Active Job Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Waybill Code:</span>
                <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono">{currentDelivery.trackingCode}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Kayan: <strong className="text-slate-900 dark:text-white font-medium">{currentDelivery.itemDescription}</strong> ({currentDelivery.itemCategory})
              </p>
            </div>

            {/* Delivery Fee Status Badge */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Kuɗin Jigila (Delivery Fee)</span>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                ₦{currentDelivery.deliveryFee.toLocaleString()}
              </div>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block">
                {currentDelivery.paymentMode === 'pay_on_delivery' ? '💵 Karɓi Kuɗi a Wurin Mai Saye' : '✅ An Riga An Biya (Prepaid)'}
              </span>
            </div>
          </div>

          {/* Landmarks & Contacts - Generously Padded Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender / Pickup Card */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wide">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>1. Wurin Karɓa (Pickup)</span>
                </div>
                <a
                  href={`tel:${currentDelivery.senderPhone}`}
                  className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5 font-semibold transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kira Mai Aike (Call)</span>
                </a>
              </div>
              <p className="text-sm text-slate-900 dark:text-white font-bold pl-6">
                {currentDelivery.senderLandmark.name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 pl-6">
                {currentDelivery.senderDetail}
              </p>
              <p className="text-xs text-slate-400 pl-6 pt-1">
                Mai Aika: {currentDelivery.senderName} ({currentDelivery.senderPhone})
              </p>
            </div>

            {/* Recipient / Dropoff Card */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wide">
                  <Navigation className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>2. Wurin Kaiwa (Dropoff)</span>
                </div>
                <a
                  href={`tel:${currentDelivery.recipientPhone}`}
                  className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5 font-semibold transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kira Mai Karɓa (Call)</span>
                </a>
              </div>
              <p className="text-sm text-slate-900 dark:text-white font-bold pl-6">
                {currentDelivery.recipientLandmark.name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 pl-6">
                {currentDelivery.recipientDetail}
              </p>
              <p className="text-xs text-slate-400 pl-6 pt-1">
                Mai Karɓa: {currentDelivery.recipientName} ({currentDelivery.recipientPhone})
              </p>
            </div>
          </div>

          {/* Transit Step Control Buttons - Average Standard Height (min 44px) */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Sabunta Halin Isarwa (Update Transit State)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => onUpdateDeliveryStatus(currentDelivery.id, 'picked_up')}
                disabled={currentDelivery.status !== 'pending' && currentDelivery.status !== 'assigned'}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold py-3 px-3 rounded-xl text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>1. Na Karɓi Kayan</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateDeliveryStatus(currentDelivery.id, 'in_transit')}
                disabled={currentDelivery.status !== 'picked_up'}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold py-3 px-3 rounded-xl text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>2. Ina Cikin Tafiya</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateDeliveryStatus(currentDelivery.id, 'arrived')}
                disabled={currentDelivery.status !== 'in_transit'}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold py-3 px-3 rounded-xl text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>3. Na Isa Wajen Mai Saye</span>
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
              Kada ka miƙa kayan har sai ka karɓi lambar sirri guda 4 da aka aika wa mai karɓa ta SMS/WhatsApp.
            </p>

            <form onSubmit={handleVerifyHandshake} className="space-y-4">
              {/* Delivery Fee Cash Confirmation Checkbox (Only if pay on delivery) */}
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
                    Na tabbatar na karɓi tsabar kuɗin jigila <span className="font-bold underline text-emerald-600 dark:text-emerald-400">₦{currentDelivery.deliveryFee.toLocaleString()}</span> a hannun mai karɓar kaya.
                  </label>
                </div>
              ) : (
                <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-3.5 rounded-xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                  ✅ Kuɗin jigila an biya tun farko (Prepaid by sender — Babu kuɗin da za ka karɓa).
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
