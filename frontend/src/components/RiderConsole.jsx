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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Driver Identity Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/25">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-2xl">
                🏍️
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-black text-white">Musa Garba</h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Rider #04
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Bike: KN-942-TRN • Kano Central Corridors</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Active Shift</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
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
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-all flex items-center space-x-2 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-transparent shadow-lg shadow-emerald-500/20 font-black'
                      : 'bg-slate-950/70 text-slate-300 border-white/10 hover:border-emerald-500/30'
                  }`}
                >
                  <span className="font-mono">{del.trackingCode}</span>
                  <span className="text-[10px] opacity-80">({del.recipientLandmark.name.split(' ')[0]})</span>
                  {del.isCod && (
                    <span className="text-[9px] bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded-md font-black">
                      COD
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-center text-xs text-emerald-300 font-bold">
            🎉 All assigned packages delivered! No pending courier tasks.
          </div>
        )}
      </div>

      {currentDelivery && (
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-6">
          {/* Active Job Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Navigating Consignment</span>
              <div className="text-2xl font-black text-white font-mono flex items-center space-x-2">
                <span>{currentDelivery.trackingCode}</span>
                <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-full font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {currentDelivery.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {currentDelivery.isCod && (
              <div className="bg-amber-500/15 border border-amber-500/30 px-4 py-2 rounded-2xl text-right">
                <span className="text-[10px] text-amber-300 font-black uppercase tracking-wider block">Kuɗin Karɓa (COD)</span>
                <span className="text-2xl font-black text-amber-400 font-mono">₦{currentDelivery.itemValue.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Navigation Routing Cards */}
          <div className="space-y-3">
            {/* Merchant Pickup */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-black uppercase">
                  <MapPin className="w-4 h-4" />
                  <span>Wurin Karɓa (Pickup): {currentDelivery.senderLandmark.name}</span>
                </div>
                <a
                  href={`tel:${currentDelivery.senderPhone}`}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center space-x-1.5 font-bold transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Kira Shago (Call)</span>
                </a>
              </div>
              <p className="text-xs text-white font-semibold pl-6">{currentDelivery.senderDetail}</p>
              <p className="text-[11px] text-slate-400 pl-6">Merchant: {currentDelivery.senderName} ({currentDelivery.senderPhone})</p>
            </div>

            {/* Customer Dropoff */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-black uppercase">
                  <Navigation className="w-4 h-4" />
                  <span>Wurin Kaiwa (Dropoff): {currentDelivery.recipientLandmark.name}</span>
                </div>
                <a
                  href={`tel:${currentDelivery.recipientPhone}`}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs px-3 py-1.5 rounded-xl border border-cyan-500/20 flex items-center space-x-1.5 font-bold transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Kira Mai Saye (Call)</span>
                </a>
              </div>
              <p className="text-xs text-white font-semibold pl-6">{currentDelivery.recipientDetail}</p>
              <p className="text-[11px] text-slate-400 pl-6">Recipient: {currentDelivery.recipientName} ({currentDelivery.recipientPhone})</p>
            </div>
          </div>

          {/* Rapid Status Transit Toggles */}
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Sabunta Halin Isarwa (Update Transit State)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdateDeliveryStatus(currentDelivery.id, 'picked_up')}
                disabled={currentDelivery.status !== 'pending' && currentDelivery.status !== 'assigned'}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-white/5 text-xs font-bold py-2.5 px-3 rounded-xl text-slate-200 transition cursor-pointer"
              >
                1. Na Karɓi Kayan (Picked Up)
              </button>

              <button
                type="button"
                onClick={() => onUpdateDeliveryStatus(currentDelivery.id, 'in_transit')}
                disabled={currentDelivery.status !== 'picked_up'}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-white/5 text-xs font-bold py-2.5 px-3 rounded-xl text-slate-200 transition cursor-pointer"
              >
                2. Ina Cikin Tafiya (In Transit)
              </button>

              <button
                type="button"
                onClick={() => onUpdateDeliveryStatus(currentDelivery.id, 'arrived')}
                disabled={currentDelivery.status !== 'in_transit'}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-white/5 text-xs font-bold py-2.5 px-3 rounded-xl text-slate-200 transition cursor-pointer"
              >
                3. Na Isa Kofar Gida (Arrived)
              </button>
            </div>
          </div>

          {/* Secure Handshake 4-Digit OTP Pad */}
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950/30 border border-emerald-500/40 space-y-5 shadow-inner">
            <div className="flex items-center space-x-2.5 text-emerald-400 text-sm font-black uppercase tracking-wider">
              <ShieldCheck className="w-5 h-5" />
              <span>Tantance Lambar Sirri (4-Digit Handshake OTP)</span>
            </div>

            <p className="text-xs text-slate-300">
              Kada ka bada kayan har sai ka karɓi lambar sirri guda 4 daga mai saye kuma ka tabbatar da kuɗi.
            </p>

            <form onSubmit={handleVerifyHandshake} className="space-y-5">
              {currentDelivery.isCod && (
                <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-2xl flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="confirm-cash-check"
                    checked={codCashConfirmed}
                    onChange={(e) => setCodCashConfirmed(e.target.checked)}
                    className="w-5 h-5 text-emerald-500 rounded bg-slate-950 border-white/20 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="confirm-cash-check" className="text-xs text-amber-200 font-bold cursor-pointer">
                    Na tabbatar na karɓi tsabar kuɗi <span className="text-white underline font-black">₦{currentDelivery.itemValue.toLocaleString()}</span> a hannun mai saye.
                  </label>
                </div>
              )}

              {/* 4-Box Tactile PIN Input */}
              <div className="flex flex-col items-center justify-center space-y-3 py-2">
                <span className="text-xs font-bold text-slate-400">Shigar da Lambar Sirri (Enter 4-Digit OTP):</span>
                <div className="flex space-x-3">
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
                      className="w-14 h-16 bg-slate-950 border-2 border-emerald-500/40 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 rounded-2xl text-center text-3xl font-mono font-black text-emerald-300 transition-all shadow-inner outline-none"
                    />
                  ))}
                </div>
              </div>

              {otpError && (
                <div className="bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{otpError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-4 px-6 rounded-2xl text-center text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Tabbatar da Kammala Isarwa (Complete Delivery)</span>
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
