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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Financial Overview Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Discrepancy Anti-Fraud Vault</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Kano COD Financial Settlement
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Automated audit of courier cash collections, Fimrash delivery fees deducted, and net merchant balances.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-2 rounded-xl flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Bank Switch Active</span>
            </span>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 relative z-10">
          {/* Card 1: Rider Cash */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-amber-500/40 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Courier Cash in Pocket
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
              ₦{riderCashInHand.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center space-x-1">
              <span>Physical Naira in courier custody</span>
            </p>
          </div>

          {/* Card 2: Fimrash Revenue */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Fimrash Delivery Fees
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              ₦{totalDeliveryFees.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              <span>Earned from completed deliveries</span>
            </p>
          </div>

          {/* Card 3: Pending Vendor Remittance */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-cyan-500/40 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Due to Kano Merchants
              </span>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-cyan-400 font-mono tracking-tight">
              ₦{totalVendorPayoutPending.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              <span>Due for 2-hour settlement transfer</span>
            </p>
          </div>
        </div>
      </div>

      {/* Courier Cash Balances */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Motorcycle Fleet Physical Cash Custody</span>
          </h2>
          <span className="text-[10px] text-slate-400">Kano Metropolitan Patrol</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-base">
                🏍️
              </div>
              <div>
                <span className="font-black text-white text-sm block">Musa Garba (Rider #04)</span>
                <span className="text-[11px] text-slate-400">Plate: KN-942-TRN • Kwari & Nassarawa Loop</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Cash in Pouch</span>
              <span className="text-base font-black text-amber-400 font-mono">₦{riderCashInHand.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-base">
                🏍️
              </div>
              <div>
                <span className="font-black text-white text-sm block">Ibrahim Aliyu (Rider #02)</span>
                <span className="text-[11px] text-slate-400">Plate: KN-118-GWL • Farm Centre & Zoo Rd Loop</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Cash in Pouch</span>
              <span className="text-base font-black text-emerald-400 font-mono">₦0 (Reconciled)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <h2 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-2">
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span>Dispatched Waybills & Merchant Ledger</span>
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 text-xs">
            {['all', 'cod', 'pending', 'settled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg font-bold uppercase text-[10px] transition cursor-pointer ${
                  filter === f
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 uppercase font-bold border-b border-white/5">
              <tr>
                <th className="py-3 px-3">Waybill</th>
                <th className="py-3 px-3">Merchant</th>
                <th className="py-3 px-3">Dropoff Corridor</th>
                <th className="py-3 px-3">Mode</th>
                <th className="py-3 px-3">Gross COD</th>
                <th className="py-3 px-3">Delivery Fee</th>
                <th className="py-3 px-3">Net Merchant Payout</th>
                <th className="py-3 px-3">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {filteredDeliveries.map((del) => {
                const isDelivered = del.status === 'delivered';
                return (
                  <tr key={del.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-3 font-mono font-black text-white">{del.trackingCode}</td>
                    <td className="py-3.5 px-3 text-slate-300 font-semibold">{del.senderName}</td>
                    <td className="py-3.5 px-3 text-slate-400">{del.recipientLandmark.name.split(' ')[0]}</td>
                    <td className="py-3.5 px-3">
                      {del.isCod ? (
                        <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-black text-[10px]">
                          COD
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-bold text-[10px]">
                          Prepaid
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-white">
                      {del.isCod ? `₦${del.itemValue.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-emerald-400 font-bold">
                      ₦{del.deliveryFee.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-black text-cyan-400">
                      {del.isCod ? `₦${del.netVendorPayout.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3.5 px-3">
                      {del.isCod && isDelivered && !del.vendorSettled ? (
                        <button
                          onClick={() => onSettleVendorPayout(del.id)}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-3 py-1 rounded-xl text-[11px] font-black transition flex items-center space-x-1 cursor-pointer shadow-md shadow-emerald-500/20"
                        >
                          <span>Remit Bank</span>
                          <ArrowDownRight className="w-3 h-3" />
                        </button>
                      ) : del.vendorSettled ? (
                        <span className="text-emerald-400 font-black flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Remitted</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">
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
