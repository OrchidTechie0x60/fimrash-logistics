import React, { useState } from 'react';
import { KANO_LANDMARKS, calculateDeliveryFare } from '../data/kanoLandmarks';
import KanoRouteMap from './KanoRouteMap';
import { 
  MapPin, Navigation, Package, DollarSign, ShieldCheck, ArrowRight, 
  CheckCircle2, Copy, Sparkles, Phone, MessageSquare, Clock, Zap, Store
} from 'lucide-react';

export default function BookingForm({ onDeliveryCreated }) {
  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderLandmark: 'kwari-textiles',
    senderDetail: '',
    recipientName: '',
    recipientPhone: '',
    recipientLandmark: 'nassarawa-gra',
    recipientDetail: '',
    itemCategory: 'Fabrics & Fashion',
    itemDescription: '',
    isCod: true,
    itemValue: '18500',
  });

  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedSenderLandmark = KANO_LANDMARKS.find(l => l.id === formData.senderLandmark) || KANO_LANDMARKS[0];
  const selectedRecipientLandmark = KANO_LANDMARKS.find(l => l.id === formData.recipientLandmark) || KANO_LANDMARKS[6];

  const deliveryFee = calculateDeliveryFare(formData.senderLandmark, formData.recipientLandmark);
  const itemValueNum = parseFloat(formData.itemValue) || 0;
  const netVendorPayout = formData.isCod ? Math.max(0, itemValueNum - deliveryFee) : 0;

  // Categories with modern badges
  const CATEGORIES = [
    { id: 'Fabrics & Fashion', label: 'Shadda & Fabrics', icon: '🧵' },
    { id: 'Phones & Gadgets', label: 'Gadgets & Tech', icon: '📱' },
    { id: 'Cosmetics & Perfumes', label: 'Perfumes & Beauty', icon: '✨' },
    { id: 'Documents', label: 'Contracts / Bills', icon: '📄' },
    { id: 'Footwear & Leather', label: 'Shoes & Bags', icon: '👞' },
    { id: 'Provisions & Food', label: 'FMCG / Food', icon: '📦' },
  ];

  // Quick Kano market presets
  const POPULAR_PRESETS = [
    { label: 'Kwari → Nassarawa', from: 'kwari-textiles', to: 'nassarawa-gra' },
    { label: 'Farm Centre → BUK', from: 'farm-centre', to: 'buk-new-campus' },
    { label: 'Singer → Zoo Road', from: 'singer-market', to: 'zoo-road' },
    { label: 'Kwari → Hotoro', from: 'kwari-textiles', to: 'hotoro-gra' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `FMR-KN-${randomSuffix}`;
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newDelivery = {
      id: 'del_' + Date.now(),
      trackingCode,
      otpCode,
      status: 'pending',
      senderName: formData.senderName || 'Al-Ihsan Textiles',
      senderPhone: formData.senderPhone || '08031112233',
      senderLandmark: selectedSenderLandmark,
      senderDetail: formData.senderDetail || 'Block B, Line 3, Shop 14',
      recipientName: formData.recipientName || 'Hajiya Maryam',
      recipientPhone: formData.recipientPhone || '08156661246',
      recipientLandmark: selectedRecipientLandmark,
      recipientDetail: formData.recipientDetail || 'Coronation Hall Road',
      itemCategory: formData.itemCategory,
      itemDescription: formData.itemDescription || '3 bundles Super-Magnum Shadda lace',
      isCod: formData.isCod,
      itemValue: itemValueNum,
      deliveryFee,
      netVendorPayout,
      assignedRider: {
        name: 'Musa Garba (Rider #04)',
        phone: '08156661246',
        bikeNumber: 'KN-942-TRN'
      },
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onDeliveryCreated(newDelivery);
    setBookingSuccess(newDelivery);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // SUCCESS PASS MODAL (Aviation / Logistics Grade Consignment Ticket)
  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Ticket Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                  Dispatch Confirmed
                </span>
                <h2 className="text-xl font-black text-white">Consignment Active</h2>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Waybill</span>
              <div className="text-xl font-mono font-black text-white flex items-center space-x-1.5">
                <span>{bookingSuccess.trackingCode}</span>
                <button
                  onClick={() => copyToClipboard(bookingSuccess.trackingCode)}
                  className="text-slate-400 hover:text-emerald-400 transition"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {copiedCode && <span className="text-[10px] text-emerald-400 block">Copied!</span>}
            </div>
          </div>

          {/* High Security Recipient Handshake Card */}
          <div className="my-6 p-5 rounded-2xl bg-gradient-to-tr from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/30 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Anti-Theft Handshake OTP</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                Recipient Private Pass
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300 max-w-xs">
                  Give this code to the courier <span className="text-white font-bold underline">only after</span> inspecting your package.
                </p>
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-black text-amber-400 tracking-widest bg-slate-950/80 px-4 py-2 rounded-xl border border-amber-500/40 shadow-inner">
                {bookingSuccess.otpCode}
              </div>
            </div>
          </div>

          {/* Route & Courier Detail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
            <div className="border-l-2 border-emerald-500 pl-3">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Pickup Merchant</span>
              <span className="font-bold text-white block text-sm">{bookingSuccess.senderLandmark.name}</span>
              <span className="text-slate-400 text-[11px] block">{bookingSuccess.senderDetail}</span>
              <span className="text-slate-400 text-[11px] mt-1 block font-medium">Merchant: {bookingSuccess.senderName}</span>
            </div>

            <div className="border-l-2 border-cyan-500 pl-3">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Destination</span>
              <span className="font-bold text-white block text-sm">{bookingSuccess.recipientLandmark.name}</span>
              <span className="text-slate-400 text-[11px] block">{bookingSuccess.recipientDetail}</span>
              <span className="text-slate-400 text-[11px] mt-1 block font-medium">Recipient: {bookingSuccess.recipientName}</span>
            </div>
          </div>

          {/* COD Settlement Summary */}
          {bookingSuccess.isCod && (
            <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/25 flex items-center justify-between text-xs mb-6">
              <div>
                <span className="text-emerald-300 font-bold block">Cash to Collect on Delivery (COD):</span>
                <span className="text-slate-400 text-[11px]">Courier will hold cash and remit net balance within 2 hours.</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-emerald-400 font-mono">₦{bookingSuccess.itemValue.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block">Fee: ₦{bookingSuccess.deliveryFee.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* WhatsApp Direct Notification & Reset */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                const text = `Sannu ${bookingSuccess.recipientName}, your order from ${bookingSuccess.senderName} is dispatched via Fimrash Logistics Kano!\n\n📦 Waybill: ${bookingSuccess.trackingCode}\n🔑 Secret Handshake OTP: ${bookingSuccess.otpCode}\n💵 COD to Pay: ₦${bookingSuccess.itemValue.toLocaleString()}\n\n⚠️ IMPORTANT: Only give this OTP to the courier after you inspect your parcel!`;
                window.open(`https://wa.me/234${bookingSuccess.recipientPhone.replace(/^0/, '')}?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3.5 px-4 rounded-xl text-center text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Customer OTP via WhatsApp</span>
            </button>

            <button
              onClick={() => setBookingSuccess(null)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3.5 px-5 rounded-xl text-center text-xs sm:text-sm transition cursor-pointer"
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN BOOKING INTERFACE
  return (
    <div className="space-y-6">
      {/* Hero Intro with High-Tech Energy */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Kano Intra-State Express Dispatch Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dispatch a Courier in Kano
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Commercial landmark navigation, 4-digit recipient anti-theft handshake, and automated Cash-on-Delivery (COD) reconciliation.
          </p>
        </div>

        {/* Quick Corridor Presets */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 uppercase shrink-0">Popular:</span>
          {POPULAR_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  senderLandmark: p.from,
                  recipientLandmark: p.to
                });
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white shrink-0 transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left = Map Radar, Right = Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Spatial Route Visualizer */}
        <div className="lg:col-span-5 space-y-4">
          <KanoRouteMap
            pickupLandmark={selectedSenderLandmark}
            dropoffLandmark={selectedRecipientLandmark}
            onSelectLandmark={(landmarkId) => {
              setFormData(prev => ({ ...prev, recipientLandmark: landmarkId }));
            }}
          />

          {/* Market Insight Capsule */}
          <div className="glass-card rounded-2xl p-4 border border-white/10 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Store className="w-4 h-4 text-emerald-400" />
                <span>Selected Pickup Hub</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                {selectedSenderLandmark.category}
              </span>
            </div>
            <p className="text-slate-300 font-semibold">{selectedSenderLandmark.name} ({selectedSenderLandmark.hausaName})</p>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
              <span className="text-slate-500 font-medium">Nav Anchors:</span> {selectedSenderLandmark.popularAnchors.slice(0, 2).join(' • ')}
            </div>
          </div>
        </div>

        {/* Right Column: Dispatch Request Card */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-5">
            {/* Step 1: Origin */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
                  <MapPin className="w-4 h-4" />
                  <span>1. Pickup Landmark & Merchant</span>
                </div>
                <span className="text-[10px] text-slate-400">Step 1 of 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Merchant / Shop Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al-Ihsan Textiles"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Merchant Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0803..."
                    value={formData.senderPhone}
                    onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Pickup Market Landmark *</label>
                  <select
                    value={formData.senderLandmark}
                    onChange={(e) => setFormData({ ...formData, senderLandmark: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                  >
                    {KANO_LANDMARKS.map((landmark) => (
                      <option key={landmark.id} value={landmark.id}>
                        {landmark.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Shop / Stall / Exact Gate *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Block B, Line 3, Shop 14"
                    value={formData.senderDetail}
                    onChange={(e) => setFormData({ ...formData, senderDetail: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Destination */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-black uppercase tracking-wider">
                  <Navigation className="w-4 h-4" />
                  <span>2. Delivery Destination & Recipient</span>
                </div>
                <span className="text-[10px] text-slate-400">Step 2 of 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Customer / Recipient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hajiya Maryam"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Customer Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0815..."
                    value={formData.recipientPhone}
                    onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Destination Area / Landmark *</label>
                  <select
                    value={formData.recipientLandmark}
                    onChange={(e) => setFormData({ ...formData, recipientLandmark: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                  >
                    {KANO_LANDMARKS.map((landmark) => (
                      <option key={landmark.id} value={landmark.id}>
                        {landmark.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">House / Gate / Landmark Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Near Coronation Hall Gate, Nassarawa GRA"
                    value={formData.recipientDetail}
                    onChange={(e) => setFormData({ ...formData, recipientDetail: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Package Category & COD */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                  <Package className="w-4 h-4" />
                  <span>3. Package & Cash-on-Delivery (COD)</span>
                </div>
                <span className="text-[10px] text-slate-400">Step 3 of 3</span>
              </div>

              {/* Visual Category Pills */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = formData.itemCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, itemCategory: cat.id })}
                      className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-white font-bold shadow-md shadow-amber-500/10 scale-102'
                          : 'bg-slate-950/50 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <span className="text-base block mb-0.5">{cat.icon}</span>
                      <span className="text-[10px] block leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* COD Toggle Box */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="cod-switch"
                    checked={formData.isCod}
                    onChange={(e) => setFormData({ ...formData, isCod: e.target.checked })}
                    className="w-5 h-5 text-emerald-500 rounded bg-slate-950 border-white/20 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="cod-switch" className="text-xs cursor-pointer">
                    <span className="font-bold text-white block">Cash on Delivery (COD) Required</span>
                    <span className="text-slate-400 text-[11px]">Courier collects item cost before releasing parcel</span>
                  </label>
                </div>

                {formData.isCod && (
                  <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                    <span className="text-xs text-slate-400 font-bold">₦</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={formData.itemValue}
                      onChange={(e) => setFormData({ ...formData, itemValue: e.target.value })}
                      className="w-24 bg-transparent text-sm font-mono font-black text-emerald-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Live Pricing Breakdown Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Flat Kano Corridor Delivery Rate
                </span>
                <div className="text-2xl font-black text-white font-mono flex items-baseline space-x-2">
                  <span>₦{deliveryFee.toLocaleString()}</span>
                  <span className="text-[11px] font-sans font-semibold text-emerald-400">Guaranteed Flat</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {selectedSenderLandmark.name.split(' ')[0]} → {selectedRecipientLandmark.name.split(' ')[0]}
                </span>
              </div>

              {formData.isCod && (
                <div className="text-right border-l border-white/10 pl-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Net Vendor Remittance
                  </span>
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    ₦{netVendorPayout.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500">Auto-remitted post delivery</span>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black py-4 px-6 rounded-2xl text-center text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Dispatch Express Fimrash Courier</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
