import React, { useState } from 'react';
import { KANO_LANDMARKS, calculateDeliveryFare } from '../data/kanoLandmarks';
import KanoRouteMap from './KanoRouteMap';
import { 
  MapPin, Navigation, Package, DollarSign, ShieldCheck, ArrowRight, 
  CheckCircle2, Copy, Sparkles, Phone, MessageSquare, Clock, Zap, Store,
  Compass, ChevronDown, ChevronUp, Home, Building2, Utensils, AlertCircle
} from 'lucide-react';

export default function BookingForm({ onDeliveryCreated }) {
  const [formData, setFormData] = useState({
    senderType: 'home', // 'home' | 'market' | 'office'
    senderName: '',
    senderPhone: '',
    senderLandmark: 'gyadi-gyadi', // Default to active residential hub
    senderDetail: '',
    recipientType: 'home',
    recipientName: '',
    recipientPhone: '',
    recipientLandmark: 'naibawa', // Default recipient
    recipientDetail: '',
    itemCategory: 'Cakes, Pastries & Bakes',
    itemDescription: '',
    isFragile: true,
    deliveryNote: '',
    paymentMode: 'pay_on_delivery', // 'pay_on_delivery' or 'prepaid'
  });

  const [showMap, setShowMap] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedSenderLandmark = KANO_LANDMARKS.find(l => l.id === formData.senderLandmark) || KANO_LANDMARKS[5];
  const selectedRecipientLandmark = KANO_LANDMARKS.find(l => l.id === formData.recipientLandmark) || KANO_LANDMARKS[8];

  const deliveryFee = calculateDeliveryFare(formData.senderLandmark, formData.recipientLandmark);

  // Inclusive Categories for Kano: Home Businesses, Markets & Personal Errands
  const CATEGORIES = [
    { id: 'Cakes, Pastries & Bakes', label: 'Cakes, Pastries & Snacks', icon: '🎂', badge: 'Upright Care' },
    { id: 'Food & Home Catering', label: 'Cooked Meals & Food', icon: '🍲', badge: 'Fresh Delivery' },
    { id: 'Fabrics & Fashion', label: 'Fabrics, Abayas & Fashion', icon: '🧵', badge: 'Boutique' },
    { id: 'Perfumes & Cosmetics', label: 'Perfumes, Oils & Cosmetics', icon: '✨', badge: 'Fragrance' },
    { id: 'Phones & Gadgets', label: 'Electronics & Phones', icon: '📱', badge: 'Secure' },
    { id: 'Documents & Certificates', label: 'Documents & Letters', icon: '📄', badge: 'Priority' },
    { id: 'Personal Items & Errands', label: 'Personal Errands & Goods', icon: '📦', badge: 'General' },
  ];

  // Popular Kano Corridors (Home Businesses & Markets)
  const POPULAR_PRESETS = [
    { label: '🎂 Gyadi-Gyadi → Naibawa (Home Baker)', from: 'gyadi-gyadi', to: 'naibawa', category: 'Cakes, Pastries & Bakes' },
    { label: '🍲 Gyadi-Gyadi → Hotoro GRA (Catering)', from: 'gyadi-gyadi', to: 'hotoro-gra', category: 'Food & Home Catering' },
    { label: '🧵 Kwari → Nassarawa GRA (Textiles)', from: 'kwari-textiles', to: 'nassarawa-gra', category: 'Fabrics & Fashion' },
    { label: '📦 Tarauni → BUK Campus (Student Errand)', from: 'tarauni-gra', to: 'buk-new-campus', category: 'Personal Items & Errands' },
    { label: '📱 Farm Centre → Zoo Road (Gadgets)', from: 'farm-centre', to: 'zoo-road', category: 'Phones & Gadgets' },
  ];

  const handleApplyPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      senderLandmark: preset.from,
      recipientLandmark: preset.to,
      itemCategory: preset.category || prev.itemCategory,
    }));
  };

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
      senderType: formData.senderType,
      senderName: formData.senderName || (formData.senderType === 'home' ? 'Fatima Bakes' : 'Al-Ihsan Textiles'),
      senderPhone: formData.senderPhone || '08031112233',
      senderLandmark: selectedSenderLandmark,
      senderDetail: formData.senderDetail || (formData.senderType === 'home' ? 'House 14, Behind Veterinary Clinic, Court Road' : 'Block B, Line 3, Shop 14'),
      recipientType: formData.recipientType,
      recipientName: formData.recipientName || 'Amina Sani',
      recipientPhone: formData.recipientPhone || '08156661246',
      recipientLandmark: selectedRecipientLandmark,
      recipientDetail: formData.recipientDetail || 'Near Central Mosque, Naibawa',
      itemCategory: formData.itemCategory,
      itemDescription: formData.itemDescription || 'Home Baked Goods / Parcel',
      isFragile: formData.isFragile,
      deliveryNote: formData.deliveryNote,
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
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Waybill Generated</h2>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase font-semibold text-slate-400 block">Consignment Code</span>
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
                <span>Recipient 4-Digit Handshake OTP</span>
              </div>
              <span className="text-[11px] bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold px-2.5 py-0.5 rounded">
                Recipient Private Pass
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm">
                Recipient shares this 4-digit code with the courier <span className="font-semibold underline">only after receiving the item</span>.
              </p>
              <div className="text-3xl font-mono font-bold text-amber-900 dark:text-amber-400 tracking-widest bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-700/50 shadow-sm text-center">
                {bookingSuccess.otpCode}
              </div>
            </div>
          </div>

          {/* Route & Fee Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-start pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Location</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {bookingSuccess.senderLandmark.name}
                </span>
                <span className="text-slate-500 block text-xs">{bookingSuccess.senderDetail}</span>
                <span className="text-slate-400 block text-[11px] mt-0.5">Sender: {bookingSuccess.senderName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Location</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {bookingSuccess.recipientLandmark.name}
                </span>
                <span className="text-slate-500 block text-xs">{bookingSuccess.recipientDetail}</span>
                <span className="text-slate-400 block text-[11px] mt-0.5">Recipient: {bookingSuccess.recipientName}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  {bookingSuccess.itemDescription} ({bookingSuccess.itemCategory})
                </span>
                <span className="text-xs text-slate-500">
                  {bookingSuccess.paymentMode === 'pay_on_delivery' ? '💵 Courier collects fee from recipient on arrival' : '✅ Fee prepaid by sender'}
                </span>
                {bookingSuccess.isFragile && (
                  <span className="inline-block mt-1 text-[11px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                    ⚠️ Fragile / Upright Box Handling Required
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Fee</span>
                <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ₦{bookingSuccess.deliveryFee.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                const text = `*FIMRASH DISPATCH DISPATCH PASS*\nWaybill: ${bookingSuccess.trackingCode}\nFrom: ${bookingSuccess.senderLandmark.name} (${bookingSuccess.senderName})\nTo: ${bookingSuccess.recipientLandmark.name} (${bookingSuccess.recipientName})\nFee: ₦${bookingSuccess.deliveryFee.toLocaleString()} (${bookingSuccess.paymentMode === 'pay_on_delivery' ? 'Pay on Delivery' : 'Prepaid'})\nRecipient OTP: ${bookingSuccess.otpCode}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-center text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share Pass on WhatsApp</span>
            </button>

            <button
              onClick={() => setBookingSuccess(null)}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 px-6 rounded-xl text-center text-xs sm:text-sm transition cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              Book Another Dispatch
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-2 sm:py-4">
      {/* Page Header */}
      <div className="text-center mb-6 sm:mb-8 space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/40">
          <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Kano Intra-State Express Dispatch: Homes, Bakers, Boutiques &amp; Markets</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Request Parcel Pickup &amp; Delivery
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Fast landmark-guided courier dispatch for home bakeries, catering, abayas, documents, fabrics, and goods across Kano metropolis.
        </p>

        {/* Quick Corridor Presets Bar */}
        <div className="pt-3">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
              Popular Runs:
            </span>
            {POPULAR_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1"
              >
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Corridor Radar Accordion */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="w-full glass-card rounded-xl p-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Kano Corridor Radar: {selectedSenderLandmark.name.split(' ')[0]} → {selectedRecipientLandmark.name.split(' ')[0]}</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400 text-xs">
            <span>{showMap ? 'Hide Radar Map' : 'View Corridor Map'}</span>
            {showMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showMap && (
          <div className="mt-3 transition-all">
            <KanoRouteMap
              pickupLandmark={selectedSenderLandmark}
              dropoffLandmark={selectedRecipientLandmark}
            />
          </div>
        )}
      </div>

      {/* Main Spacious Booking Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: PICKUP ORIGIN (Sender) */}
        <div className="glass-card rounded-2xl p-5 sm:p-7 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                1. Pickup Details (Sender / Origin)
              </h2>
            </div>

            {/* Origin Type Switcher: Home vs Market vs Office */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, senderType: 'home' })}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition ${
                  formData.senderType === 'home'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home / Residence</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, senderType: 'market' })}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition ${
                  formData.senderType === 'market'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Shop / Market</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                {formData.senderType === 'home' ? 'Sender / Home Baker / Name *' : 'Merchant / Business / Stall Name *'}
              </label>
              <input
                type="text"
                required
                placeholder={formData.senderType === 'home' ? 'e.g. Fatima Bakes / Aisha Gyadi' : 'e.g. Al-Ihsan Textiles'}
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Sender Phone Number (WhatsApp / Call) *
              </label>
              <input
                type="tel"
                required
                placeholder="08031234567"
                value={formData.senderPhone}
                onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base font-mono transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Pickup Area / Corridor Landmark *
              </label>
              <select
                value={formData.senderLandmark}
                onChange={(e) => setFormData({ ...formData, senderLandmark: e.target.value })}
                className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base font-semibold transition"
              >
                <optgroup label="Residential & Home Enterprise Hubs">
                  {KANO_LANDMARKS.filter(l => l.type === 'residential').map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Commercial Markets & Tech Plazas">
                  {KANO_LANDMARKS.filter(l => l.type !== 'residential').map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                {formData.senderType === 'home' ? 'House No. / Street / Compound Landmark *' : 'Stall / Line / Shop Number *'}
              </label>
              <input
                type="text"
                required
                placeholder={formData.senderType === 'home' ? 'e.g. House No. 14, Behind Veterinary Clinic, Court Rd' : 'e.g. Block B, Line 3, Shop 14 (Near Access Bank)'}
                value={formData.senderDetail}
                onChange={(e) => setFormData({ ...formData, senderDetail: e.target.value })}
                className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: DELIVERY DESTINATION (Recipient) */}
        <div className="glass-card rounded-2xl p-5 sm:p-7 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                2. Delivery Destination (Recipient)
              </h2>
            </div>

            {/* Destination Type Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, recipientType: 'home' })}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition ${
                  formData.recipientType === 'home'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home Address</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, recipientType: 'market' })}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition ${
                  formData.recipientType === 'market'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Shop / Office</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Recipient / Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Amina Sani / Hajiya Maryam"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Recipient Phone Number (For Handshake OTP) *
              </label>
              <input
                type="tel"
                required
                placeholder="08156661246"
                value={formData.recipientPhone}
                onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base font-mono transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Destination Area / Landmark *
              </label>
              <select
                value={formData.recipientLandmark}
                onChange={(e) => setFormData({ ...formData, recipientLandmark: e.target.value })}
                className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base font-semibold transition"
              >
                <optgroup label="Residential Areas, GRAs & Campuses">
                  {KANO_LANDMARKS.filter(l => l.type === 'residential' || l.type === 'campus').map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Markets & Commercial Plazas">
                  {KANO_LANDMARKS.filter(l => l.type !== 'residential' && l.type !== 'campus').map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                House Address / Landmark Near Destination *
              </label>
              <input
                type="text"
                required
                placeholder={formData.recipientType === 'home' ? 'e.g. House No. 8, Beside Jallaba Mosque, Naibawa' : 'e.g. Shop 4, Zoo Road Complex'}
                value={formData.recipientDetail}
                onChange={(e) => setFormData({ ...formData, recipientDetail: e.target.value })}
                className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: PARCEL DETAILS, FRAGILE CARE & PAYMENT */}
        <div className="glass-card rounded-2xl p-5 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              3. Parcel Type &amp; Special Handling
            </h2>
          </div>

          {/* Parcel Category Grid */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Select What You Are Sending
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => {
                    const isCakeOrFood = cat.id.includes('Cakes') || cat.id.includes('Food');
                    setFormData({ 
                      ...formData, 
                      itemCategory: cat.id,
                      isFragile: isCakeOrFood ? true : formData.isFragile
                    });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    formData.itemCategory === cat.id
                      ? 'bg-emerald-50 border-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {cat.badge}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block mt-1">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description & Handling Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Brief Parcel Description
              </label>
              <input
                type="text"
                placeholder="e.g. 10-inch Birthday Cake / 3 Abaya Dresses / Small Chops Box"
                value={formData.itemDescription}
                onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Special Delivery / Handling Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Please keep upright in box; call upon arrival at gate"
                value={formData.deliveryNote}
                onChange={(e) => setFormData({ ...formData, deliveryNote: e.target.value })}
                className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base transition"
              />
            </div>
          </div>

          {/* Cake & Food Upright Handling Guarantee */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-lg">🎂</span>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Fragile / Upright Box Dispatch Care
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Courier takes extra precautions to keep cakes, pastries, and food boxes level and secure.
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFragile}
                onChange={(e) => setFormData({ ...formData, isFragile: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Payment Method Selection (No vendor item fees) */}
          <div className="pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              How Will the Delivery Fee Be Settled?
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
                    Recipient Pays on Arrival (Cash)
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Courier collects ₦{deliveryFee.toLocaleString()} delivery fee from recipient upon handover.
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
                    Sender pays the ₦{deliveryFee.toLocaleString()} fee upfront; zero cash collected from recipient.
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
              <span className="text-xs font-sans font-semibold text-emerald-600 dark:text-emerald-400">Fixed Corridor Rate</span>
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
              {formData.paymentMode === 'pay_on_delivery' ? '💵 Pay on Delivery' : '✅ Prepaid by Sender'}
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
