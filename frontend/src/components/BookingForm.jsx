import React, { useState } from 'react';
import { KANO_LANDMARKS, calculateDeliveryFare } from '../data/kanoLandmarks';
import KanoRouteMap from './KanoRouteMap';
import { 
  MapPin, Navigation, Package, DollarSign, ShieldCheck, ArrowRight, 
  CheckCircle2, Copy, Sparkles, Phone, MessageSquare, Clock, Zap, Store,
  Compass, ChevronDown, ChevronUp
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
    itemCategory: 'Fabrics & Textiles',
    itemDescription: '',
    paymentMode: 'pay_on_delivery', // 'pay_on_delivery' or 'prepaid'
  });

  const [showMap, setShowMap] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedSenderLandmark = KANO_LANDMARKS.find(l => l.id === formData.senderLandmark) || KANO_LANDMARKS[0];
  const selectedRecipientLandmark = KANO_LANDMARKS.find(l => l.id === formData.recipientLandmark) || KANO_LANDMARKS[6];

  const deliveryFee = calculateDeliveryFare(formData.senderLandmark, formData.recipientLandmark);

  // Standard Categories for Kano Goods & Parcels
  const CATEGORIES = [
    { id: 'Fabrics & Textiles', label: 'Fabrics / Shadda / Lace', icon: '🧵' },
    { id: 'Phones & Gadgets', label: 'Electronics & Phones', icon: '📱' },
    { id: 'Cosmetics & Beauty', label: 'Cosmetics & Perfumes', icon: '✨' },
    { id: 'Documents & Letters', label: 'Documents & Papers', icon: '📄' },
    { id: 'Footwear & Bags', label: 'Shoes, Bags & Leather', icon: '👞' },
    { id: 'Food & Provisions', label: 'Groceries & Provisions', icon: '📦' },
  ];

  // Popular Kano Corridors for 1-click select
  const POPULAR_PRESETS = [
    { label: 'Kwari → Nassarawa GRA', from: 'kwari-textiles', to: 'nassarawa-gra' },
    { label: 'Farm Centre → BUK Campus', from: 'farm-centre', to: 'buk-new-campus' },
    { label: 'Singer Market → Zoo Road', from: 'singer-market', to: 'zoo-road' },
    { label: 'Kwari → Hotoro GRA', from: 'kwari-textiles', to: 'hotoro-gra' },
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
      itemDescription: formData.itemDescription || 'Standard Parcel Package',
      deliveryFee,
      paymentMode: formData.paymentMode,
      feeCollected: false,
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

  // SUCCESS WAYBILL PASS
  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-6 sm:py-10">
        <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                  Dispatch Confirmed
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Waybill Logged</h2>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase font-semibold text-slate-400 block">Waybill Number</span>
              <div className="text-xl font-mono font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>{bookingSuccess.trackingCode}</span>
                <button
                  onClick={() => copyToClipboard(bookingSuccess.trackingCode)}
                  className="text-slate-400 hover:text-emerald-600 transition"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copiedCode && <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block">Copied!</span>}
            </div>
          </div>

          {/* 4-Digit Recipient Handshake OTP */}
          <div className="my-6 p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Recipient Delivery OTP Handshake</span>
              </div>
              <span className="text-[11px] bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold px-2.5 py-0.5 rounded">
                Recipient Private Code
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm">
                Provide this 4-digit code to the courier <span className="font-semibold underline">only after receiving your parcel</span> to confirm successful delivery.
              </p>
              <div className="text-3xl font-mono font-bold text-amber-900 dark:text-amber-400 tracking-widest bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-700/50 shadow-sm text-center">
                {bookingSuccess.otpCode}
              </div>
            </div>
          </div>

          {/* Delivery & Routing Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm mb-6 bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="border-l-2 border-emerald-600 dark:border-emerald-500 pl-3.5 space-y-1">
              <span className="text-slate-400 text-xs uppercase font-bold block">1. Pickup</span>
              <span className="font-bold text-slate-900 dark:text-white block text-sm">{bookingSuccess.senderLandmark.name}</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs block">{bookingSuccess.senderDetail}</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs block pt-1">Sender: {bookingSuccess.senderName} ({bookingSuccess.senderPhone})</span>
            </div>

            <div className="border-l-2 border-slate-400 dark:border-slate-600 pl-3.5 space-y-1">
              <span className="text-slate-400 text-xs uppercase font-bold block">2. Delivery</span>
              <span className="font-bold text-slate-900 dark:text-white block text-sm">{bookingSuccess.recipientLandmark.name}</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs block">{bookingSuccess.recipientDetail}</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs block pt-1">Recipient: {bookingSuccess.recipientName} ({bookingSuccess.recipientPhone})</span>
            </div>
          </div>

          {/* Single Delivery Fee Card */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm mb-6">
            <div>
              <span className="text-slate-800 dark:text-slate-200 font-bold block">
                Delivery Fee: ₦{bookingSuccess.deliveryFee.toLocaleString()}
              </span>
              <span className="text-slate-500 text-xs">
                {bookingSuccess.paymentMode === 'pay_on_delivery' 
                  ? 'To be paid in cash by recipient upon parcel arrival.' 
                  : 'Prepaid by sender.'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {bookingSuccess.paymentMode === 'pay_on_delivery' ? 'Pay on Delivery' : 'Prepaid'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                const text = `Sannu ${bookingSuccess.recipientName}, your parcel from ${bookingSuccess.senderName} is dispatched via Fimrash Logistics Kano!\n\n📦 Waybill: ${bookingSuccess.trackingCode}\n🔑 Delivery Confirmation OTP: ${bookingSuccess.otpCode}\n💵 Delivery Fee: ₦${bookingSuccess.deliveryFee.toLocaleString()} (${bookingSuccess.paymentMode === 'pay_on_delivery' ? 'Pay on arrival' : 'Prepaid'})\n\n⚠️ IMPORTANT: Give this OTP code to the rider only after receiving your parcel.`;
                window.open(`https://wa.me/234${bookingSuccess.recipientPhone.replace(/^0/, '')}?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-center text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share Waybill & OTP via WhatsApp</span>
            </button>

            <button
              onClick={() => setBookingSuccess(null)}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3.5 px-5 rounded-xl text-center text-sm transition cursor-pointer"
            >
              Book Another Parcel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DISPATCH REQUEST FORM (Spacious, Average Standard Sizing)
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title & Quick Presets */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-2">
          <Zap className="w-3.5 h-3.5" />
          <span>Kano Metropolitan Intra-State Courier Service</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Request Parcel Pickup & Delivery
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Fast landmark-guided courier dispatch for parcels, fabrics, documents, and goods across Kano metropolis.
        </p>

        {/* Quick Corridor Selection Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 mt-4 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase shrink-0">Quick Corridors:</span>
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
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shrink-0 transition shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Corridor Accordion / Toggle */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/50">
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
        >
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Kano Corridor Radar: {selectedSenderLandmark.name.split(' ')[0]} → {selectedRecipientLandmark.name.split(' ')[0]}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <span>{showMap ? 'Hide Radar' : 'View Corridor Map'}</span>
            {showMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showMap && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <KanoRouteMap
              pickupLandmark={selectedSenderLandmark}
              dropoffLandmark={selectedRecipientLandmark}
              onSelectLandmark={(landmarkId) => {
                setFormData(prev => ({ ...prev, recipientLandmark: landmarkId }));
              }}
            />
          </div>
        )}
      </div>

      {/* Primary Dispatch Request Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* SECTION 1: PICKUP LOCATION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm sm:text-base">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>1. Pickup Details (Sender)</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Step 1 of 3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Sender / Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Al-Ihsan Textiles"
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Sender Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="08031234567"
                value={formData.senderPhone}
                onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Pickup Market / Landmark *
              </label>
              <select
                value={formData.senderLandmark}
                onChange={(e) => setFormData({ ...formData, senderLandmark: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm transition"
              >
                {KANO_LANDMARKS.map((landmark) => (
                  <option key={landmark.id} value={landmark.id}>
                    {landmark.name} ({landmark.hausaName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Stall / Line / Exact Gate Detail *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Block B, Line 3, Shop 14 (Near Access Bank)"
                value={formData.senderDetail}
                onChange={(e) => setFormData({ ...formData, senderDetail: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: DELIVERY DESTINATION */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm sm:text-base">
              <Navigation className="w-4 h-4 text-slate-500" />
              <span>2. Delivery Destination (Recipient)</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Step 2 of 3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Recipient / Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hajiya Maryam S. Danbatta"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Recipient Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="08156661246"
                value={formData.recipientPhone}
                onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Destination Area / Landmark *
              </label>
              <select
                value={formData.recipientLandmark}
                onChange={(e) => setFormData({ ...formData, recipientLandmark: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm transition"
              >
                {KANO_LANDMARKS.map((landmark) => (
                  <option key={landmark.id} value={landmark.id}>
                    {landmark.name} ({landmark.hausaName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                House / Gate / Landmark Address *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. House No. 12, Coronation Hall Road"
                value={formData.recipientDetail}
                onChange={(e) => setFormData({ ...formData, recipientDetail: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: PARCEL DETAILS & PAYMENT OPTION */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm sm:text-base">
              <Package className="w-4 h-4 text-slate-500" />
              <span>3. Parcel & Delivery Payment</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Step 3 of 3</span>
          </div>

          {/* Parcel Category Chips */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Package Type:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = formData.itemCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, itemCategory: cat.id })}
                    className={`p-3 rounded-xl text-left border transition-all flex items-center space-x-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-600 dark:text-emerald-300 font-bold shadow-2xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl shrink-0">{cat.icon}</span>
                    <span className="text-xs sm:text-sm font-medium leading-tight">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Package Description Note */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Package Description / Special Handling Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 3 bundles of Swiss lace in black polythene bag"
              value={formData.itemDescription}
              onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm transition"
            />
          </div>

          {/* Delivery Fee Payment Option: Who Pays? */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              Who Pays the Delivery Fee?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label 
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${
                  formData.paymentMode === 'pay_on_delivery'
                    ? 'bg-emerald-50/70 border-emerald-500 dark:bg-emerald-950/30 dark:border-emerald-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  value="pay_on_delivery"
                  checked={formData.paymentMode === 'pay_on_delivery'}
                  onChange={() => setFormData({ ...formData, paymentMode: 'pay_on_delivery' })}
                  className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                />
                <div>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">
                    Recipient Pays on Arrival
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Courier collects ₦{deliveryFee.toLocaleString()} from recipient when handing over parcel.
                  </span>
                </div>
              </label>

              <label 
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${
                  formData.paymentMode === 'prepaid'
                    ? 'bg-emerald-50/70 border-emerald-500 dark:bg-emerald-950/30 dark:border-emerald-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  value="prepaid"
                  checked={formData.paymentMode === 'prepaid'}
                  onChange={() => setFormData({ ...formData, paymentMode: 'prepaid' })}
                  className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                />
                <div>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">
                    Sender Prepaids Fee
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Sender pays the ₦{deliveryFee.toLocaleString()} fee upfront; zero cash to collect from customer.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Pricing Summary Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
              Flat Intra-Kano Delivery Rate
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono flex items-baseline space-x-2 mt-0.5">
              <span>₦{deliveryFee.toLocaleString()}</span>
              <span className="text-xs font-sans font-semibold text-emerald-600 dark:text-emerald-400">Fixed Rate</span>
            </div>
            <span className="text-xs text-slate-500 block mt-0.5">
              {selectedSenderLandmark.name.split(' ')[0]} → {selectedRecipientLandmark.name.split(' ')[0]}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
              Payment Method
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white block mt-1">
              {formData.paymentMode === 'pay_on_delivery' ? 'Pay on Delivery (Cash)' : 'Prepaid by Sender'}
            </span>
          </div>
        </div>

        {/* Big Submit Button */}
        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl text-center text-sm sm:text-base shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>Dispatch Fimrash Express Courier</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
