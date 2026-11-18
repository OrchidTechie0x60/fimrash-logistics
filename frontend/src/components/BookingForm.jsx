import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { KANO_LANDMARKS, KANO_ZONES, OTHER_AREA, getLandmark } from '../data/kanoLandmarks';
import { PARCEL_SIZES, quote, usePricingRates } from '../lib/pricing';
import KanoRouteMap from './KanoRouteMap';
import { createDelivery } from '../services/api';
import { OFFICE_ADDRESS } from '../lib/business';
import { saveMyBooking } from '../lib/myBookings';
import { isNigerianMobile, naira, trackingUrl, whatsappNumber } from '../lib/format';
import {
  MapPin, Navigation, Package, ShieldCheck, ArrowRight,
  CheckCircle2, Copy, MessageSquare, Store,
  Compass, ChevronDown, ChevronUp, Home, AlertCircle,
  Calculator, Search, Truck,
  Printer, Banknote, Cake, Soup, Shirt, Sparkles, Smartphone, FileText
} from 'lucide-react';

const EMPTY_FORM = {
  senderType: 'home', // 'home' | 'market' | 'office'
  senderName: '',
  senderPhone: '',
  senderLandmark: 'gyadi-gyadi',
  senderOtherArea: '',
  senderNearLandmark: 'gyadi-gyadi',
  senderDetail: '',
  recipientType: 'home',
  recipientName: '',
  recipientPhone: '',
  recipientLandmark: 'naibawa',
  recipientOtherArea: '',
  recipientNearLandmark: 'naibawa',
  recipientDetail: '',
  itemCategory: 'Cakes, Pastries & Bakes',
  itemDescription: '',
  isFragile: true,
  parcelSize: 'medium', // small | medium | large
  deliveryNote: '',
  paymentMode: 'pay_on_delivery', // 'pay_on_delivery' or 'prepaid'
  isCodActive: false, // Optional Merchant Cash-on-Delivery
  codAmount: '',
};

export default function BookingForm({ onNavigateToTracking, initialQuery = {} }) {
  // Top Hero Utility Tab (GIGL-Style: Ship / Track / Fare Calculator)
  const [heroTab, setHeroTab] = useState('ship'); // 'ship' | 'track' | 'quote'

  // Routes chosen on the homepage (map, fare board or CoD link) arrive as ?from=&to=&cod=1.
  const [formData, setFormData] = useState(() => ({
    ...EMPTY_FORM,
    ...(getLandmark(initialQuery.from) || initialQuery.from === OTHER_AREA ? { senderLandmark: initialQuery.from } : {}),
    ...(getLandmark(initialQuery.to) || initialQuery.to === OTHER_AREA ? { recipientLandmark: initialQuery.to } : {}),
    ...(initialQuery.cod === '1' ? { isCodActive: true } : {}),
  }));

  // Radar Map Target Selector: 'pickup' or 'dropoff'
  const [mapTarget, setMapTarget] = useState('dropoff');

  // Fare Calculator Dedicated State
  const [calcState, setCalcState] = useState({
    pickup: 'gyadi-gyadi',
    dropoff: 'naibawa',
    category: 'Cakes, Pastries & Bakes',
  });

  const [quickTrackQuery, setQuickTrackQuery] = useState('');

  const [showMap, setShowMap] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [smsSent, setSmsSent] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // "Other area" prices and routes from the nearest known area the sender picked.
  const effectiveSender = formData.senderLandmark === OTHER_AREA ? formData.senderNearLandmark : formData.senderLandmark;
  const effectiveRecipient = formData.recipientLandmark === OTHER_AREA ? formData.recipientNearLandmark : formData.recipientLandmark;
  const selectedSenderLandmark = getLandmark(effectiveSender) || KANO_LANDMARKS[5];
  const selectedRecipientLandmark = getLandmark(effectiveRecipient) || KANO_LANDMARKS[8];

  const rates = usePricingRates();
  const codValue = formData.isCodActive ? Math.max(0, Number(formData.codAmount || 0)) : 0;
  const fareQuote = quote(rates, effectiveSender, effectiveRecipient, { size: formData.parcelSize, fragile: formData.isFragile, cod: codValue });
  const deliveryFee = fareQuote.fee;
  const routeMetrics = { distanceKm: fareQuote.km, estMinutes: fareQuote.minutes };

  // Dedicated Calculator Metrics
  const calcQuote = quote(rates, calcState.pickup, calcState.dropoff, { size: calcState.size || 'small' });
  const calcFare = calcQuote.fee;
  const calcMetrics = { distanceKm: calcQuote.km, estMinutes: calcQuote.minutes, corridor: `${getLandmark(calcState.pickup)?.name.split(' (')[0]} → ${getLandmark(calcState.dropoff)?.name.split(' (')[0]}` };

  // Categories for Kano: Home Businesses, Markets & Personal Errands
  const CATEGORIES = [
    { id: 'Cakes, Pastries & Bakes', label: 'Cakes, Pastries & Bakes', icon: Cake, badge: 'Upright Care' },
    { id: 'Food & Home Catering', label: 'Cooked Meals & Catering', icon: Soup, badge: 'Fresh Courier' },
    { id: 'Fabrics & Fashion', label: 'Fabrics, Abayas & Fashion', icon: Shirt, badge: 'Boutique' },
    { id: 'Perfumes & Cosmetics', label: 'Perfumes, Oils & Beauty', icon: Sparkles, badge: 'Fragrance' },
    { id: 'Phones & Gadgets', label: 'Electronics & Phones', icon: Smartphone, badge: 'Anti-Theft' },
    { id: 'Documents & Certificates', label: 'Certificates & Envelopes', icon: FileText, badge: 'Priority' },
    { id: 'Personal Items & Errands', label: 'Personal Errands & Parcels', icon: Package, badge: 'Standard' },
  ];

  // Popular Kano Corridors (Home Businesses & Markets)
  const POPULAR_PRESETS = [
    { label: 'Gyadi-Gyadi → Naibawa (Home Baker)', from: 'gyadi-gyadi', to: 'naibawa', category: 'Cakes, Pastries & Bakes' },
    { label: 'Gyadi-Gyadi → Hotoro GRA (Catering)', from: 'gyadi-gyadi', to: 'hotoro-gra', category: 'Food & Home Catering' },
    { label: 'Kwari → Nassarawa GRA (Textiles)', from: 'kwari-textiles', to: 'nassarawa-gra', category: 'Fabrics & Fashion' },
    { label: 'Tarauni → BUK Campus (Errand)', from: 'tarauni-gra', to: 'buk-new-campus', category: 'Personal Items & Errands' },
    { label: 'Farm Centre → Zoo Road (Gadgets)', from: 'farm-centre', to: 'zoo-road', category: 'Phones & Gadgets' },
  ];

  // Real, scannable QR on the waybill: it opens the public tracking page.
  useEffect(() => {
    if (!bookingSuccess) return;
    QRCode.toDataURL(trackingUrl(bookingSuccess.trackingCode), { margin: 1, width: 220, errorCorrectionLevel: 'M' })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [bookingSuccess]);

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

  const handleQuickTrackSearch = (e) => {
    e?.preventDefault();
    const code = quickTrackQuery.trim().toUpperCase();
    if (code) onNavigateToTracking(code);
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

  const validate = () => {
    if (!isNigerianMobile(formData.senderPhone)) return 'Enter a valid sender phone number (e.g. 08031234567).';
    if (!isNigerianMobile(formData.recipientPhone)) return 'Enter a valid recipient phone number (e.g. 08031234567).';
    if (formData.isCodActive && !(Number(formData.codAmount) > 0)) return 'Enter the item price to collect, or switch off Cash-on-Delivery.';
    if (formData.senderLandmark === OTHER_AREA && !formData.senderOtherArea.trim()) return 'Type the name of the pickup area.';
    if (formData.recipientLandmark === OTHER_AREA && !formData.recipientOtherArea.trim()) return 'Type the name of the delivery area.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setSubmitError(problem);
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { delivery, smsSent: sent } = await createDelivery(formData);
      saveMyBooking(delivery);
      setSmsSent(Boolean(sent));
      setBookingSuccess(delivery);
      setFormData(EMPTY_FORM);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch { /* clipboard blocked */ }
  };

  const handlePrintWaybill = () => {
    window.print();
  };

  // SUCCESS WAYBILL PASS (Printable receipt with scannable tracking QR)
  if (bookingSuccess) {
    const isCod = Number(bookingSuccess.codAmount || 0) > 0;
    const itemCost = Number(bookingSuccess.codAmount || 0);
    const fee = Number(bookingSuccess.deliveryFee || 0);
    const totalToCollect = Number(bookingSuccess.amountDue || 0);
    const senderLandmark = getLandmark(bookingSuccess.senderLandmarkId);
    const recipientLandmark = getLandmark(bookingSuccess.recipientLandmarkId);
    const shareText =
      `*FIMRASH LOGISTICS*\nHello ${bookingSuccess.recipientName}, your parcel from ${bookingSuccess.senderName} is on its way.\n` +
      `Waybill: ${bookingSuccess.trackingCode}\nTrack: ${trackingUrl(bookingSuccess.trackingCode)}\n` +
      (totalToCollect > 0 ? `Pay on delivery: ${naira(totalToCollect)}\n` : '') +
      `\n🔐 Handover code: *${bookingSuccess.otp}*\nGive this code to the rider ONLY after you have received and checked your parcel.`;

    return (
      <div className="max-w-2xl mx-auto py-6 sm:py-10 print:py-0 print:m-0 print:max-w-full">
        <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 print:shadow-none print:border-none print:p-2">
          {/* Top Brand Banner for Print */}
          <div className="text-center pb-4 mb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
            <img src="/brand/fimrash-lockup.png" alt="Fimrash Logistics" className="h-12 w-auto mx-auto mb-3" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-0.5">
              Consignment Dispatch Pass
            </h1>
            <p className="text-[11px] text-slate-500">
              {OFFICE_ADDRESS} • Dispatch desk: 0815 666 1246
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
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {bookingSuccess.assignedRider ? `Courier: ${bookingSuccess.assignedRider.name}` : 'Finding a courier'}
                </h2>
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
                  aria-label="Copy waybill number"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copiedCode && <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block print:hidden">Copied!</span>}
            </div>
          </div>

          {/* Recipient Handover Code (sender's copy) & Tracking QR */}
          <div className="my-6 p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left print:hidden">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Recipient Handover Code</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm">
                {smsSent
                  ? 'We have sent this code to the recipient by SMS. '
                  : 'Send this code to the recipient now (WhatsApp button below). '}
                They give it to the courier <span className="font-semibold underline">only after receiving the parcel</span>. The courier never sees it — do not tell the courier.
              </p>
              <div className="text-3xl font-mono font-bold text-amber-900 dark:text-amber-400 tracking-widest bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-700/50 shadow-sm text-center inline-block mt-2">
                {bookingSuccess.otp}
              </div>
            </div>
            <p className="hidden print:block text-xs text-slate-700 max-w-sm">
              Handover code is sent privately to the recipient. Courier: collect it from the recipient at handover.
            </p>

            {/* Scannable tracking QR */}
            <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR code to track ${bookingSuccess.trackingCode}`} width="110" height="110" />
              ) : (
                <div className="w-[110px] h-[110px]" />
              )}
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase mt-1">
                Scan to track
              </span>
            </div>
          </div>

          {/* Route & Fee Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-start pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Location</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {senderLandmark?.name || 'Kano Origin'}
                </span>
                <span className="text-slate-500 block text-xs">{bookingSuccess.senderDetail}</span>
                <span className="text-slate-400 block text-[11px] mt-0.5">Sender: {bookingSuccess.senderName} ({bookingSuccess.senderPhone})</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Location</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {recipientLandmark?.name || 'Kano Destination'}
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
                  {bookingSuccess.paymentMode === 'pay_on_delivery' ? 'Courier collects delivery fee from recipient on arrival' : 'Delivery fee prepaid by sender'}
                </span>
                {bookingSuccess.isFragile && (
                  <span className="inline-block mt-1 text-[11px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                    Fragile / Upright Box Handling Required
                  </span>
                )}
              </div>

              {/* Financial Summary */}
              <div className="text-right space-y-0.5">
                {isCod && (
                  <div className="text-xs text-slate-500">
                    Item CoD: <strong className="text-slate-800 dark:text-slate-200 font-mono">{naira(itemCost)}</strong>
                  </div>
                )}
                <div className="text-xs text-slate-500">
                  Delivery Fee: <strong className="text-slate-800 dark:text-slate-200 font-mono">{naira(fee)}</strong>
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 pt-0.5">
                  Total Cash on Arrival: {naira(totalToCollect)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
            <a
              href={`https://wa.me/${whatsappNumber(bookingSuccess.recipientPhone)}?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-center text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm sm:col-span-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send code to recipient on WhatsApp</span>
            </a>

            <button
              onClick={handlePrintWaybill}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-3.5 px-5 rounded-xl text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer border border-slate-700 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Waybill (no code)</span>
            </button>

            <button
              onClick={() => onNavigateToTracking(bookingSuccess.trackingCode)}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 px-5 rounded-xl text-center text-xs sm:text-sm transition cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Track this parcel</span>
            </button>

            <button
              onClick={() => setBookingSuccess(null)}
              className="text-emerald-700 dark:text-emerald-400 font-bold py-2 text-xs sm:text-sm hover:underline sm:col-span-2"
            >
              Book another dispatch
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

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.02]">
            Book a pickup
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Same-day motorcycle courier between Kano landmarks. Fill in both ends, check the flat fare, and you are done.
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
            TAB 2 CONTENT: QUICK WAYBILL TRACKER
           ----------------------------------------------------------------------- */}
        {heroTab === 'track' && (
          <div className="relative z-10 glass-card rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Track a Waybill</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter the Fimrash waybill code from your SMS, WhatsApp message or printed pass.
              </p>
            </div>

            <form onSubmit={handleQuickTrackSearch} className="flex gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  aria-label="Waybill code"
                  placeholder="e.g. FMR-KN-7Q2X9A"
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
                  Pickup from
                </label>
                <select
                  value={calcState.pickup}
                  onChange={(e) => setCalcState({ ...calcState, pickup: e.target.value })}
                  className="w-full rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition"
                >
                  <ZoneOptions />
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Deliver to
                </label>
                <select
                  value={calcState.dropoff}
                  onChange={(e) => setCalcState({ ...calcState, dropoff: e.target.value })}
                  className="w-full rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition"
                >
                  <ZoneOptions />
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Parcel type
                </label>
                <select
                  value={calcState.category}
                  onChange={(e) => setCalcState({ ...calcState, category: e.target.value })}
                  className="w-full rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
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
                Priced by road distance, parcel size and handling. No surge. Includes a private 4-digit handover code.
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
                      Pickup
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
                      Pickup area *
                    </label>
                    <AreaPicker side="sender" formData={formData} setFormData={setFormData} />
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
                      Delivery
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
                      placeholder="e.g. 08091234567"
                      value={formData.recipientPhone}
                      onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                      className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base font-mono transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Delivery area *
                    </label>
                    <AreaPicker side="recipient" formData={formData} setFormData={setFormData} />
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
                    Parcel
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
                          <cat.icon className="w-6 h-6 mb-1 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
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
                      Brief Parcel Description *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={255}
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

                {/* Parcel size: drives the size surcharge */}
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Parcel size</span>
                  <div role="radiogroup" aria-label="Parcel size" className="grid grid-cols-3 gap-2.5">
                    {PARCEL_SIZES.map((size) => {
                      const info = {
                        small: ['Small', 'Envelope, phone, small pack'],
                        medium: ['Medium', 'Cake box, shoe box, small bag'],
                        large: ['Large', 'Carton or bulk bag'],
                      }[size];
                      const extra = rates[`size${size[0].toUpperCase()}${size.slice(1)}`];
                      const active = formData.parcelSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setFormData({ ...formData, parcelSize: size })}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                            active
                              ? 'bg-emerald-50 border-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-500'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <span className="block text-sm font-bold text-slate-900 dark:text-white">{info[0]}</span>
                          <span className="block text-[11px] text-slate-500 mt-0.5">{info[1]}</span>
                          <span className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1">{extra ? `+₦${extra.toLocaleString()}` : 'No extra'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cake & Food Upright Handling Guarantee */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-lg"></span>
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
                    Delivery fee
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono flex items-baseline space-x-2 mt-0.5">
                    <span>₦{deliveryFee.toLocaleString()}</span>
                    <span className="text-xs font-sans font-semibold text-emerald-600 dark:text-emerald-400">~{routeMetrics.distanceKm} km</span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {fareQuote.breakdown.size + fareQuote.breakdown.fragile + fareQuote.breakdown.cod > 0 && (
                      <span className="block">Includes {[fareQuote.breakdown.size && `₦${fareQuote.breakdown.size.toLocaleString()} size`, fareQuote.breakdown.fragile && `₦${fareQuote.breakdown.fragile.toLocaleString()} fragile`, fareQuote.breakdown.cod && `₦${fareQuote.breakdown.cod.toLocaleString()} CoD handling`].filter(Boolean).join(', ')}</span>
                    )}
                    Route: {selectedSenderLandmark.name.split(' ')[0]} → {selectedRecipientLandmark.name.split(' ')[0]} (~{routeMetrics.distanceKm} km • ~{routeMetrics.estMinutes} mins)
                  </span>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                    Settlement Method
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block mt-1">
                    {formData.paymentMode === 'pay_on_delivery' ? 'Pay on Delivery' : 'Prepaid by Sender'}
                    {formData.isCodActive && ` (+ ₦${parseFloat(formData.codAmount || 0).toLocaleString()} CoD)`}
                  </span>
                </div>
              </div>

              {submitError && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs sm:text-sm text-rose-700 dark:text-rose-400 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Big Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-4 px-6 rounded-xl text-center text-sm sm:text-base shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Booking your courier…' : 'Book Fimrash Courier'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </section>

    </div>
  );
}

// Areas grouped by zone, shared by every area dropdown on this page.
function ZoneOptions() {
  return KANO_ZONES.map((z) => (
    <optgroup key={z.id} label={z.name}>
      {KANO_LANDMARKS.filter((l) => l.zoneId === z.id).map((l) => (
        <option key={l.id} value={l.id}>{l.name} — {l.hausaName}</option>
      ))}
    </optgroup>
  ));
}

// Known area, or "Other area": the sender types the area and picks the nearest known one,
// which sets the fare, the rider's zone and the map route.
function AreaPicker({ side, formData, setFormData }) {
  const key = `${side}Landmark`;
  const otherKey = `${side}OtherArea`;
  const nearKey = `${side}NearLandmark`;
  const isOther = formData[key] === OTHER_AREA;
  const label = side === 'sender' ? 'pickup' : 'delivery';
  return (
    <div className="space-y-2.5">
      <select
        value={formData[key]}
        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
        className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base font-semibold transition"
      >
        <ZoneOptions />
        <optgroup label="Not listed?">
          <option value={OTHER_AREA}>Other area: I'll type it</option>
        </optgroup>
      </select>
      {isOther && (
        <div className="grid gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <label className="block">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Name of the {label} area *</span>
            <input
              type="text"
              required
              maxLength={128}
              value={formData[otherKey]}
              onChange={(e) => setFormData({ ...formData, [otherKey]: e.target.value })}
              placeholder="e.g. Kawo Mai Gari, Rangaza, Tudun Murtala"
              className="w-full rounded-xl px-4 py-3 text-sm sm:text-base transition"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Closest listed area (sets the fare) *</span>
            <select
              value={formData[nearKey]}
              onChange={(e) => setFormData({ ...formData, [nearKey]: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm sm:text-base font-semibold transition"
            >
              <ZoneOptions />
            </select>
          </label>
          <p className="text-[11px] text-slate-500">The desk may adjust the fee if the area is far from the one you pick.</p>
        </div>
      )}
    </div>
  );
}
