import React, { useState } from 'react';
import { Banknote, CheckCircle, ArrowDownRight, Clock, ShieldCheck, UserCheck, RefreshCw } from 'lucide-react';

export default function ReconciliationHub({ deliveries, riderCashInHand, onSettleVendorPayout }) {
  const [filter, setFilter] = useState('all');

  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');
  const codDeliveries = completedDeliveries.filter(d => d.isCod);

  const totalCodCollected = codDeliveries.reduce((sum, d) => sum + (d.itemValue || 0), 0);
  const totalDeliveryFees = completedDeliveries.reduce((sum, d) => sum + (d.deliveryFee || 0), 0);
  const totalVendorPayoutPending = codDeliveries
    .filter(d => !d.vendorSettled)
    .reduce((sum, d) => sum + (d.netVendorPayout || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">COD Settlement & Cash Reconciliation</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Live audit of physical cash collected by couriers, Fimrash delivery fees deducted, and net merchant balances.
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl flex items-center space-x-2 text-emerald-400 text-xs font-semibold self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Discrepancy Ledger</span>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Rider Cash in Hand
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              ₦{riderCashInHand.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Held across active motorcycle fleet</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Fimrash Fees Earned
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              ₦{totalDeliveryFees.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Earned from completed deliveries</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Pending Merchant Payout
            </span>
            <div className="text-2xl font-black text-teal-400 font-mono">
              ₦{totalVendorPayoutPending.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Due for instant bank transfer</span>
          </div>
        </div>
      </div>

      {/* Courier Cash Balances */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Active Courier Physical Cash Custody</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-sm block">Musa Garba (Rider #04)</span>
              <span className="text-xs text-slate-400">KN-942-TRN • Kantin Kwari & Nassarawa Loop</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Cash Collected</span>
              <span className="text-base font-black text-amber-400 font-mono">₦{riderCashInHand.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-sm block">Ibrahim Aliyu (Rider #02)</span>
              <span className="text-xs text-slate-400">KN-118-GWL • Farm Centre & Zoo Rd Loop</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Cash Collected</span>
              <span className="text-base font-black text-slate-300 font-mono">₦0 (Cleared)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span>Dispatched Waybills & Settlement Records</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Waybill</th>
                <th className="py-3 px-3">Merchant</th>
                <th className="py-3 px-3">Dropoff Landmark</th>
                <th className="py-3 px-3">Mode</th>
                <th className="py-3 px-3">Gross COD</th>
                <th className="py-3 px-3">Fee</th>
                <th className="py-3 px-3">Net Vendor Payout</th>
                <th className="py-3 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {deliveries.map((del) => {
                const isDelivered = del.status === 'delivered';
                return (
                  <tr key={del.id} className="hover:bg-slate-850 transition">
                    <td className="py-3 px-3 font-mono font-bold text-white">{del.trackingCode}</td>
                    <td className="py-3 px-3 text-slate-300">{del.senderName}</td>
                    <td className="py-3 px-3 text-slate-300">{del.recipientLandmark.name.split(' ')[0]}</td>
                    <td className="py-3 px-3">
                      {del.isCod ? (
                        <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold">COD</span>
                      ) : (
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">Prepaid</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-white">
                      {del.isCod ? `₦${del.itemValue.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400 font-semibold">
                      ₦{del.deliveryFee.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-teal-400">
                      {del.isCod ? `₦${del.netVendorPayout.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      {del.isCod && isDelivered && !del.vendorSettled ? (
                        <button
                          onClick={() => onSettleVendorPayout(del.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center space-x-1"
                        >
                          <span>Remit</span>
                          <ArrowDownRight className="w-3 h-3" />
                        </button>
                      ) : del.vendorSettled ? (
                        <span className="text-emerald-400 font-bold flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Remitted</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {isDelivered ? 'Settled' : 'Pending Transit'}
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
