import React, { useState } from 'react';
import { 
  Truck, MapPin, Phone, ShieldCheck, CheckCircle2, 
  AlertTriangle, ArrowRight, Banknote, Navigation, Compass, UserCheck
} from 'lucide-react';

export default function RiderConsole({ deliveries, onUpdateDeliveryStatus, onVerifyOtpAndDeliver }) {
  const activeDeliveries = deliveries.filter(d => d.status !== 'delivered');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(activeDeliveries[0]?.id || null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [codCashConfirmed, setCodCashConfirmed] = useState(false);
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

    if (currentDelivery.isCod && !codCashConfirmed) {
      setOtpError('Dole ne ka tabbatar da karɓar kuɗin tsaba (Confirm receiving physical cash) before clearing delivery!');
      return;
    }

    if (fullEnteredOtp !== currentDelivery.otpCode) {
      setOtpError('Lambar sirri ba daidai ba! (Invalid 4-Digit OTP). Ask recipient to check their Fimrash tracking link.');
      return;
    }

    setOtpError(null);
    onVerifyOtpAndDeliver(currentDelivery.id, currentDelivery.isCod ? currentDelivery.itemValue : 0);
    setOtpDigits(['', '', '', '']);
    setCodCashConfirmed(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Driver Identity Card */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl">
              🏍️
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-base font-bold text-slate-900 dark:text-white">Musa Garba</h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Rider #04
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Bike: KN-942-TRN • Kano Central Fleet</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Active Shift</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {activeDeliveries.length} <span className="text-xs font-sans text-slate-400">Jobs</span>
            </span>
          </div>
        </div>

        {/* Deliveries selector tabs */}
        {activeDeliveries.length > 0 ? (
          <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {activeDeliveries.map((del) => {
              const isSelected = currentDelivery?.id === del.id;
              return (
                <button
                  key={del.id}
                  onClick={() => {
                    setSelectedDeliveryId(del.id);
                    setOtpError(null);
                    setOtpDigits(['', '', '', '']);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border shrink-0 transition-all flex items-center space-x-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="font-mono">{del.trackingCode}</span>
                  <span className="text-[10px] opacity-80">({del.recipientLandmark.name.split(' ')[0]})</span>
                  {del.isCod && (
                    <span className={`text-[8.5px] px-1 py-0.2 rounded font-bold ${
                      isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}>
                      COD
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-center text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
            All assigned packages delivered! No pending courier tasks.
          </div>
        )}
      </div>

      {currentDelivery && (
        <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-5">
          {/* Active Job Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Navigating Consignment</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono flex items-center space-x-2">
                <span>{currentDelivery.trackingCode}</span>
                <span className="text-[10px] font-sans px-2 py-0.5 rounded font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {currentDelivery.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {currentDelivery.isCod && (
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-right">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Kuɗin Karɓa (COD)</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">₦{currentDelivery.itemValue.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Navigation Routing Cards */}
          <div className="space-y-2.5">
            {/* Merchant Pickup */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Wurin Karɓa (Pickup): {currentDelivery.senderLandmark.name}</span>
                </div>
                <a
                  href={`tel:${currentDelivery.senderPhone}`}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center space-x-1 font-semibold transition"
                >
                  <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Kira Shago (Call)</span>
                </a>
              </div>
              <p className="text-xs text-slate-900 dark:text-white font-semibold pl-5">{currentDelivery.senderDetail}</p>
              <p className="text-[11px] text-slate-500 pl-5">Merchant: {currentDelivery.senderName} ({currentDelivery.senderPhone})</p>
            </div>

            {/* Customer Dropoff */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase">
                  <Navigation className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Wurin Kaiwa (Dropoff): {currentDelivery.recipientLandmark.name}</span>
                </div>
                <a
                  href={`tel:${currentDelivery.recipientPhone}`}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center space-x-1 font-semibold transition"
                >
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>Kira Mai Saye (Call)</span>
                </a>
              </div>
              <p className="text-xs text-slate-900 dark:text-white font-semibold pl-5">{currentDelivery.recipientDetail}</p>
              <p className="text-[11px] text-slate-500 pl-5">Recipient: {currentDelivery.recipientName} ({currentDelivery.recipientPhone})</p>
            </div>
          </div>

          {/* Rapid Status Transit Toggles */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Sabunta Halin Isarwa (Update Transit State)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => onUpdateDeliveryStatus(currentDelivery.id, 'picked_up')}
                disabled={currentDelivery.status !== 'pending' && currentDelivery.status !== 'assigned'}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 border border-slate-200 dark:border-slate-700 text-xs font-semibold py-2 px-2.5 rounded-lg text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                1. Na Karɓi Kayan
              </button>

              <button
                type="button"
                onClick={() => onUpdateDeliveryStatus(currentDelivery.id, 'in_transit')}
                disabled={currentDelivery.status !== 'picked_up'}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 border border-slate-200 dark:border-slate-700 text-xs font-semibold py-2 px-2.5 rounded-lg text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                2. Ina Cikin Tafiya
              </button>

              <button
                type="button"
                onClick={() => onUpdateDeliveryStatus(currentDelivery.id, 'arrived')}
                disabled={currentDelivery.status !== 'in_transit'}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 border border-slate-200 dark:border-slate-700 text-xs font-semibold py-2 px-2.5 rounded-lg text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                3. Na Isa Wajen Mai Saye
              </button>
            </div>
          </div>

          {/* Secure Handshake 4-Digit OTP Pad */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Tantance Lambar Sirri (4-Digit Handshake OTP)</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Kada ka bada kayan har sai ka karɓi lambar sirri guda 4 daga mai saye kuma ka tabbatar da kuɗi.
            </p>

            <form onSubmit={handleVerifyHandshake} className="space-y-4">
              {currentDelivery.isCod && (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex items-center space-x-2.5">
                  <input
                    type="checkbox"
                    id="confirm-cash-check"
                    checked={codCashConfirmed}
                    onChange={(e) => setCodCashConfirmed(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="confirm-cash-check" className="text-xs text-slate-800 dark:text-slate-200 font-semibold cursor-pointer">
                    Na tabbatar na karɓi tsabar kuɗi <span className="font-bold underline">₦{currentDelivery.itemValue.toLocaleString()}</span> a hannun mai saye.
                  </label>
                </div>
              )}

              {/* 4-Box PIN Input */}
              <div className="flex flex-col items-center justify-center space-y-2 py-1">
                <span className="text-xs font-semibold text-slate-500">Shigar da Lambar Sirri (Enter 4-Digit OTP):</span>
                <div className="flex space-x-2.5">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      id={`otp-box-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otpDigits[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-emerald-600 rounded-xl text-center text-2xl font-mono font-bold text-slate-900 dark:text-white transition outline-none shadow-sm"
                    />
                  ))}
                </div>
              </div>

              {otpError && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs p-2.5 rounded-lg flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{otpError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-xl text-center text-xs sm:text-sm shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Tabbatar da Kammala Isarwa (Complete Delivery)</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
