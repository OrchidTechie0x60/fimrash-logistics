import React, { useState } from 'react';
import { Search, MapPin, Truck, CheckCircle2, Clock, ShieldCheck, Phone, AlertCircle, Share2 } from 'lucide-react';

export default function LiveTracking({ deliveries, activeTrackingCode }) {
  const [searchCode, setSearchCode] = useState(activeTrackingCode || (deliveries[0]?.trackingCode || ''));
  const [selectedDelivery, setSelectedDelivery] = useState(
    deliveries.find(d => d.trackingCode.toLowerCase() === searchCode.toLowerCase()) || deliveries[0] || null
  );

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

  const steps = [
    { num: 1, title: 'Dispatched', desc: 'Order received at depot' },
    { num: 2, title: 'Rider Assigned', desc: 'Courier en route to merchant' },
    { num: 3, title: 'Picked Up', desc: 'Package in courier possession' },
    { num: 4, title: 'In Transit', desc: 'Navigating Kano corridors' },
    { num: 5, title: 'Arrived', desc: 'Courier at recipient landmark' },
    { num: 6, title: 'Delivered', desc: 'OTP Handshake verified' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-xl font-bold text-white mb-2">Live Kano Waybill Tracker</h1>
        <p className="text-slate-400 text-xs sm:text-sm mb-4">
          Enter your Fimrash tracking number (e.g. FMR-KN-2849) to view real-time corridor progress and access your recipient delivery OTP.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Enter Tracking Code (e.g. FMR-KN-1042)..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 uppercase tracking-wider font-mono font-semibold"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition"
          >
            Track
          </button>
        </form>

        {/* Quick select active mock deliveries */}
        {deliveries.length > 0 && (
          <div className="mt-3 flex items-center space-x-2 overflow-x-auto text-xs py-1">
            <span className="text-slate-400 text-[11px] shrink-0">Sample Deliveries:</span>
            {deliveries.map(d => (
              <button
                key={d.id}
                onClick={() => {
                  setSearchCode(d.trackingCode);
                  setSelectedDelivery(d);
                }}
                className={`px-2.5 py-1 rounded-md font-mono shrink-0 transition ${
                  selectedDelivery?.id === d.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {d.trackingCode} ({d.recipientLandmark.name.split(' ')[0]})
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedDelivery ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Waybill Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Waybill</span>
              <div className="text-2xl font-black text-white font-mono tracking-wider flex items-center space-x-2">
                <span>{selectedDelivery.trackingCode}</span>
                <span className={`text-xs font-sans px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  selectedDelivery.status === 'delivered'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {selectedDelivery.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Recipient OTP Shield */}
            <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/30 p-3 rounded-xl flex items-center space-x-3">
              <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider block">Recipient Delivery OTP</span>
                <span className="text-xl font-black text-amber-400 font-mono tracking-widest">{selectedDelivery.otpCode}</span>
              </div>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Milestone Progress</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {steps.map((step) => {
                const isPassed = currentStep >= step.num;
                const isCurrent = currentStep === step.num;
                return (
                  <div
                    key={step.num}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      isCurrent
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                        : isPassed
                        ? 'bg-slate-950/60 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-950/30 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold mb-0.5 flex items-center justify-center space-x-1">
                      {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      <span>{step.title}</span>
                    </div>
                    <span className="text-[10px] block leading-tight text-slate-400">{step.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Corridor & Landmarks Visualizer */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800/80 pb-2">
              <span>Origin Landmark</span>
              <span className="text-emerald-400">Intra-Kano Dispatch Route</span>
              <span>Destination Landmark</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pickup */}
              <div className="border-l-2 border-emerald-500 pl-3">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pickup Location</span>
                <span className="font-bold text-white text-sm block">{selectedDelivery.senderLandmark.name}</span>
                <span className="text-xs text-slate-300 block">{selectedDelivery.senderDetail}</span>
                <span className="text-[11px] text-slate-400 block mt-1">Merchant: {selectedDelivery.senderName} ({selectedDelivery.senderPhone})</span>
              </div>

              {/* Dropoff */}
              <div className="border-l-2 border-teal-500 pl-3">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Delivery Location</span>
                <span className="font-bold text-white text-sm block">{selectedDelivery.recipientLandmark.name}</span>
                <span className="text-xs text-slate-300 block">{selectedDelivery.recipientDetail}</span>
                <span className="text-[11px] text-slate-400 block mt-1">Recipient: {selectedDelivery.recipientName} ({selectedDelivery.recipientPhone})</span>
              </div>
            </div>

            {/* Courier Detail */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  🏍️
                </div>
                <div>
                  <span className="font-bold text-white block">{selectedDelivery.assignedRider.name}</span>
                  <span className="text-slate-400 text-[11px]">Bike No: {selectedDelivery.assignedRider.bikeNumber}</span>
                </div>
              </div>

              <a
                href={`tel:${selectedDelivery.assignedRider.phone}`}
                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-semibold flex items-center space-x-1.5 transition"
              >
                <Phone className="w-3 h-3" />
                <span>Call Courier</span>
              </a>
            </div>
          </div>

          {/* Payment & COD Badge */}
          {selectedDelivery.isCod ? (
            <div className="bg-emerald-950/30 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-emerald-300 font-bold block">Cash-on-Delivery (COD)</span>
                <span className="text-slate-400">Rider will collect physical cash from recipient upon arrival.</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-400 block">₦{selectedDelivery.itemValue.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400">Total payable</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-300">Payment Status:</span>
              <span className="text-emerald-400 font-bold">Prepaid in Full (₦0 to pay at delivery)</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="font-bold text-white text-base">Waybill Not Found</h3>
          <p className="text-xs">Please verify your tracking code format (e.g. FMR-KN-2849).</p>
        </div>
      )}
    </div>
  );
}
