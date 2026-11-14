import React, { useState } from 'react';
import { 
  Banknote, CheckCircle, ArrowDownRight, Clock, ShieldCheck, 
  UserCheck, RefreshCw, Sparkles, TrendingUp, DollarSign, Wallet,
  Package, ArrowRight, CheckCircle2
} from 'lucide-react';

export default function ReconciliationHub({ deliveries, riderCashInHand, onRemitRiderCash }) {
  const [filter, setFilter] = useState('all');
  const [remitSuccess, setRemitSuccess] = useState(false);

  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');
  const totalDeliveryRevenue = completedDeliveries.reduce((sum, d) => sum + (d.deliveryFee || 0), 0);
  const payOnDeliveryJobs = completedDeliveries.filter(d => d.paymentMode === 'pay_on_delivery');
  const prepaidJobs = completedDeliveries.filter(d => d.paymentMode === 'prepaid');

  const filteredDeliveries = deliveries.filter(d => {
    if (filter === 'pay_on_delivery') return d.paymentMode === 'pay_on_delivery';
    if (filter === 'prepaid') return d.paymentMode === 'prepaid';
    if (filter === 'active') return d.status !== 'delivered';
    if (filter === 'delivered') return d.status === 'delivered';
    return true;
  });

  const handleRemit = () => {
    if (riderCashInHand <= 0) return;
    onRemitRiderCash();
    setRemitSuccess(true);
    setTimeout(() => setRemitSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Financial Overview Header */}
      <div className="glass-card rounded-2xl p-5 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2 border border-emerald-200 dark:border-emerald-800/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Courier Operations &amp; Cash Reconciliation</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Kano Delivery Fee Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Audit physical delivery fee cash collected by couriers vs prepaid consignments across Kano metropolitan corridors.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Station Cash Vault: Active</span>
            </span>
          </div>
        </div>

        {/* Financial KPI Cards - Standard Comfortable Height & Padding */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 relative z-10">
          {/* Card 1: Rider Physical Cash in Hand */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Courier Cash in Hand
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              ₦{riderCashInHand.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Physical cash collected on delivery held in courier pouches
            </p>
            {riderCashInHand > 0 && (
              <button
                onClick={handleRemit}
                className="mt-3.5 w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deposit Cash to Station Office</span>
              </button>
            )}
            {remitSuccess && (
              <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold text-center">
                ✅ Cash remitted to station office vault!
              </div>
            )}
          </div>

          {/* Card 2: Total Fimrash Delivery Revenue */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Delivery Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              ₦{totalDeliveryRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Earned from {completedDeliveries.length} completed delivery runs today
            </p>
          </div>

          {/* Card 3: Waybill Split */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Delivery Mode Split
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {payOnDeliveryJobs.length} <span className="text-sm font-sans text-slate-400 font-normal">Cash</span> / {prepaidJobs.length} <span className="text-sm font-sans text-slate-400 font-normal">Prepaid</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {deliveries.filter(d => d.status !== 'delivered').length} active deliveries still on route
            </p>
          </div>
        </div>
      </div>

      {/* Consignments Audit Table */}
      <div className="glass-card rounded-2xl p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Daily Parcel Consignments
            </h2>
            <p className="text-xs text-slate-500">
              Audit log of all intra-Kano dispatch requests, pickup corridors, and delivery fees.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs py-1">
            {[
              { id: 'all', label: 'All Jobs' },
              { id: 'pay_on_delivery', label: 'Pay on Delivery' },
              { id: 'prepaid', label: 'Prepaid' },
              { id: 'active', label: 'Active in Transit' },
              { id: 'delivered', label: 'Delivered' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
                  filter === f.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table - Standard Comfortable Line Heights */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400">
                <th className="py-3 px-3">Waybill Code</th>
                <th className="py-3 px-3">Corridor (Pickup → Dropoff)</th>
                <th className="py-3 px-3">Parcel Type</th>
                <th className="py-3 px-3">Delivery Fee</th>
                <th className="py-3 px-3">Payment Mode</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredDeliveries.map(del => (
                <tr key={del.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                    {del.trackingCode}
                    <span className="block text-[11px] font-sans font-normal text-slate-400">
                      Rider: {del.assignedRider.name.split(' ')[0]}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="text-slate-900 dark:text-white font-semibold">
                      {del.senderLandmark.name} → {del.recipientLandmark.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {del.senderName} to {del.recipientName}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                    <div>{del.itemCategory}</div>
                    <div className="text-[11px] text-slate-400">{del.itemDescription}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                    ₦{del.deliveryFee.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-block ${
                      del.paymentMode === 'pay_on_delivery'
                        ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                        : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                    }`}>
                      {del.paymentMode === 'pay_on_delivery' ? '💵 Pay on Delivery' : '✅ Prepaid'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase inline-block ${
                      del.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {del.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
