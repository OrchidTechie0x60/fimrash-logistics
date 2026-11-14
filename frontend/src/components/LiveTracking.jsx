import React, { useState } from 'react';
import KanoRouteMap from './KanoRouteMap';
import { 
  Search, MapPin, Truck, CheckCircle2, Clock, ShieldCheck, 
  Phone, AlertCircle, Share2, MessageSquare, Copy, Sparkles, Navigation, Package
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
    { num: 1, title: 'Dispatched', desc: 'Order logged' },
    { num: 2, title: 'Assigned', desc: 'Courier en route' },
    { num: 3, title: 'Picked Up', desc: 'Parcel in transit' },
    { num: 4, title: 'On Corridor', desc: 'Arterial route' },
    { num: 5, title: 'At Landmark', desc: 'Arrived at gate' },
    { num: 6, title: 'Delivered', desc: 'Handover complete' },
  ];

  const handleCopyOtp = () => {
    if (!selectedDelivery) return;
    navigator.clipboard.writeText(selectedDelivery.otpCode);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Search Header Bar - Standard Comfortable Sizing */}
      <div className="glass-card rounded-2xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <span>Live Kano Waybill Radar</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time courier telemetry, landmark proximity &amp; 4-digit recipient handover OTP.
            </p>
          </div>

          {/* Quick select active samples */}
          {deliveries.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto text-xs py-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">Sample:</span>
              {deliveries.map(d => (
                <button
                  key={d.id}
                  onClick={() => {
                    setSearchCode(d.trackingCode);
                    setSelectedDelivery(d);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold shrink-0 transition-all cursor-pointer ${
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

        {/* Search Input - Standard 48px height */}
        <form onSubmit={handleSearch} className="flex gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Enter Fimrash Tracking Code (e.g. FMR-KN-2849)..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full rounded-xl pl-11 pr-4 py-3 sm:py-3.5 text-sm sm:text-base uppercase tracking-wider font-mono font-semibold transition"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base transition cursor-pointer shadow-sm"
          >
            Track
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
            <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-200 dark:border-emerald-800/40">
                  🏍️
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-sm">{selectedDelivery.assignedRider.name}</span>
                  <span className="text-slate-500 text-xs">Plate: {selectedDelivery.assignedRider.bikeNumber} • Kano Central</span>
                </div>
              </div>

              <a
                href={`tel:${selectedDelivery.assignedRider.phone}`}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl font-semibold flex items-center space-x-1.5 transition text-xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Call Courier</span>
              </a>
            </div>
          </div>

          {/* Right Column: Tracking Progress & Handover Pass */}
          <div className="lg:col-span-7 space-y-5">
            <div className="glass-card rounded-2xl p-5 sm:p-7 space-y-5">
              {/* Waybill Title & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Consignment ID</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono flex items-center space-x-3 mt-0.5">
                    <span>{selectedDelivery.trackingCode}</span>
                    <span className={`text-xs font-sans px-2.5 py-0.5 rounded-lg font-bold uppercase ${
                      selectedDelivery.status === 'delivered'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                        : 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                    }`}>
                      {selectedDelivery.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Parcel: <strong className="text-slate-900 dark:text-white font-semibold">{selectedDelivery.itemDescription}</strong> ({selectedDelivery.itemCategory})
                  </p>
                </div>

                {/* Recipient OTP Card */}
                <div 
                  onClick={handleCopyOtp}
                  className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-3.5 rounded-2xl flex items-center space-x-3 cursor-pointer hover:border-amber-400 transition"
                >
                  <ShieldCheck className="w-6 h-6 text-amber-700 dark:text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-amber-800 dark:text-amber-300 uppercase font-bold tracking-wider block">Recipient Delivery OTP</span>
                    <span className="text-2xl font-bold text-amber-900 dark:text-amber-300 font-mono tracking-widest">{selectedDelivery.otpCode}</span>
                  </div>
                  <button className="text-amber-700 dark:text-amber-400 text-xs pl-1">
                    {copiedOtp ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Milestone Progression</span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {STEPS.map((step) => {
                    const isPassed = currentStep >= step.num;
                    const isCurrent = currentStep === step.num;
                    return (
                      <div
                        key={step.num}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-600 dark:text-emerald-300 font-bold'
                            : isPassed
                            ? 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300'
                            : 'bg-slate-50/40 border-slate-100 text-slate-400 dark:bg-slate-950/30 dark:border-slate-900 dark:text-slate-600'
                        }`}
                      >
                        <div className="text-xs font-bold mb-0.5 flex items-center justify-center space-x-1">
                          {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                          <span>{step.title}</span>
                        </div>
                        <span className="text-[10px] block leading-tight opacity-75">{step.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Origin & Destination Landmarks */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="border-l-2 border-emerald-600 dark:border-emerald-500 pl-3.5 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Pickup Landmark</span>
                  <span className="font-bold text-slate-900 dark:text-white block">{selectedDelivery.senderLandmark.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">{selectedDelivery.senderDetail}</span>
                  <span className="text-slate-400 text-[11px] mt-1 block">Sender: {selectedDelivery.senderName}</span>
                </div>

                <div className="border-l-2 border-slate-400 dark:border-slate-600 pl-3.5 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Delivery Landmark</span>
                  <span className="font-bold text-slate-900 dark:text-white block">{selectedDelivery.recipientLandmark.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">{selectedDelivery.recipientDetail}</span>
                  <span className="text-slate-400 text-[11px] mt-1 block">Recipient: {selectedDelivery.recipientName}</span>
                </div>
              </div>

              {/* Delivery Fee Notice Card (No vendor charges) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="text-slate-800 dark:text-slate-200 font-bold block text-sm">
                    {selectedDelivery.paymentMode === 'pay_on_delivery' 
                      ? 'Kuɗin Jigila (Pay Delivery Fee on Arrival)' 
                      : 'Kuɗin Jigila (Prepaid by Sender)'}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {selectedDelivery.paymentMode === 'pay_on_delivery'
                      ? 'Mai karɓa zai biya tsabar kuɗin aikawa ga mai babur lokacin karɓa.'
                      : 'An riga an biya kuɗin jigila; babu kuɗin da mai karɓa zai biya.'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono">
                    ₦{selectedDelivery.deliveryFee.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {selectedDelivery.paymentMode === 'pay_on_delivery' ? 'Pay on Handover' : 'Zero Cash Due'}
                  </span>
                </div>
              </div>
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
