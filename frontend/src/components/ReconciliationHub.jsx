import React, { useState } from 'react';
import { 
  Banknote, CheckCircle, ArrowDownRight, Clock, ShieldCheck, 
  UserCheck, RefreshCw, Sparkles, TrendingUp, DollarSign, Wallet,
  Package, ArrowRight, CheckCircle2, Store
} from 'lucide-react';

export default function ReconciliationHub({ deliveries, riderCashInHand, onRemitRiderCash }) {
  const [filter, setFilter] = useState('all');
  const [remitSuccess, setRemitSuccess] = useState(false);
  const [settledVendors, setSettledVendors] = useState({});

  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');
  const totalDeliveryRevenue = completedDeliveries.reduce((sum, d) => sum + (Number(d.deliveryFee) || 0), 0);
  const totalCodHeld = completedDeliveries.reduce((sum, d) => sum + (Number(d.codAmount) || 0), 0);
  const payOnDeliveryJobs = completedDeliveries.filter(d => d.paymentMode === 'pay_on_delivery');
  const prepaidJobs = completedDeliveries.filter(d => d.paymentMode === 'prepaid');

  const filteredDeliveries = deliveries.filter(d => {
    if (filter === 'pay_on_delivery') return d.paymentMode === 'pay_on_delivery';
    if (filter === 'prepaid') return d.paymentMode === 'prepaid';
    if (filter === 'cod') return Number(d.codAmount || 0) > 0;
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

  const handleSettleVendor = (id) => {
    setSettledVendors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Financial Overview Header */}
      <div className="glass-card rounded-2xl p-5 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2 border border-emerald-200 dark:border-emerald-800/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Courier Operations &amp; Merchant Financial Settlement</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Kano Delivery &amp; CoD Settlement Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Audit physical courier fee cash, merchant item payments (CoD), and bank-grade reconciliations across Kano metro.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Station Cash Vault: Active</span>
            </span>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 relative z-10">
          {/* Card 1: Rider Physical Cash in Hand */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Courier Fee in Hand
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              ₦{riderCashInHand.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Delivery fee cash held in courier pouches
            </p>
            {riderCashInHand > 0 && (
              <button
                onClick={handleRemit}
                className="mt-3 w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deposit to Station Vault</span>
              </button>
            )}
            {remitSuccess && (
              <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold text-center">
                ✅ Cash deposited to station vault!
              </div>
            )}
          </div>

          {/* Card 2: Merchant CoD Funds Held in Trust */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Merchant CoD Held
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              ₦{totalCodHeld.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Goods payments collected for home bakers &amp; traders
            </p>
          </div>

          {/* Card 3: Total Fimrash Delivery Revenue */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Delivery Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              ₦{totalDeliveryRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Earned from {completedDeliveries.length} completed dispatches today
            </p>
          </div>

          {/* Card 4: Waybill Split */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Delivery Mode Split
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {payOnDeliveryJobs.length} <span className="text-xs font-sans text-slate-400 font-normal">Cash</span> / {prepaidJobs.length} <span className="text-xs font-sans text-slate-400 font-normal">Prepaid</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {deliveries.filter(d => d.status !== 'delivered').length} active dispatches en route
            </p>
          </div>
        </div>
      </div>

      {/* Consignments Audit & Settlement Table */}
      <div className="glass-card rounded-2xl p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Daily Consignments &amp; CoD Settlement Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Audit log of all intra-Kano dispatch requests, delivery fees, and merchant payouts.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs py-1">
            {[
              { id: 'all', label: 'All Jobs' },
              { id: 'cod', label: 'CoD Items' },
              { id: 'pay_on_delivery', label: 'Pay on Delivery' },
              { id: 'prepaid', label: 'Prepaid' },
              { id: 'active', label: 'In Transit' },
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400">
                <th className="py-3 px-3">Waybill Code</th>
                <th className="py-3 px-3">Merchant / Sender</th>
                <th className="py-3 px-3">Recipient &amp; Corridor</th>
                <th className="py-3 px-3">Item CoD</th>
                <th className="py-3 px-3">Delivery Fee</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Vendor Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredDeliveries.map(del => {
                const isCod = Number(del.codAmount || 0) > 0;
                const isDelivered = del.status === 'delivered';
                const isSettled = settledVendors[del.id];

                return (
                  <tr key={del.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {del.trackingCode}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {del.senderName}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {del.senderLandmark?.name?.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-800 dark:text-slate-200 block">
                        {del.recipientName}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        → {del.recipientLandmark?.name?.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {isCod ? (
                        <span className="font-bold text-amber-800 dark:text-amber-400">
                          ₦{Number(del.codAmount).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      ₦{Number(del.deliveryFee).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-bold uppercase ${
                        isDelivered
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {del.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isCod ? (
                        isSettled ? (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Disbursed</span>
                          </span>
                        ) : isDelivered ? (
                          <button
                            onClick={() => handleSettleVendor(del.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
                          >
                            Disburse ₦{Number(del.codAmount).toLocaleString()}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Awaiting Handover</span>
                        )
                      ) : (
                        <span className="text-xs text-slate-400">N/A (Courier Only)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
