import React, { useState } from 'react';
import KanoRouteMap from './KanoRouteMap';
import { 
  Search, MapPin, Truck, CheckCircle2, Clock, ShieldCheck, 
  Phone, AlertCircle, Share2, MessageSquare, Copy, Sparkles, Navigation 
} from 'lucide-react';

export default function LiveTracking({ deliveries, activeTrackingCode }) {
  const [searchCode, setSearchCode] = useState(activeTrackingCode || (deliveries[0]?.trackingCode || ''));
  const [selectedDelivery, setSelectedDelivery] = useState(
    deliveries.find(d => d.trackingCode.toLowerCase() === searchCode.toLowerCase()) || deliveries[0] || null
  );
  const [copiedOtp, setCopiedOtp] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const found = deliveries.find(d => d.trackingCode.trim().toLowerCase() === searchCode.trim().toLowerCase());
    setSelectedDelivery(found || null);
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'assigned': return 2;
      case 'picked_up': return 3;
      case 'in_transit': return 4;
      case 'arrived': return 5;
      case 'delivered': return 6;
      default: return 1;
    }
  };

  const currentStep = selectedDelivery ? getStatusStep(selectedDelivery.status) : 1;

  const STEPS = [
    { num: 1, title: 'Dispatched', desc: 'Order logged at depot' },
    { num: 2, title: 'Rider Assigned', desc: 'Courier en route to shop' },
    { num: 3, title: 'Picked Up', desc: 'Parcel in courier custody' },
    { num: 4, title: 'In Transit', desc: 'On Kano arterial route' },
    { num: 5, title: 'At Landmark', desc: 'Outside recipient gate' },
    { num: 6, title: 'Delivered', desc: 'Handshake complete' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Search Header Bar */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>Live Kano Waybill Radar</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time corridor telemetry, courier landmark proximity & secure recipient OTP pass.
            </p>
          </div>

          {/* Quick select active samples */}
          {deliveries.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto text-xs py-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase shrink-0">Sample:</span>
              {deliveries.map(d => (
                <button
                  key={d.id}
                  onClick={() => {
                    setSearchCode(d.trackingCode);
                    setSelectedDelivery(d);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedDelivery?.id === d.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-300 border border-white/5 hover:border-emerald-500/40'
                  }`}
                >
                  {d.trackingCode}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Enter Fimrash Tracking Code (e.g. FMR-KN-2849)..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 uppercase tracking-widest font-mono font-bold transition shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            Track Waybill
          </button>
        </form>
      </div>

      {selectedDelivery ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Spatial Route Visualizer */}
          <div className="lg:col-span-5 space-y-4">
            <KanoRouteMap
              pickupLandmark={selectedDelivery.senderLandmark}
              dropoffLandmark={selectedDelivery.recipientLandmark}
              activeRiderName={selectedDelivery.assignedRider.name}
            />

            {/* Courier Profile Card */}
            <div className="glass-card rounded-2xl p-4 border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
                  🏍️
                </div>
                <div>
                  <span className="font-black text-white text-sm block">{selectedDelivery.assignedRider.name}</span>
                  <span className="text-slate-400 text-[11px]">Plate: {selectedDelivery.assignedRider.bikeNumber} • Kano Central</span>
                </div>
              </div>

              <a
                href={`tel:${selectedDelivery.assignedRider.phone}`}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Courier</span>
              </a>
            </div>
          </div>

          {/* Right Column: Tracking Progress & OTP Pass */}
          <div className="lg:col-span-7 space-y-5">
            {/* Status Hero Card */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-6">
              {/* Waybill Title & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Consignment ID</span>
                  <div className="text-2xl font-black text-white font-mono flex items-center space-x-2">
                    <span>{selectedDelivery.trackingCode}</span>
                    <span className={`text-[10px] font-sans px-2.5 py-0.5 rounded-full font-black uppercase ${
                      selectedDelivery.status === 'delivered'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {selectedDelivery.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Recipient OTP Shield */}
                <div className="bg-gradient-to-r from-amber-500/15 to-yellow-500/5 border border-amber-500/30 px-4 py-2.5 rounded-2xl flex items-center space-x-3">
                  <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-amber-300 uppercase font-black tracking-wider block">Recipient Delivery OTP</span>
                    <span className="text-2xl font-black text-amber-400 font-mono tracking-widest">{selectedDelivery.otpCode}</span>
                  </div>
                </div>
              </div>

              {/* Progress Milestones (Visual Horizontal Stepper) */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Milestone Progression</span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {STEPS.map((step) => {
                    const isPassed = currentStep >= step.num;
                    const isCurrent = currentStep === step.num;
                    return (
                      <div
                        key={step.num}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/15 scale-102'
                            : isPassed
                            ? 'bg-slate-950/60 border-emerald-500/40 text-emerald-400'
                            : 'bg-slate-950/30 border-white/5 text-slate-600'
                        }`}
                      >
                        <div className="text-[11px] font-bold mb-0.5 flex items-center justify-center space-x-1">
                          {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          <span>{step.title}</span>
                        </div>
                        <span className="text-[9px] block leading-tight text-slate-400">{step.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Waybill Corridor Coordinates */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="border-l-2 border-emerald-500 pl-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Origin</span>
                  <span className="font-bold text-white block text-sm">{selectedDelivery.senderLandmark.name}</span>
                  <span className="text-slate-400 text-[11px] block">{selectedDelivery.senderDetail}</span>
                  <span className="text-slate-400 text-[11px] mt-1 block">Merchant: {selectedDelivery.senderName} ({selectedDelivery.senderPhone})</span>
                </div>

                <div className="border-l-2 border-cyan-500 pl-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination</span>
                  <span className="font-bold text-white block text-sm">{selectedDelivery.recipientLandmark.name}</span>
                  <span className="text-slate-400 text-[11px] block">{selectedDelivery.recipientDetail}</span>
                  <span className="text-slate-400 text-[11px] mt-1 block">Recipient: {selectedDelivery.recipientName} ({selectedDelivery.recipientPhone})</span>
                </div>
              </div>

              {/* COD Balance Banner */}
              {selectedDelivery.isCod ? (
                <div className="bg-emerald-950/40 border border-emerald-500/25 p-4 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-emerald-300 font-bold block">Cash-on-Delivery (COD) Applicable</span>
                    <span className="text-slate-400 text-[11px]">Recipient pays physical cash upon handover.</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400 font-mono">₦{selectedDelivery.itemValue.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 block">Total Due</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 border border-white/5 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                  <span className="text-slate-300">Payment:</span>
                  <span className="text-emerald-400 font-bold">Prepaid via Transfer (₦0 Cash to Courier)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-10 text-center text-slate-400 space-y-2 border border-white/10">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="font-bold text-white text-base">Consignment Code Not Found</h3>
          <p className="text-xs">Please verify your Kano waybill reference number.</p>
        </div>
      )}
    </div>
  );
}
