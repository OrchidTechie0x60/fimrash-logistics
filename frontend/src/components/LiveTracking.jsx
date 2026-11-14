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
    { num: 2, title: 'Assigned', desc: 'Courier en route to shop' },
    { num: 3, title: 'Picked Up', desc: 'Parcel in courier custody' },
    { num: 4, title: 'In Transit', desc: 'On Kano arterial route' },
    { num: 5, title: 'At Landmark', desc: 'Outside recipient gate' },
    { num: 6, title: 'Delivered', desc: 'Handshake complete' },
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Search Header Bar */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <span>Live Kano Waybill Radar</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Corridor telemetry, courier landmark proximity & secure recipient OTP pass.
            </p>
          </div>

          {/* Quick select active samples */}
          {deliveries.length > 0 && (
            <div className="flex items-center space-x-1.5 overflow-x-auto text-xs py-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Sample:</span>
              {deliveries.map(d => (
                <button
                  key={d.id}
                  onClick={() => {
                    setSearchCode(d.trackingCode);
                    setSelectedDelivery(d);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedDelivery?.id === d.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {d.trackingCode}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Enter Fimrash Tracking Code (e.g. FMR-KN-2849)..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm uppercase tracking-wider font-mono font-semibold transition"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-sm"
          >
            Track
          </button>
        </form>
      </div>

      {selectedDelivery ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Spatial Route Visualizer */}
          <div className="lg:col-span-5 space-y-4">
            <KanoRouteMap
              pickupLandmark={selectedDelivery.senderLandmark}
              dropoffLandmark={selectedDelivery.recipientLandmark}
              activeRiderName={selectedDelivery.assignedRider.name}
            />

            {/* Courier Profile Card */}
            <div className="glass-card rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-200 dark:border-emerald-800/40">
                  🏍️
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs block">{selectedDelivery.assignedRider.name}</span>
                  <span className="text-slate-500 text-[10px]">Plate: {selectedDelivery.assignedRider.bikeNumber} • Kano Central</span>
                </div>
              </div>

              <a
                href={`tel:${selectedDelivery.assignedRider.phone}`}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1 transition text-[11px]"
              >
                <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Call</span>
              </a>
            </div>
          </div>

          {/* Right Column: Tracking Progress & OTP Pass */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-5">
              {/* Waybill Title & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Consignment ID</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-mono flex items-center space-x-2">
                    <span>{selectedDelivery.trackingCode}</span>
                    <span className={`text-[10px] font-sans px-2 py-0.5 rounded font-bold uppercase ${
                      selectedDelivery.status === 'delivered'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                        : 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                    }`}>
                      {selectedDelivery.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Recipient OTP Card (Calm Gold) */}
                <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 px-3.5 py-2 rounded-xl flex items-center space-x-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-amber-800 dark:text-amber-300 uppercase font-bold tracking-wider block">Recipient Delivery OTP</span>
                    <span className="text-xl font-bold text-amber-900 dark:text-amber-400 font-mono tracking-widest">{selectedDelivery.otpCode}</span>
                  </div>
                </div>
              </div>

              {/* Progress Milestones (Calm Stepper) */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Milestone Progression</span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
                  {STEPS.map((step) => {
                    const isPassed = currentStep >= step.num;
                    const isCurrent = currentStep === step.num;
                    return (
                      <div
                        key={step.num}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          isCurrent
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-600 dark:text-emerald-300 font-bold'
                            : isPassed
                            ? 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300'
                            : 'bg-slate-50/40 border-slate-100 text-slate-400 dark:bg-slate-950/30 dark:border-slate-900 dark:text-slate-600'
                        }`}
                      >
                        <div className="text-[10px] font-bold mb-0.5 flex items-center justify-center space-x-1">
                          {isPassed && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />}
                          <span>{step.title}</span>
                        </div>
                        <span className="text-[8.5px] block leading-tight opacity-75">{step.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Waybill Corridor Coordinates */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="border-l-2 border-emerald-600 dark:border-emerald-500 pl-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Origin</span>
                  <span className="font-bold text-slate-900 dark:text-white block text-xs">{selectedDelivery.senderLandmark.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">{selectedDelivery.senderDetail}</span>
                  <span className="text-slate-400 text-[10px] mt-1 block">Merchant: {selectedDelivery.senderName}</span>
                </div>

                <div className="border-l-2 border-slate-400 dark:border-slate-600 pl-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination</span>
                  <span className="font-bold text-slate-900 dark:text-white block text-xs">{selectedDelivery.recipientLandmark.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">{selectedDelivery.recipientDetail}</span>
                  <span className="text-slate-400 text-[10px] mt-1 block">Recipient: {selectedDelivery.recipientName}</span>
                </div>
              </div>

              {/* COD Balance Banner */}
              {selectedDelivery.isCod ? (
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-800 dark:text-slate-200 font-bold block">Cash-on-Delivery (COD) Applicable</span>
                    <span className="text-slate-500 text-[10px]">Recipient pays physical cash upon handover.</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">₦{selectedDelivery.itemValue.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400 block">Total Due</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300">Payment:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Prepaid via Transfer (₦0 Cash to Courier)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 text-center text-slate-500 space-y-2">
          <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Consignment Code Not Found</h3>
          <p className="text-xs">Please verify your Kano waybill reference number.</p>
        </div>
      )}
    </div>
  );
}
