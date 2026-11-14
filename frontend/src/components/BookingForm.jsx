import React, { useState } from 'react';
import { KANO_LANDMARKS, calculateDeliveryFare } from '../data/kanoLandmarks';
import { MapPin, Navigation, Package, DollarSign, ShieldAlert, ArrowRight, CheckCircle2, Copy } from 'lucide-react';

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

  const deliveryFee = calculateDeliveryFare(formData.senderLandmark, formData.recipientLandmark);
  const itemValueNum = parseFloat(formData.itemValue) || 0;
  const netVendorPayout = formData.isCod ? itemValueNum - deliveryFee : 0;

  const selectedSenderLandmark = KANO_LANDMARKS.find(l => l.id === formData.senderLandmark);
  const selectedRecipientLandmark = KANO_LANDMARKS.find(l => l.id === formData.recipientLandmark);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Generate Kano Waybill Code: FMR-KN-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `FMR-KN-${randomSuffix}`;
    
    // Generate 4-digit recipient OTP handshake
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newDelivery = {
      id: 'del_' + Date.now(),
      trackingCode,
      otpCode,
      status: 'pending',
      senderName: formData.senderName || 'Anonymous Merchant',
      senderPhone: formData.senderPhone || '08030000000',
      senderLandmark: selectedSenderLandmark,
      senderDetail: formData.senderDetail || 'Main Gate Entrance',
      recipientName: formData.recipientName || 'Valued Customer',
      recipientPhone: formData.recipientPhone || '08080000000',
      recipientLandmark: selectedRecipientLandmark,
      recipientDetail: formData.recipientDetail || 'Standard delivery address',
      itemCategory: formData.itemCategory,
      itemDescription: formData.itemDescription || 'Standard Parcel',
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
      history: [
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), label: 'Waybill Created & Dispatched', status: 'done' }
      ]
    };

    onDeliveryCreated(newDelivery);
    setBookingSuccess(newDelivery);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (bookingSuccess) {
    return (
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex items-center space-x-3 text-emerald-400 mb-4">
          <CheckCircle2 className="w-8 h-8" />
          <h2 className="text-xl font-bold text-white">Waybill Successfully Booked!</h2>
        </div>

        <p className="text-slate-300 text-sm mb-6">
          Your dispatch request is live. A Fimrash courier has been alerted and will arrive at your pickup landmark shortly.
        </p>

        {/* Highlight Card */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 mb-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Waybill Tracking Code</span>
              <div className="text-2xl font-black text-white tracking-wider flex items-center space-x-2">
                <span>{bookingSuccess.trackingCode}</span>
                <button
                  onClick={() => copyToClipboard(bookingSuccess.trackingCode)}
                  className="text-slate-400 hover:text-emerald-400 transition"
                  title="Copy Tracking Code"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copiedCode && <span className="text-[10px] text-emerald-400">Copied to clipboard!</span>}
            </div>
            
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase font-semibold">Recipient OTP Handshake</span>
              <div className="text-2xl font-black text-amber-400 font-mono tracking-widest bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                {bookingSuccess.otpCode}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Pickup Landmark:</span>
              <span className="font-semibold text-white block">{bookingSuccess.senderLandmark.name}</span>
              <span className="text-slate-400 text-[11px]">{bookingSuccess.senderDetail}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Delivery Landmark:</span>
              <span className="font-semibold text-white block">{bookingSuccess.recipientLandmark.name}</span>
              <span className="text-slate-400 text-[11px]">{bookingSuccess.recipientDetail}</span>
            </div>
          </div>

          {bookingSuccess.isCod && (
            <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-500/20 flex justify-between items-center text-xs">
              <span className="text-emerald-300 font-medium">Cash to Collect on Delivery (COD):</span>
              <span className="text-base font-bold text-emerald-400">₦{bookingSuccess.itemValue.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              const text = `Hello ${bookingSuccess.recipientName}, your order from ${bookingSuccess.senderName} has been dispatched via Fimrash Logistics Kano! Track your delivery here: https://fimrash.com/track?code=${bookingSuccess.trackingCode} (Your secret delivery OTP is: ${bookingSuccess.otpCode}). Please give this OTP to the rider only after inspecting your parcel.`;
              window.open(`https://wa.me/234${bookingSuccess.recipientPhone.replace(/^0/, '')}?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-center text-sm transition flex items-center justify-center space-x-2"
          >
            <span>Notify Recipient on WhatsApp</span>
          </button>

          <button
            onClick={() => setBookingSuccess(null)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-xl text-center text-sm transition"
          >
            Book Another Delivery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Request Instant Courier Dispatch</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Landmark-guided parcel pickup and delivery across Kano metropolis with 4-digit recipient OTP handshake & automated COD settlement.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pickup Section */}
          <div className="bg-slate-950/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400 text-sm font-bold">
              <MapPin className="w-4 h-4" />
              <span>1. Sender & Pickup Location</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Sender / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Ihsan Textiles"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (Calls/WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="080..."
                  value={formData.senderPhone}
                  onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Pickup Market / Landmark *</label>
                <select
                  value={formData.senderLandmark}
                  onChange={(e) => setFormData({ ...formData, senderLandmark: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {KANO_LANDMARKS.map((landmark) => (
                    <option key={landmark.id} value={landmark.id}>
                      {landmark.name} ({landmark.hausaName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Shop / Stall / Exact Landmark Detail *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block B, Line 3, Shop 14 (Near Access Bank)"
                  value={formData.senderDetail}
                  onChange={(e) => setFormData({ ...formData, senderDetail: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {selectedSenderLandmark && (
              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 bg-slate-900/60 p-2 rounded border border-slate-800">
                <span className="text-emerald-400 font-medium">Common Anchors:</span>
                <span>{selectedSenderLandmark.popularAnchors.join(' • ')}</span>
              </div>
            )}
          </div>

          {/* Delivery Destination Section */}
          <div className="bg-slate-950/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-teal-400 text-sm font-bold">
              <Navigation className="w-4 h-4" />
              <span>2. Recipient & Delivery Location</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Customer / Recipient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Bello"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Customer Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="080..."
                  value={formData.recipientPhone}
                  onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Delivery Area / Landmark *</label>
                <select
                  value={formData.recipientLandmark}
                  onChange={(e) => setFormData({ ...formData, recipientLandmark: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  {KANO_LANDMARKS.map((landmark) => (
                    <option key={landmark.id} value={landmark.id}>
                      {landmark.name} ({landmark.hausaName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">House / Gate / Landmark Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House No. 24, Near Coronation Hall gate"
                  value={formData.recipientDetail}
                  onChange={(e) => setFormData({ ...formData, recipientDetail: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Item & Payment Section */}
          <div className="bg-slate-950/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-amber-400 text-sm font-bold">
              <Package className="w-4 h-4" />
              <span>3. Package & Cash-on-Delivery (COD) Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Item Category</label>
                <select
                  value={formData.itemCategory}
                  onChange={(e) => setFormData({ ...formData, itemCategory: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Fabrics & Fashion">Fabrics, Atamfa, Shadda & Lace</option>
                  <option value="Phones & Gadgets">Phones, Accessories & Electronics</option>
                  <option value="Cosmetics & Perfumes">Cosmetics, Scents & Skincare</option>
                  <option value="Documents">Business Documents & Invoices</option>
                  <option value="Footwear & Leather">Shoes, Bags & Leather</option>
                  <option value="Other Parcel">General Small Parcel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Item Brief / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. 2 bundles of Swiss lace in black polythene"
                  value={formData.itemDescription}
                  onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="cod-toggle"
                  checked={formData.isCod}
                  onChange={(e) => setFormData({ ...formData, isCod: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-800 border-slate-700 focus:ring-emerald-500"
                />
                <label htmlFor="cod-toggle" className="text-xs text-slate-200 cursor-pointer">
                  <span className="font-bold text-white block">Cash on Delivery (COD) Required</span>
                  <span className="text-slate-400">Rider will collect item cost from recipient before giving parcel</span>
                </label>
              </div>

              {formData.isCod && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Item Cost: ₦</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.itemValue}
                    onChange={(e) => setFormData({ ...formData, itemValue: e.target.value })}
                    className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Pricing Summary Breakdown */}
          <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-4 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Estimated Delivery Fare</span>
              <div className="text-2xl font-black text-white">
                ₦{deliveryFee.toLocaleString()}
                <span className="text-xs font-normal text-emerald-400 ml-2">Flat Kano Rate</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {selectedSenderLandmark?.name} → {selectedRecipientLandmark?.name}
              </span>
            </div>

            {formData.isCod && (
              <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
                <span className="text-xs text-slate-400 block font-medium">Net Vendor Payout (After Fee)</span>
                <div className="text-lg font-bold text-emerald-400">
                  ₦{Math.max(0, netVendorPayout).toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400">Remitted within 2 hours of delivery</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-center text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Dispatch Fimrash Rider Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
