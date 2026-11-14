import React, { useState } from 'react';
import { 
  Banknote, CheckCircle, ArrowDownRight, Clock, ShieldCheck, 
  UserCheck, RefreshCw, Sparkles, TrendingUp, DollarSign, Wallet
} from 'lucide-react';

export default function ReconciliationHub({ deliveries, riderCashInHand, onSettleVendorPayout }) {
  const [filter, setFilter] = useState('all');

  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');
  const codDeliveries = completedDeliveries.filter(d => d.isCod);

  const totalCodCollected = codDeliveries.reduce((sum, d) => sum + (d.itemValue || 0), 0);
  const totalDeliveryFees = completedDeliveries.reduce((sum, d) => sum + (d.deliveryFee || 0), 0);
  const totalVendorPayoutPending = codDeliveries
    .filter(d => !d.vendorSettled)
    .reduce((sum, d) => sum + (d.netVendorPayout || 0), 0);

  const filteredDeliveries = deliveries.filter(d => {
    if (filter === 'cod') return d.isCod;
    if (filter === 'pending') return !d.vendorSettled;
    if (filter === 'settled') return d.vendorSettled;
    return true;
  });

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Financial Overview Header */}
      <div className="glass-card rounded-2xl p-5 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5 border border-slate-200 dark:border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Zero-Discrepancy Audit Vault</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Kano COD Financial Settlement
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Automated audit of courier cash collections, Fimrash delivery fees deducted, and net merchant balances.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Bank Switch Online</span>
            </span>
          </div>
        </div>

        {/* Financial KPI Cards (Calm & Institutional) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 relative z-10">
          {/* Card 1: Rider Cash */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Courier Cash in Pocket
              </span>
              <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              ₦{riderCashInHand.toLocaleString()}
            </div>
            <p className="text-[10.5px] text-slate-500 mt-1">
              Physical cash held in courier pouches
            </p>
          </div>

          {/* Card 2: Fimrash Revenue */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Fimrash Delivery Fees
              </span>
              <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              ₦{totalDeliveryFees.toLocaleString()}
            </div>
            <p className="text-[10.5px] text-slate-500 mt-1">
              Earned from completed deliveries
            </p>
          </div>

          {/* Card 3: Pending Vendor Remittance */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Due to Kano Merchants
              </span>
              <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              ₦{totalVendorPayoutPending.toLocaleString()}
            </div>
            <p className="text-[10.5px] text-slate-500 mt-1">
              Due for 2-hour settlement transfer
            </p>
          </div>
        </div>
      </div>

      {/* Courier Cash Balances */}
      <div className="glass-card rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Motorcycle Fleet Physical Cash Custody</span>
          </h2>
          <span className="text-[10px] text-slate-400">Kano Patrol</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm">
                🏍️
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-xs block">Musa Garba (Rider #04)</span>
                <span className="text-[10px] text-slate-500">Plate: KN-942-TRN • Kwari & Nassarawa Loop</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Cash in Pouch</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">₦{riderCashInHand.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm">
                🏍️
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-xs block">Ibrahim Aliyu (Rider #02)</span>
                <span className="text-[10px] text-slate-500">Plate: KN-118-GWL • Farm Centre & Zoo Rd Loop</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Cash in Pouch</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">₦0 (Reconciled)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Banknote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Dispatched Waybills & Merchant Ledger</span>
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 text-xs">
            {['all', 'cod', 'pending', 'settled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-0.5 rounded-md font-semibold uppercase text-[9px] transition cursor-pointer ${
                  filter === f
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-2.5">Waybill</th>
                <th className="py-2.5 px-2.5">Merchant</th>
                <th className="py-2.5 px-2.5">Dropoff Corridor</th>
                <th className="py-2.5 px-2.5">Mode</th>
                <th className="py-2.5 px-2.5">Gross COD</th>
                <th className="py-2.5 px-2.5">Delivery Fee</th>
                <th className="py-2.5 px-2.5">Net Merchant Payout</th>
                <th className="py-2.5 px-2.5">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDeliveries.map((del) => {
                const isDelivered = del.status === 'delivered';
                return (
                  <tr key={del.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-2.5 font-mono font-bold text-slate-900 dark:text-white">{del.trackingCode}</td>
                    <td className="py-3 px-2.5 text-slate-800 dark:text-slate-200">{del.senderName}</td>
                    <td className="py-3 px-2.5 text-slate-500">{del.recipientLandmark.name.split(' ')[0]}</td>
                    <td className="py-3 px-2.5">
                      {del.isCod ? (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded font-semibold text-[9px] border border-slate-200 dark:border-slate-700">
                          COD
                        </span>
                      ) : (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[9px]">
                          Prepaid
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2.5 font-mono font-semibold text-slate-900 dark:text-white">
                      {del.isCod ? `₦${del.itemValue.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-2.5 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                      ₦${del.deliveryFee.toLocaleString()}
                    </td>
                    <td className="py-3 px-2.5 font-mono font-bold text-slate-900 dark:text-white">
                      {del.isCod ? `₦${del.netVendorPayout.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-2.5">
                      {del.isCod && isDelivered && !del.vendorSettled ? (
                        <button
                          onClick={() => onSettleVendorPayout(del.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer shadow-sm"
                        >
                          <span>Remit Bank</span>
                          <ArrowDownRight className="w-3 h-3" />
                        </button>
                      ) : del.vendorSettled ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1 text-[11px]">
                          <CheckCircle className="w-3 h-3" />
                          <span>Remitted</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">
                          {isDelivered ? 'Settled' : 'In Transit'}
                        </span>
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
