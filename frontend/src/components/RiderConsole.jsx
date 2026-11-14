import React, { useState } from 'react';
import { Truck, MapPin, Phone, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function RiderConsole({ deliveries, onUpdateDeliveryStatus, onVerifyOtpAndDeliver }) {
  const activeDeliveries = deliveries.filter(d => d.status !== 'delivered');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(activeDeliveries[0]?.id || null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [codCashConfirmed, setCodCashConfirmed] = useState(false);
  const [otpError, setOtpError] = useState(null);

  const currentDelivery = deliveries.find(d => d.id === selectedDeliveryId) || activeDeliveries[0];

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!currentDelivery) return;

    if (currentDelivery.isCod && !codCashConfirmed) {
      setOtpError('You must confirm collecting cash from recipient before clearing delivery!');
      return;
    }

    if (enteredOtp.trim() !== currentDelivery.otpCode) {
      setOtpError('Invalid 4-digit OTP! Ask recipient to check their Fimrash tracking SMS/WhatsApp.');
      return;
    }

    // Success: Handshake completed!
    setOtpError(null);
    onVerifyOtpAndDeliver(currentDelivery.id, currentDelivery.isCod ? currentDelivery.itemValue : 0);
    setEnteredOtp('');
    setCodCashConfirmed(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Rider Header & Shift Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl">
              🏍️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-extrabold text-white">Musa Garba</h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">Rider #04</span>
              </div>
              <p className="text-xs text-slate-400">Bike: KN-942-TRN • Kano Central Fleet</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pending Tasks</span>
            <span className="text-xl font-black text-amber-400">{activeDeliveries.length} Packages</span>
          </div>
        </div>

        {/* Deliveries selector tabs */}
        {activeDeliveries.length > 0 ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {activeDeliveries.map((del) => (
              <button
                key={del.id}
                onClick={() => {
                  setSelectedDeliveryId(del.id);
                  setOtpError(null);
                  setEnteredOtp('');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border shrink-0 transition flex items-center space-x-2 ${
                  currentDelivery?.id === del.id
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <span>{del.trackingCode}</span>
                <span className="text-[10px] opacity-80">({del.recipientLandmark.name.split(' ')[0]})</span>
                {del.isCod && <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1 rounded font-bold">COD</span>}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-center text-xs text-emerald-400 font-semibold">
            All assigned packages delivered! No pending deliveries for this shift.
          </div>
        )}
      </div>

      {currentDelivery && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          {/* Active Job Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Currently Navigating</span>
              <div className="text-xl font-black text-white font-mono flex items-center space-x-2">
                <span>{currentDelivery.trackingCode}</span>
                <span className="text-xs font-sans px-2.5 py-0.5 rounded-full font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {currentDelivery.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {currentDelivery.isCod && (
              <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-right">
                <span className="text-[10px] text-amber-300 font-bold uppercase block">Cash to Collect (COD)</span>
                <span className="text-lg font-black text-amber-400">₦{currentDelivery.itemValue.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Location Routing Cards */}
          <div className="space-y-4">
            {/* Step 1: Merchant Pickup */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase">
                  <MapPin className="w-4 h-4" />
                  <span>Pickup: {currentDelivery.senderLandmark.name}</span>
                </div>
                <a
                  href={`tel:${currentDelivery.senderPhone}`}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg flex items-center space-x-1"
                >
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>Call Merchant</span>
                </a>
              </div>
              <p className="text-xs text-white font-medium pl-6">{currentDelivery.senderDetail}</p>
              <p className="text-[11px] text-slate-400 pl-6">Contact: {currentDelivery.senderName} ({currentDelivery.senderPhone})</p>
            </div>

            {/* Step 2: Customer Destination */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase">
                  <MapPin className="w-4 h-4" />
                  <span>Dropoff: {currentDelivery.recipientLandmark.name}</span>
                </div>
                <a
                  href={`tel:${currentDelivery.recipientPhone}`}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg flex items-center space-x-1"
                >
                  <Phone className="w-3 h-3 text-teal-400" />
                  <span>Call Customer</span>
                </a>
              </div>
              <p className="text-xs text-white font-medium pl-6">{currentDelivery.recipientDetail}</p>
              <p className="text-[11px] text-slate-400 pl-6">Contact: {currentDelivery.recipientName} ({currentDelivery.recipientPhone})</p>
            </div>
          </div>

          {/* Fast Status Transit Controls */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">Quick Status Updates</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => onUpdateDeliveryStatus(currentDelivery.id, 'picked_up')}
                disabled={currentDelivery.status !== 'pending' && currentDelivery.status !== 'assigned'}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold py-2 px-3 rounded-lg text-slate-200 transition"
              >
                1. Picked Up from Shop
              </button>

              <button
                onClick={() => onUpdateDeliveryStatus(currentDelivery.id, 'in_transit')}
                disabled={currentDelivery.status !== 'picked_up'}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold py-2 px-3 rounded-lg text-slate-200 transition"
              >
                2. In Transit on Road
              </button>

              <button
                onClick={() => onUpdateDeliveryStatus(currentDelivery.id, 'arrived')}
                disabled={currentDelivery.status !== 'in_transit'}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold py-2 px-3 rounded-lg text-slate-200 transition"
              >
                3. Arrived at Gate
              </button>
            </div>
          </div>

          {/* Secure Handshake Verification Form */}
          <div className="bg-gradient-to-tr from-slate-950 to-slate-900 p-5 rounded-xl border border-emerald-500/40 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400 text-sm font-extrabold">
              <ShieldCheck className="w-5 h-5" />
              <span>Final Recipient OTP Handshake Verification</span>
            </div>

            <p className="text-xs text-slate-300">
              Only release the package after entering the recipient's secret 4-digit code and confirming full payment.
            </p>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              {currentDelivery.isCod && (
                <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-lg flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="confirm-cash"
                    checked={codCashConfirmed}
                    onChange={(e) => setCodCashConfirmed(e.target.checked)}
                    className="w-5 h-5 text-emerald-500 rounded bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="confirm-cash" className="text-xs text-amber-200 font-semibold cursor-pointer">
                    I confirm receiving <span className="text-white font-bold underline">₦{currentDelivery.itemValue.toLocaleString()}</span> cash in hand from the customer.
                  </label>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Ask Recipient for 4-Digit Handshake OTP:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    placeholder="e.g. 7419"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="w-36 bg-slate-950 border-2 border-emerald-500 rounded-xl px-4 py-2.5 text-center text-xl font-mono font-black text-emerald-400 tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <span>Complete Delivery</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {otpError && (
                <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs p-2.5 rounded-lg flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{otpError}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
