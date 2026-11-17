import React, { useState } from 'react';
import { KANO_LANDMARKS, calculateDeliveryFare, calculateRouteMetrics } from '../data/kanoLandmarks';
import KanoRouteMap from './KanoRouteMap';
import { 
  MapPin, Navigation, Package, ShieldCheck, ArrowRight, 
  CheckCircle2, Copy, Phone, MessageSquare, Clock, Zap, Store,
  Compass, ChevronDown, ChevronUp, Home, Building2, AlertCircle,
  Calculator, Search, Truck, ExternalLink, Shield, Sparkles, RefreshCw,
  Printer, QrCode, Banknote
} from 'lucide-react';

export default function BookingForm({ onDeliveryCreated, deliveries = [], onNavigateToTracking }) {
  // Top Hero Utility Tab (GIGL-Style: Ship / Track / Fare Calculator)
  const [heroTab, setHeroTab] = useState('ship'); // 'ship' | 'track' | 'quote'

  // Booking Form State
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
    isCodActive: false, // Optional Merchant Cash-on-Delivery
    codAmount: '',
  });

  // Radar Map Target Selector: 'pickup' or 'dropoff'
  const [mapTarget, setMapTarget] = useState('dropoff');

  // Fare Calculator Dedicated State
  const [calcState, setCalcState] = useState({
    pickup: 'gyadi-gyadi',
    dropoff: 'naibawa',
    category: 'Cakes, Pastries & Bakes',
  });

  // Hero Quick Track Search State
  const [quickTrackQuery, setQuickTrackQuery] = useState(deliveries[0]?.trackingCode || 'FMR-KN-1092');
  const [trackedShipment, setTrackedShipment] = useState(deliveries[0] || null);
  const [trackSearchError, setTrackSearchError] = useState(false);

  const [showMap, setShowMap] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSenderLandmark = KANO_LANDMARKS.find(l => l.id === formData.senderLandmark) || KANO_LANDMARKS[5];
  const selectedRecipientLandmark = KANO_LANDMARKS.find(l => l.id === formData.recipientLandmark) || KANO_LANDMARKS[8];

  const deliveryFee = calculateDeliveryFare(formData.senderLandmark, formData.recipientLandmark);
  const routeMetrics = calculateRouteMetrics(formData.senderLandmark, formData.recipientLandmark);

  // Dedicated Calculator Metrics
  const calcFare = calculateDeliveryFare(calcState.pickup, calcState.dropoff);
  const calcMetrics = calculateRouteMetrics(calcState.pickup, calcState.dropoff);

  // Categories for Kano: Home Businesses, Markets & Personal Errands
  const CATEGORIES = [
    { id: 'Cakes, Pastries & Bakes', label: 'Cakes, Pastries & Bakes', icon: '🎂', badge: 'Upright Care' },
    { id: 'Food & Home Catering', label: 'Cooked Meals & Catering', icon: '🍲', badge: 'Fresh Courier' },
    { id: 'Fabrics & Fashion', label: 'Fabrics, Abayas & Fashion', icon: '🧵', badge: 'Boutique' },
    { id: 'Perfumes & Cosmetics', label: 'Perfumes, Oils & Beauty', icon: '✨', badge: 'Fragrance' },
    { id: 'Phones & Gadgets', label: 'Electronics & Phones', icon: '📱', badge: 'Anti-Theft' },
    { id: 'Documents & Certificates', label: 'Certificates & Envelopes', icon: '📄', badge: 'Priority' },
    { id: 'Personal Items & Errands', label: 'Personal Errands & Parcels', icon: '📦', badge: 'Standard' },
  ];

  // Popular Kano Corridors (Home Businesses & Markets)
  const POPULAR_PRESETS = [
    { label: '🎂 Gyadi-Gyadi → Naibawa (Home Baker)', from: 'gyadi-gyadi', to: 'naibawa', category: 'Cakes, Pastries & Bakes' },
    { label: '🍲 Gyadi-Gyadi → Hotoro GRA (Catering)', from: 'gyadi-gyadi', to: 'hotoro-gra', category: 'Food & Home Catering' },
    { label: '🧵 Kwari → Nassarawa GRA (Textiles)', from: 'kwari-textiles', to: 'nassarawa-gra', category: 'Fabrics & Fashion' },
    { label: '📦 Tarauni → BUK Campus (Errand)', from: 'tarauni-gra', to: 'buk-new-campus', category: 'Personal Items & Errands' },
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

  // Interactive Map Click Handler
  const handleMapLandmarkSelect = (landmarkId) => {
    if (mapTarget === 'pickup') {
      setFormData(prev => ({ ...prev, senderLandmark: landmarkId }));
    } else {
      setFormData(prev => ({ ...prev, recipientLandmark: landmarkId }));
    }
  };

  // Quick Tracker Search
  const handleQuickTrackSearch = (e) => {
    e?.preventDefault();
    const query = quickTrackQuery.trim().toLowerCase();
    const found = deliveries.find(d => 
      d.trackingCode?.toLowerCase() === query || 
      d.recipientPhone?.includes(query) ||
      d.senderPhone?.includes(query)
    );
    if (found) {
      setTrackedShipment(found);
      setTrackSearchError(false);
    } else {
      setTrackSearchError(true);
    }
  };

  // Transfer Calculator Details into Booking Form
  const handleTransferQuoteToBooking = () => {
    setFormData(prev => ({
      ...prev,
      senderLandmark: calcState.pickup,
      recipientLandmark: calcState.dropoff,
      itemCategory: calcState.category,
      isFragile: calcState.category.includes('Cakes') || calcState.category.includes('Food')
    }));
    setHeroTab('ship');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `FMR-KN-${randomSuffix}`;
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const codVal = formData.isCodActive ? Math.max(0, parseFloat(formData.codAmount || 0)) : 0;

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
      codAmount: codVal,
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

    // Await server sync to ensure canonical ID & OTP are unified
    const confirmed = await onDeliveryCreated(newDelivery);
    setIsSubmitting(false);
    setBookingSuccess(confirmed || newDelivery);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrintWaybill = () => {
    window.print();
  };

  // SUCCESS WAYBILL PASS (Thermal Receipt & QR Code Handshake)
  if (bookingSuccess) {
    const isCod = Number(bookingSuccess.codAmount || 0) > 0;
    const itemCost = Number(bookingSuccess.codAmount || 0);
    const fee = Number(bookingSuccess.deliveryFee || 0);
    const totalToCollect = bookingSuccess.paymentMode === 'pay_on_delivery' ? (itemCost + fee) : itemCost;

    return (
      <div className="max-w-2xl mx-auto py-6 sm:py-10 print:py-0 print:m-0 print:max-w-full">
        <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 print:shadow-none print:border-none print:p-2">
          {/* Top Brand Banner for Print */}
          <div className="text-center pb-4 mb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-600 uppercase">
              FIMRASH LOGISTICS SERVICES • KANO METROPOLIS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-0.5">
              Consignment Dispatch Pass
            </h1>
            <p className="text-[11px] text-slate-500">
              Kano Intra-State Same-Day Express Network • Dispatch Desk: 0815 666 1246
            </p>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 print:hidden">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                  Waybill Logged
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Confirmed Dispatch</h2>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase font-semibold text-slate-400 block">Waybill Number</span>
              <div className="text-xl font-mono font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>{bookingSuccess.trackingCode}</span>
                <button
                  onClick={() => copyToClipboard(bookingSuccess.trackingCode)}
                  className="text-slate-400 hover:text-emerald-600 transition print:hidden"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copiedCode && <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block print:hidden">Copied!</span>}
            </div>
          </div>

          {/* 4-Digit Recipient Handshake OTP & Scannable QR Code */}
          <div className="my-6 p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Recipient 4-Digit Handshake OTP</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm">
                Recipient presents this 4-digit secret code to the courier <span className="font-semibold underline">only after inspecting and receiving the parcel</span>.
              </p>
              <div className="text-3xl font-mono font-bold text-amber-900 dark:text-amber-400 tracking-widest bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-700/50 shadow-sm text-center inline-block mt-2">
                {bookingSuccess.otpCode}
              </div>
            </div>

            {/* Scannable Optical Handshake Pass (SVG QR Code) */}
            <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <svg width="90" height="90" viewBox="0 0 100 100" className="text-slate-900 dark:text-white fill-current">
                {/* Position Marker TL */}
                <rect x="5" y="5" width="28" height="28" fill="currentColor" rx="2" />
                <rect x="9" y="9" width="20" height="20" fill="var(--bg-card, #fff)" rx="1" />
                <rect x="13" y="13" width="12" height="12" fill="currentColor" rx="1" />
                {/* Position Marker TR */}
                <rect x="67" y="5" width="28" height="28" fill="currentColor" rx="2" />
                <rect x="71" y="9" width="20" height="20" fill="var(--bg-card, #fff)" rx="1" />
                <rect x="75" y="13" width="12" height="12" fill="currentColor" rx="1" />
                {/* Position Marker BL */}
                <rect x="5" y="67" width="28" height="28" fill="currentColor" rx="2" />
                <rect x="9" y="71" width="20" height="20" fill="var(--bg-card, #fff)" rx="1" />
                <rect x="13" y="75" width="12" height="12" fill="currentColor" rx="1" />
                {/* Optical Data Grid Matrix */}
                <rect x="38" y="10" width="6" height="6" fill="currentColor" />
                <rect x="50" y="10" width="6" height="6" fill="currentColor" />
                <rect x="42" y="22" width="6" height="6" fill="currentColor" />
                <rect x="54" y="22" width="6" height="6" fill="currentColor" />
                <rect x="10" y="42" width="6" height="6" fill="currentColor" />
                <rect x="22" y="42" width="6" height="6" fill="currentColor" />
                <rect x="34" y="42" width="6" height="6" fill="currentColor" />
                <rect x="46" y="42" width="8" height="8" fill="#059669" />
                <rect x="58" y="42" width="6" height="6" fill="currentColor" />
                <rect x="70" y="42" width="6" height="6" fill="currentColor" />
                <rect x="82" y="42" width="6" height="6" fill="currentColor" />
                <rect x="40" y="58" width="6" height="6" fill="currentColor" />
                <rect x="52" y="58" width="6" height="6" fill="currentColor" />
                <rect x="40" y="70" width="6" height="6" fill="currentColor" />
                <rect x="52" y="70" width="6" height="6" fill="currentColor" />
                <rect x="70" y="70" width="6" height="6" fill="currentColor" />
                <rect x="82" y="70" width="6" height="6" fill="currentColor" />
                <rect x="76" y="82" width="6" height="6" fill="currentColor" />
              </svg>
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase mt-1">
                Scan Handshake Pass
              </span>
            </div>
          </div>

          {/* Route & Fee Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-start pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Location</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {bookingSuccess.senderLandmark?.name || 'Kano Origin'}
                </span>
                <span className="text-slate-500 block text-xs">{bookingSuccess.senderDetail}</span>
                <span className="text-slate-400 block text-[11px] mt-0.5">Sender: {bookingSuccess.senderName} ({bookingSuccess.senderPhone})</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Location</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {bookingSuccess.recipientLandmark?.name || 'Kano Destination'}
                </span>
                <span className="text-slate-500 block text-xs">{bookingSuccess.recipientDetail}</span>
                <span className="text-slate-400 block text-[11px] mt-0.5">Recipient: {bookingSuccess.recipientName} ({bookingSuccess.recipientPhone})</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  {bookingSuccess.itemDescription} ({bookingSuccess.itemCategory})
                </span>
                <span className="text-xs text-slate-500">
                  {bookingSuccess.paymentMode === 'pay_on_delivery' ? '💵 Courier collects delivery fee from recipient on arrival' : '✅ Delivery fee prepaid by sender'}
                </span>
                {bookingSuccess.isFragile && (
                  <span className="inline-block mt-1 text-[11px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                    ⚠️ Fragile / Upright Box Handling Required
                  </span>
                )}
              </div>

              {/* Financial Summary */}
              <div className="text-right space-y-0.5">
                {isCod && (
                  <div className="text-xs text-slate-500">
                    Item CoD: <strong className="text-slate-800 dark:text-slate-200 font-mono">₦{itemCost.toLocaleString()}</strong>
                  </div>
                )}
                <div className="text-xs text-slate-500">
                  Delivery Fee: <strong className="text-slate-800 dark:text-slate-200 font-mono">₦{fee.toLocaleString()}</strong>
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 pt-0.5">
                  Total Cash on Arrival: ₦{totalToCollect.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 print:hidden">
            <button
              onClick={handlePrintWaybill}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-3.5 px-5 rounded-xl text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer border border-slate-700 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Waybill Pass / Save PDF</span>
            </button>

            <button
              onClick={() => {
                const text = `*FIMRASH LOGISTICS DISPATCH PASS*\nWaybill: ${bookingSuccess.trackingCode}\nFrom: ${bookingSuccess.senderLandmark?.name} (${bookingSuccess.senderName})\nTo: ${bookingSuccess.recipientLandmark?.name} (${bookingSuccess.recipientName})\nTotal Due: ₦${totalToCollect.toLocaleString()} (${bookingSuccess.paymentMode === 'pay_on_delivery' ? 'Pay on Delivery' : 'Prepaid Fee'}${isCod ? ' + CoD Item' : ''})\nRecipient Handshake OTP: ${bookingSuccess.otpCode}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-center text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share Pass on WhatsApp</span>
            </button>

            <button
              onClick={() => setBookingSuccess(null)}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 px-5 rounded-xl text-center text-xs sm:text-sm transition cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              Book Another Dispatch
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2 sm:py-4">
      {/* =========================================================================
          GIGL-INSPIRED HERO UTILITY COMMAND HUB
          Floating multi-tab action center: [ Ship Now | Track Waybill | Rate Calculator ]
         ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900/90 dark:via-slate-900/40 dark:to-slate-900/90 shadow-xl shadow-black/5 dark:shadow-2xl dark:shadow-black/40 p-5 sm:p-8">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none" />

        {/* Corporate Headline & Value Header */}
        <div className="relative z-10 max-w-3xl mb-6 sm:mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="tracking-wide uppercase text-[11px] font-bold">Kano Intra-State Express Dispatch Network</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Fast, Classic &amp; Reliable <br className="hidden sm:block" />
            <span className="text-emerald-600 dark:text-emerald-400">Intra-State Logistics</span> Across Kano.
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            On-demand arterial dispatch across all 12 commercial and residential corridors. From home bakeries in Gyadi-Gyadi to wholesale merchants in Kantin Kwari &amp; Singer.
          </p>
        </div>

        {/* GIGL 3-Tab Floating Action Switcher */}
        <div className="relative z-10 flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 max-w-xl shadow-inner mb-6">
          <button
            type="button"
            onClick={() => setHeroTab('ship')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              heroTab === 'ship'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Ship Package</span>
          </button>

          <button
            type="button"
            onClick={() => setHeroTab('track')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              heroTab === 'track'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Track Waybill</span>
          </button>

          <button
            type="button"
            onClick={() => setHeroTab('quote')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              heroTab === 'quote'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Fare Calculator</span>
          </button>
        </div>

        {/* -----------------------------------------------------------------------
            TAB 2 CONTENT: QUICK WAYBILL TRACKER (GIGL Embedded Radar)
           ----------------------------------------------------------------------- */}
        {heroTab === 'track' && (
          <div className="relative z-10 glass-card rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Waybill Tracking Radar</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your Fimrash Waybill code or sender/recipient phone number.
                </p>
              </div>

              {/* Sample Quick Selector */}
              {deliveries.length > 0 && (
                <div className="flex items-center space-x-1.5 overflow-x-auto text-xs py-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">Sample:</span>
                  {deliveries.slice(0, 3).map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setQuickTrackQuery(d.trackingCode);
                        setTrackedShipment(d);
                        setTrackSearchError(false);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white transition cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      {d.trackingCode}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleQuickTrackSearch} className="flex gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. FMR-KN-1092 or 08156661246..."
                  value={quickTrackQuery}
                  onChange={(e) => setQuickTrackQuery(e.target.value)}
                  className="w-full rounded-xl pl-11 pr-4 py-3 text-sm sm:text-base font-mono uppercase font-semibold transition"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 sm:px-6 py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center space-x-2 shadow-sm"
              >
                <span>Track</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {trackSearchError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-400 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>No active waybill found matching "{quickTrackQuery}". Please verify the tracking code.</span>
              </div>
            )}

            {/* Live Visual Milestone Stepper (GIGL-Style 5 Stages) */}
            {trackedShipment && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-400">Waybill</span>
                    <span className="text-lg font-mono font-bold text-slate-900 dark:text-white ml-2">
                      {trackedShipment.trackingCode}
                    </span>
                    <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {trackedShipment.itemCategory}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                      {trackedShipment.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* 5-Step Progress Bar */}
                {(() => {
                  const stepMap = { pending: 1, assigned: 2, picked_up: 3, in_transit: 4, arrived: 4, delivered: 5 };
                  const current = stepMap[trackedShipment.status] || 1;
                  const stages = [
                    { title: 'Order Logged', desc: 'Registered' },
                    { title: 'Courier Assigned', desc: 'Musa Garba' },
                    { title: 'Picked Up', desc: 'Package In Hand' },
                    { title: 'In Transit', desc: 'On Corridor' },
                    { title: 'Delivered', desc: 'OTP Confirmed' },
                  ];

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                      {stages.map((st, idx) => {
                        const stepNum = idx + 1;
                        const isDone = stepNum <= current;
                        const isCurrent = stepNum === current;
                        return (
                          <div 
                            key={idx} 
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              isCurrent
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                : isDone
                                ? 'bg-slate-100 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                                : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-center space-x-1.5 mb-1">
                              <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {isDone ? '✓' : stepNum}
                              </span>
                              <span className="text-[11px] font-bold tracking-tight">{st.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate">{st.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Courier Details Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {trackedShipment.assignedRider?.name || 'Assigned Courier'}
                      </span>
                      <span className="text-slate-500">
                        Bike: {trackedShipment.assignedRider?.bikeNumber || 'KN-942-TRN'} • Route: {trackedShipment.senderLandmark?.name?.split(' ')[0]} → {trackedShipment.recipientLandmark?.name?.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {onNavigateToTracking && (
                      <button
                        type="button"
                        onClick={() => onNavigateToTracking(trackedShipment.trackingCode)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Full Radar Telemetry</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 3 CONTENT: INSTANT FARE CALCULATOR (GIGL Quote Tool)
           ----------------------------------------------------------------------- */}
        {heroTab === 'quote' && (
          <div className="relative z-10 glass-card rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Instant Kano Courier Rate Estimator</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Calculate flat corridor prices, transit distance in kilometers, and estimated delivery times before booking.
              </p>
            </div>

            {/* Origin & Destination Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  1. Pickup Corridor (Origin)
                </label>
                <select
                  value={calcState.pickup}
                  onChange={(e) => setCalcState({ ...calcState, pickup: e.target.value })}
                  className="w-full rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition"
                >
                  <optgroup label="Residential & Home Enterprise">
                    {KANO_LANDMARKS.filter(l => l.type === 'residential').map((l) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.hausaName})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Markets & Commercial Plazas">
                    {KANO_LANDMARKS.filter(l => l.type !== 'residential').map((l) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.hausaName})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  2. Destination Corridor (Drop-off)
                </label>
                <select
                  value={calcState.dropoff}
                  onChange={(e) => setCalcState({ ...calcState, dropoff: e.target.value })}
                  className="w-full rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition"
                >
                  <optgroup label="Residential, GRAs & Campuses">
                    {KANO_LANDMARKS.filter(l => l.type === 'residential' || l.type === 'campus').map((l) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.hausaName})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Markets & Commercial Hubs">
                    {KANO_LANDMARKS.filter(l => l.type !== 'residential' && l.type !== 'campus').map((l) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.hausaName})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  3. Parcel Category
                </label>
                <select
                  value={calcState.category}
                  onChange={(e) => setCalcState({ ...calcState, category: e.target.value })}
                  className="w-full rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calculation Result Display */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Corridor</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate mt-1">
                  {calcMetrics.corridor}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Distance</span>
                <span className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white block mt-0.5">
                  ~{calcMetrics.distanceKm} km
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Time</span>
                <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  ~{calcMetrics.estMinutes} mins
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Flat Rate</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 block">
                  ₦{calcFare.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Direct Book CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500">
                Guaranteed rate with zero surge fees. Includes 4-digit anti-theft OTP security.
              </span>
              <button
                type="button"
                onClick={handleTransferQuoteToBooking}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
              >
                <span>Proceed to Book This Route</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 1 CONTENT: DIRECT DISPATCH BOOKING FORM
           ----------------------------------------------------------------------- */}
        {heroTab === 'ship' && (
          <div className="relative z-10 space-y-6">
            {/* Quick Corridor Presets Bar */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                Popular Runs:
              </span>
              {POPULAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 shadow-2xs"
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            {/* Corridor Radar Accordion with Interactive Map Click-to-Select */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="glass-card rounded-xl px-3.5 py-2 flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Kano Corridor Radar: {selectedSenderLandmark.name.split(' ')[0]} → {selectedRecipientLandmark.name.split(' ')[0]} ({routeMetrics.distanceKm} km • ~{routeMetrics.estMinutes} mins)</span>
                  {showMap ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                </button>

                {/* Map Node Click Target Selector */}
                {showMap && (
                  <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5">Tap Map Node to set:</span>
                    <button
                      type="button"
                      onClick={() => setMapTarget('pickup')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        mapTarget === 'pickup'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Pickup (Origin)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapTarget('dropoff')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        mapTarget === 'dropoff'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Drop-off (Destination)
                    </button>
                  </div>
                )}
              </div>

              {showMap && (
                <div className="mt-2 transition-all">
                  <KanoRouteMap
                    pickupLandmark={selectedSenderLandmark}
                    dropoffLandmark={selectedRecipientLandmark}
                    onSelectLandmark={handleMapLandmarkSelect}
                  />
                </div>
              )}
            </div>

            {/* Main Form */}
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
                          <option key={l.id} value={l.id}>{l.name} — {l.hausaName}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Commercial Markets & Tech Plazas">
                        {KANO_LANDMARKS.filter(l => l.type !== 'residential').map((l) => (
                          <option key={l.id} value={l.id}>{l.name} — {l.hausaName}</option>
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

                    {/* Smart Sub-Landmark Popular Anchor Quick-Chips */}
                    {selectedSenderLandmark?.popularAnchors?.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Anchor:</span>
                        {selectedSenderLandmark.popularAnchors.map((anchor, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              senderDetail: prev.senderDetail ? `${prev.senderDetail}, ${anchor}` : anchor
                            }))}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/50 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                          >
                            + {anchor}
                          </button>
                        ))}
                      </div>
                    )}
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
                          <option key={l.id} value={l.id}>{l.name} — {l.hausaName}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Markets & Commercial Plazas">
                        {KANO_LANDMARKS.filter(l => l.type !== 'residential' && l.type !== 'campus').map((l) => (
                          <option key={l.id} value={l.id}>{l.name} — {l.hausaName}</option>
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

                    {/* Smart Sub-Landmark Popular Anchor Quick-Chips */}
                    {selectedRecipientLandmark?.popularAnchors?.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Anchor:</span>
                        {selectedRecipientLandmark.popularAnchors.map((anchor, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              recipientDetail: prev.recipientDetail ? `${prev.recipientDetail}, ${anchor}` : anchor
                            }))}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/50 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                          >
                            + {anchor}
                          </button>
                        ))}
                      </div>
                    )}
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

                {/* Real Merchant Cash-on-Delivery (CoD Item Value Split) */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                          Collect Item Price for Vendor (Cash-on-Delivery / CoD)
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Rider collects the cost of the goods (e.g. cake, fabrics) from buyer and reconciles it back to you.
                        </span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isCodActive}
                        onChange={(e) => setFormData({ ...formData, isCodActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {formData.isCodActive && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Goods / Item Price to Collect from Buyer (₦) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-400">₦</span>
                        <input
                          type="number"
                          min="100"
                          step="100"
                          placeholder="e.g. 15000 (Cake or Shadda Lace price)"
                          value={formData.codAmount}
                          onChange={(e) => setFormData({ ...formData, codAmount: e.target.value })}
                          className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm sm:text-base font-mono font-bold transition"
                        />
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Item Cost (Due to Vendor):</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">₦{parseFloat(formData.codAmount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Intra-Kano Delivery Fee:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">₦{deliveryFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-emerald-200 dark:border-emerald-800/50 font-bold text-emerald-800 dark:text-emerald-300">
                          <span>Total Cash Rider Collects on Handover:</span>
                          <span className="font-mono text-sm">₦{(parseFloat(formData.codAmount || 0) + (formData.paymentMode === 'pay_on_delivery' ? deliveryFee : 0)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery Fee Payment Method Selection */}
                <div className="pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    How Will the Courier Delivery Fee Be Settled?
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
                          Sender pays the ₦{deliveryFee.toLocaleString()} fee upfront; zero cash collected for courier fee.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Pricing & Transit Summary Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                    Guaranteed Intra-Kano Delivery Rate
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono flex items-baseline space-x-2 mt-0.5">
                    <span>₦{deliveryFee.toLocaleString()}</span>
                    <span className="text-xs font-sans font-semibold text-emerald-600 dark:text-emerald-400">Fixed Rate</span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Route: {selectedSenderLandmark.name.split(' ')[0]} → {selectedRecipientLandmark.name.split(' ')[0]} (~{routeMetrics.distanceKm} km • ~{routeMetrics.estMinutes} mins)
                  </span>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                    Settlement Method
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block mt-1">
                    {formData.paymentMode === 'pay_on_delivery' ? '💵 Pay on Delivery' : '✅ Prepaid by Sender'}
                    {formData.isCodActive && ` (+ ₦${parseFloat(formData.codAmount || 0).toLocaleString()} CoD)`}
                  </span>
                </div>
              </div>

              {/* Big Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-4 px-6 rounded-xl text-center text-sm sm:text-base shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Securing Kano Courier Match...' : 'Dispatch Fimrash Express Courier'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </section>

      {/* =========================================================================
          GIGL-INSPIRED VALUE & TRUST PILLARS (4-Card Enterprise Grid)
         ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Why Kano Merchants &amp; Families Rely on Fimrash
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enterprise logistics engineering tailored specifically for Kano metropolitan commerce.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1 */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Under 45-Min Express Transit
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Direct point-to-point motorcycle dispatches across Kano's 12 major corridors with zero hub delays.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              4-Digit Anti-Theft Handshake
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Private OTP verification prevents parcel theft. Couriers cannot finalize delivery without recipient code.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <Home className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Home &amp; Market Pickups
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Doorstep pickup for Gyadi-Gyadi home bakers, Naibawa caterers, and wholesale stalls in Kantin Kwari.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Flat &amp; Transparent Rates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Fixed mileage-based pricing from ₦800 with zero surge fees, zero merchant markups, and zero hidden costs.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          GIGL-STYLE CUSTOMER DESK & CORRIDOR DIRECTORY BAR
         ========================================================================= */}
      <section className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Need Dispatch Assistance or Commercial Bulk Courier?
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Our central dispatch desk is active 7:30 AM – 9:00 PM daily across Kano metropolis.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full md:w-auto">
          <a
            href="tel:08156661246"
            className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition text-center border border-slate-200 dark:border-slate-700"
          >
            Call Desk: 0815 666 1246
          </a>
          <a
            href="https://wa.me/2348156661246?text=Hello%20Fimrash%20Logistics%20I%20need%20courier%20dispatch"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition text-center shadow-xs"
          >
            WhatsApp Desk
          </a>
        </div>
      </section>
    </div>
  );
}
