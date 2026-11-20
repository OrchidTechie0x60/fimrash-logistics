import React, { useCallback, useEffect, useState } from 'react';
import { useRefreshHandler } from '../lib/refresh';
import {
  Wallet, Store, TrendingUp, Package, RefreshCw, Search, ShieldCheck, Users, Banknote, AlertTriangle, Lock, UserPlus, Calculator,
} from 'lucide-react';
import {
  assignDelivery, cancelDelivery, getReconciliation, listDeliveries, listRiders, markCodPaid, remitRiderCash,
  resetDeliveryOtp, saveRider, savePricing, overrideDeliveryFee,
} from '../services/api';
import { DEFAULT_RATES, quote, setCachedRates, usePricingRates } from '../lib/pricing';
import { getLandmark, KANO_ZONES } from '../data/kanoLandmarks';
import { dateTimeOf, naira, statusLabel } from '../lib/format';

const TABS = [
  { id: 'deliveries', label: 'Deliveries', icon: Package },
  { id: 'cash', label: 'Cash & CoD', icon: Banknote },
  { id: 'fleet', label: 'Fleet', icon: Users },
  { id: 'pricing', label: 'Pricing', icon: Calculator },
];

const FILTERS = [
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Unassigned' },
  { id: 'cod_pending', label: 'CoD to pay out' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: '', label: 'All' },
];

const card = 'bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800';
const input = 'rounded-xl px-3 py-2 text-xs sm:text-sm transition';
const btnPrimary = 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded-lg transition cursor-pointer';
const btnGhost = 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg transition cursor-pointer disabled:opacity-50';

function Kpi({ label, value, hint, icon: Icon, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    amber: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400',
  };
  return (
    <div className={card}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">{value}</div>
      {hint && <p className="text-[11px] text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

function ErrorNote({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-xs text-red-700 dark:text-red-300 flex items-center space-x-2">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export default function ReconciliationHub() {
  const [tab, setTab] = useState('deliveries');
  const [summary, setSummary] = useState(null);
  const [remittances, setRemittances] = useState([]);
  const [riders, setRiders] = useState([]);
  const [error, setError] = useState(null);

  const refreshLedger = useCallback(async () => {
    try {
      const [rec, riderList] = await Promise.all([getReconciliation(), listRiders()]);
      setSummary(rec.summary);
      setRemittances(rec.remittances);
      setRiders(riderList);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => { refreshLedger(); }, [refreshLedger]);
  useRefreshHandler(refreshLedger);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="glass-card rounded-2xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2 border border-emerald-200 dark:border-emerald-800/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Station Operations</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Dispatch, Cash &amp; Settlement</h1>
          </div>
          <button type="button" onClick={refreshLedger} className={`${btnGhost} self-start flex items-center gap-1.5`}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <ErrorNote message={error} />

        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Kpi label="Cash held by riders" value={naira(summary.cashHeldByRiders)} hint="Fees + CoD not yet remitted" icon={Wallet} tone="amber" />
            <Kpi label="CoD owed to vendors" value={naira(summary.codPendingPayout)} hint={`${naira(summary.codPaidOut)} paid out so far`} icon={Store} tone="emerald" />
            <Kpi label="Revenue today" value={naira(summary.revenueToday)} hint={`${summary.deliveredToday} delivered today · ${naira(summary.revenue)} all time`} icon={TrendingUp} />
            <Kpi
              label="Active jobs"
              value={summary.activeDeliveries}
              hint={`${summary.unassigned} unassigned${summary.lockedDeliveries ? ` · ${summary.lockedDeliveries} locked` : ''}`}
              icon={Package}
              tone={summary.unassigned || summary.lockedDeliveries ? 'amber' : 'slate'}
            />
          </div>
        )}

        <div className="mt-6 flex gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 max-w-xl overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                tab === id ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'deliveries' && <DeliveriesPanel riders={riders} onChanged={refreshLedger} />}
      {tab === 'cash' && <CashPanel riders={riders} remittances={remittances} onChanged={refreshLedger} />}
      {tab === 'fleet' && <FleetPanel riders={riders} onChanged={refreshLedger} />}
      {tab === 'pricing' && <PricingPanel />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Deliveries: search, assign, cancel, reissue code, CoD payout
// ─────────────────────────────────────────────────────────────
function DeliveriesPanel({ riders, onChanged }) {
  const [filter, setFilter] = useState('active');
  const [query, setQuery] = useState('');
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async (status, q) => {
    setLoading(true);
    try {
      const data = await listDeliveries({ status, q });
      setDeliveries(data.deliveries);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filter, ''); }, [filter, load]);
  useRefreshHandler(() => load(filter, query.trim()));

  const replace = (updated) => {
    setDeliveries((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    onChanged();
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-7 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
          {FILTERS.map((f) => (
            <button
              key={f.id || 'all'}
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
        <form onSubmit={(e) => { e.preventDefault(); load(filter, query.trim()); }} className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              aria-label="Search deliveries"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Code, name or phone"
              className={`${input} pl-9 w-56`}
            />
          </div>
          <button type="submit" className={btnGhost}>Search</button>
        </form>
      </div>

      <ErrorNote message={error} />

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-500">
              <th className="py-3 px-3">Waybill</th>
              <th className="py-3 px-3">Sender → Recipient</th>
              <th className="py-3 px-3">Courier</th>
              <th className="py-3 px-3">Fee / CoD</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {deliveries.map((d) => (
              <React.Fragment key={d.id}>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition align-top">
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-slate-900 dark:text-white block">{d.trackingCode}</span>
                    <span className="text-[11px] text-slate-400">{dateTimeOf(d.createdAt)}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-800 dark:text-slate-200 block">{d.senderName}</span>
                    <span className="text-[11px] text-slate-400 block">
                      {getLandmark(d.senderLandmarkId)?.name} → {getLandmark(d.recipientLandmarkId)?.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block">To: {d.recipientName} · {d.recipientPhone}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    {d.assignedRider?.name || <span className="text-amber-600 dark:text-amber-400 font-semibold">Unassigned</span>}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className="block text-slate-900 dark:text-white">{naira(d.deliveryFee)}{d.paymentMode === 'prepaid' ? ' (prepaid)' : ''}</span>
                    {d.codAmount > 0 && (
                      <span className="block text-[11px] text-amber-700 dark:text-amber-400">
                        CoD {naira(d.codAmount)}
                        {d.codPayoutStatus === 'paid' ? ' · paid' : d.codPayoutStatus === 'pending' ? ' · owed' : ''}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded font-bold uppercase whitespace-nowrap ${
                      d.status === 'delivered'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : d.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {statusLabel(d.status)}
                    </span>
                    {d.otpLocked && (
                      <span className="mt-1 flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                        <Lock className="w-3 h-3" /> Code locked
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className={btnGhost} onClick={() => setOpenId(openId === d.id ? null : d.id)}>
                      {openId === d.id ? 'Close' : 'Manage'}
                    </button>
                  </td>
                </tr>
                {openId === d.id && (
                  <tr>
                    <td colSpan={6} className="px-3 pb-4">
                      <DeliveryActions delivery={d} riders={riders} onUpdated={replace} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {!deliveries.length && !loading && (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500 text-sm">No deliveries in this view.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeliveryActions({ delivery: d, riders, onUpdated }) {
  const [riderId, setRiderId] = useState(d.assignedRider?.id || '');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [newOtp, setNewOtp] = useState(null);
  const [newFee, setNewFee] = useState(String(d.deliveryFee));
  const [feeReason, setFeeReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const run = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const open = !['delivered', 'cancelled'].includes(d.status);
  const assignable = ['pending', 'assigned'].includes(d.status);
  const activeRiders = riders.filter((r) => r.active);

  return (
    <div className={`${card} space-y-4 text-xs sm:text-sm`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup</span>
          {d.senderOtherArea && <strong className="block">{d.senderOtherArea} (near {getLandmark(d.senderLandmarkId)?.name})</strong>}
          {d.senderDetail} · {d.senderPhone}
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Drop-off</span>
          {d.recipientOtherArea && <strong className="block">{d.recipientOtherArea} (near {getLandmark(d.recipientLandmarkId)?.name})</strong>}
          {d.recipientDetail} · {d.recipientPhone}
        </div>
        <div className="sm:col-span-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Parcel</span>
          {d.itemDescription} ({d.itemCategory}, {d.parcelSize || 'small'}){d.specialInstructions ? ` — ${d.specialInstructions}` : ''}
          <span className="block text-slate-500">
            Fee {naira(d.deliveryFee)}{d.distanceKm ? ` · ~${d.distanceKm} km` : ''}{d.feeOverridden ? ' · set by staff' : ''}
          </span>
          {d.cancelReason && <span className="block text-rose-600">Cancelled: {d.cancelReason}</span>}
          {d.codPayoutReference && <span className="block text-emerald-600">Vendor paid {dateTimeOf(d.codPaidAt)} · ref {d.codPayoutReference}</span>}
        </div>
      </div>

      {assignable && (
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Courier" value={riderId} onChange={(e) => setRiderId(e.target.value)} className={input}>
            <option value="">Choose courier…</option>
            {activeRiders.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} · {r.activeJobs} active{r.status === 'off_duty' ? ' · off duty' : ''}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={btnPrimary}
            disabled={busy || !riderId || riderId === d.assignedRider?.id}
            onClick={() => run(async () => onUpdated(await assignDelivery(d.id, riderId)))}
          >
            {d.assignedRider ? 'Reassign' : 'Assign'}
          </button>
        </div>
      )}

      {open && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={btnGhost}
            disabled={busy}
            onClick={() => run(async () => {
              const res = await resetDeliveryOtp(d.id);
              setNewOtp(res);
              onUpdated(res.delivery);
            })}
          >
            Issue new handover code
          </button>
          {newOtp && (
            <span className="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-3 py-1.5 rounded-lg">
              New code <strong className="font-mono tracking-widest">{newOtp.otp}</strong> —{' '}
              {newOtp.smsSent ? 'sent to recipient by SMS.' : `give it to the recipient (${d.recipientPhone}) only, not the courier.`}
            </span>
          )}
        </div>
      )}

      {d.codPayoutStatus === 'pending' && (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => { e.preventDefault(); run(async () => onUpdated(await markCodPaid(d.id, reference.trim()))); }}
        >
          <input
            required
            aria-label="Payment reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Transfer / receipt reference"
            className={`${input} w-60`}
          />
          <button type="submit" className={btnPrimary} disabled={busy}>Mark {naira(d.codAmount)} paid to {d.senderName}</button>
        </form>
      )}

      {open && (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => { e.preventDefault(); run(async () => onUpdated(await overrideDeliveryFee(d.id, Number(newFee), feeReason.trim()))); }}
        >
          <label className="text-xs text-slate-500 flex items-center gap-2">
            Set fee ₦
            <input type="number" min="100" step="50" required aria-label="New fee" value={newFee} onChange={(e) => setNewFee(e.target.value)} className={`${input} w-28 font-mono`} />
          </label>
          <input required aria-label="Reason for fee change" value={feeReason} onChange={(e) => setFeeReason(e.target.value)} placeholder="Reason (e.g. two cartons, far area)" className={`${input} w-60`} />
          <button type="submit" className={btnGhost} disabled={busy}>Update fee</button>
        </form>
      )}

      {open && (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => { e.preventDefault(); run(async () => onUpdated(await cancelDelivery(d.id, reason.trim()))); }}
        >
          <input
            required
            aria-label="Cancellation reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for cancelling"
            className={`${input} w-60`}
          />
          <button type="submit" className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded-lg transition" disabled={busy}>
            Cancel delivery
          </button>
        </form>
      )}

      <ErrorNote message={error} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Cash: receive each rider's pouch, record counted amount & shortfall
// ─────────────────────────────────────────────────────────────
function CashPanel({ riders, remittances, onChanged }) {
  const holding = riders.filter((r) => r.cashHeld > 0);
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-5 sm:p-7 shadow-sm space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Receive rider cash</h2>
          <p className="text-xs text-slate-500">
            Count the pouch, enter what you received. Shortfalls are recorded against the rider. Vendor CoD stays owed until you mark it paid under Deliveries.
          </p>
        </div>
        {holding.length ? (
          <div className="space-y-3">
            {holding.map((r) => <RemitRow key={r.id} rider={r} onDone={onChanged} />)}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No rider is holding cash right now.</p>
        )}
      </div>

      <div className="glass-card rounded-2xl p-5 sm:p-7 shadow-sm">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3">Recent remittances</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-500">
                <th className="py-2 px-3">When</th>
                <th className="py-2 px-3">Rider</th>
                <th className="py-2 px-3">Expected</th>
                <th className="py-2 px-3">Received</th>
                <th className="py-2 px-3">Shortfall</th>
                <th className="py-2 px-3">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {remittances.map((m) => (
                <tr key={m.id}>
                  <td className="py-2 px-3 text-slate-500">{dateTimeOf(m.createdAt)}</td>
                  <td className="py-2 px-3 text-slate-800 dark:text-slate-200">{m.riderName}</td>
                  <td className="py-2 px-3 font-mono">{naira(m.expected)}</td>
                  <td className="py-2 px-3 font-mono">{naira(m.received)}</td>
                  <td className={`py-2 px-3 font-mono font-bold ${m.shortfall > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {m.shortfall > 0 ? naira(m.shortfall) : m.shortfall < 0 ? `+${naira(-m.shortfall)}` : '—'}
                  </td>
                  <td className="py-2 px-3 text-slate-500">{m.note}</td>
                </tr>
              ))}
              {!remittances.length && (
                <tr><td colSpan={6} className="py-6 text-center text-slate-500">No remittances yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RemitRow({ rider, onDone }) {
  const [received, setReceived] = useState(String(rider.cashHeld));
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const shortfall = rider.cashHeld - Number(received || 0);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await remitRiderCash(rider.id, Number(received || 0), note.trim());
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={`${card} flex flex-col lg:flex-row lg:items-center gap-3`}>
      <div className="flex-1">
        <span className="font-bold text-slate-900 dark:text-white block">{rider.name}</span>
        <span className="text-xs text-slate-500">{rider.bikeNumber} · should hand in <strong className="font-mono">{naira(rider.cashHeld)}</strong></span>
      </div>
      <label className="text-xs text-slate-500 flex items-center gap-2">
        Received ₦
        <input type="number" min="0" step="50" required value={received} onChange={(e) => setReceived(e.target.value)} className={`${input} w-32 font-mono`} />
      </label>
      <input aria-label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className={`${input} w-48`} />
      {shortfall > 0 && <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Short {naira(shortfall)}</span>}
      <button type="submit" className={btnPrimary} disabled={busy}>{busy ? 'Saving…' : 'Confirm received'}</button>
      <ErrorNote message={error} />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Fleet: create riders, set/reset PINs, activate or deactivate
// ─────────────────────────────────────────────────────────────
const EMPTY_RIDER = { name: '', phone: '', bike_number: '', active_zone: 'Z1_CENTRAL', pin: '' };

function FleetPanel({ riders, onChanged }) {
  const [editingId, setEditingId] = useState(null); // 'new' | rider id | null

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-7 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Couriers</h2>
          <p className="text-xs text-slate-500">Riders sign in with their phone number or bike plate and the PIN you set here.</p>
        </div>
        <button type="button" className={`${btnPrimary} flex items-center gap-1.5`} onClick={() => setEditingId('new')}>
          <UserPlus className="w-4 h-4" /> Add rider
        </button>
      </div>

      {editingId === 'new' && (
        <RiderForm initial={EMPTY_RIDER} onCancel={() => setEditingId(null)} onSaved={() => { setEditingId(null); onChanged(); }} />
      )}

      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {riders.map((r) => (
          <div key={r.id} className="py-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{r.name}</span>
                <span className="text-slate-500"> · {r.phone} · {r.bikeNumber}</span>
                <span className="block text-[11px] text-slate-400">
                  {KANO_ZONES.find((z) => z.id === r.zone)?.name || r.zone} · {r.activeJobs} active job(s) · holding {naira(r.cashHeld)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-2 py-0.5 rounded font-bold uppercase ${
                  !r.active
                    ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    : r.status === 'available'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}>
                  {!r.active ? (r.hasPin ? 'Deactivated' : 'Needs PIN') : r.status === 'available' ? 'On duty' : 'Off duty'}
                </span>
                <button type="button" className={btnGhost} onClick={() => setEditingId(editingId === r.id ? null : r.id)}>
                  {editingId === r.id ? 'Close' : 'Edit'}
                </button>
              </div>
            </div>
            {editingId === r.id && (
              <div className="mt-3">
                <RiderForm
                  riderId={r.id}
                  initial={{ name: r.name, phone: r.phone, bike_number: r.bikeNumber, active_zone: r.zone, pin: '', active: r.active }}
                  needsPin={!r.hasPin}
                  onCancel={() => setEditingId(null)}
                  onSaved={() => { setEditingId(null); onChanged(); }}
                />
              </div>
            )}
          </div>
        ))}
        {!riders.length && <p className="py-6 text-center text-sm text-slate-500">No riders yet. Add your first courier.</p>}
      </div>
    </div>
  );
}

function RiderForm({ riderId = null, initial, needsPin = false, onCancel, onSaved }) {
  const [form, setForm] = useState({ active: true, ...initial });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = { ...form };
      if (!payload.pin) delete payload.pin;
      await saveRider(payload, riderId);
      onSaved();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={`${card} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs sm:text-sm`}>
      <input required aria-label="Full name" placeholder="Full name" value={form.name} onChange={set('name')} className={input} />
      <input required aria-label="Phone" placeholder="Phone (08…)" value={form.phone} onChange={set('phone')} className={`${input} font-mono`} />
      <input required aria-label="Bike plate" placeholder="Bike plate (KN-123-ABC)" value={form.bike_number} onChange={set('bike_number')} className={`${input} font-mono uppercase`} />
      <select aria-label="Home zone" value={form.active_zone} onChange={set('active_zone')} className={input}>
        {KANO_ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
      </select>
      <input
        aria-label="PIN"
        inputMode="numeric"
        pattern="\d{6,8}"
        title="6 to 8 digits; avoid repeats and runs like 123456"
        required={!riderId || needsPin}
        placeholder={riderId && !needsPin ? 'New PIN (leave blank to keep)' : 'PIN (6–8 digits)'}
        value={form.pin}
        onChange={set('pin')}
        className={`${input} font-mono`}
      />
      <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
        <input type="checkbox" checked={form.active} onChange={set('active')} className="w-4 h-4" />
        Active (can sign in and receive jobs)
      </label>
      <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-2">
        <button type="submit" className={btnPrimary} disabled={busy}>{busy ? 'Saving…' : riderId ? 'Save changes' : 'Create rider'}</button>
        <button type="button" className={btnGhost} onClick={onCancel}>Cancel</button>
        <ErrorNote message={error} />
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Pricing: the rate card behind every quote. Examples update as you type.
// ─────────────────────────────────────────────────────────────
const RATE_FIELDS = [
  ['base', 'Base fee per job (₦)', 'Covers pickup and handling on every job.'],
  ['perKm', 'Per road km (₦)', 'Fuel, time and wear for each kilometre.'],
  ['minimum', 'Minimum fee (₦)', 'No job is cheaper than this.'],
  ['rounding', 'Round up to (₦)', 'Fees round up to this step, e.g. 100.'],
  ['sizeSmall', 'Small parcel extra (₦)', 'Envelope, phone, small pack.'],
  ['sizeMedium', 'Medium parcel extra (₦)', 'Cake box, shoe box, small bag.'],
  ['sizeLarge', 'Large parcel extra (₦)', 'Carton or bulk bag.'],
  ['fragile', 'Fragile handling extra (₦)', 'Cakes, glass, upright items.'],
  ['codPercent', 'Cash-on-delivery handling (%)', 'Of the item price the rider collects.'],
  ['codMinimum', 'Minimum CoD handling (₦)', 'Floor for the CoD handling fee.'],
];

const EXAMPLES = [
  ['gyadi-gyadi', 'naibawa', 'small', false, 0],
  ['kwari-textiles', 'nassarawa-gra', 'medium', false, 0],
  ['yankatako', 'kwari-textiles', 'medium', true, 15000],
  ['buk-new-campus', 'aminu-kano-airport', 'large', false, 0],
];

function PricingPanel() {
  const live = usePricingRates();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const values = form || live;
  const rates = Object.fromEntries(Object.keys(DEFAULT_RATES).map((k) => [k, Number(values[k] ?? DEFAULT_RATES[k])]));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const next = await savePricing(rates);
      setCachedRates(next);
      setForm(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Rate card</h2>
        <p className="text-xs text-slate-500 max-w-2xl">
          Every booking is priced as base + per-km × road distance + parcel size + fragile + cash-on-delivery handling,
          never below the minimum, rounded up. Changes apply to new bookings immediately; existing bookings keep their fee
          (use "Update fee" on a delivery to change one).
        </p>
      </div>

      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_minmax(0,22rem)] gap-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {RATE_FIELDS.map(([key, label, hint]) => (
            <label key={key} className="block">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">{label}</span>
              <input
                type="number"
                min="0"
                step={key === 'codPercent' ? '0.1' : '1'}
                required
                value={values[key] ?? ''}
                onChange={(e) => setForm({ ...values, [key]: e.target.value })}
                className={`${input} w-full font-mono`}
              />
              <span className="text-[11px] text-slate-500">{hint}</span>
            </label>
          ))}
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <button type="submit" className={btnPrimary} disabled={busy}>{busy ? 'Saving…' : 'Save rates'}</button>
            {form && <button type="button" className={btnGhost} onClick={() => setForm(null)}>Discard changes</button>}
            {saved && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Saved. New bookings use these rates.</span>}
            <ErrorNote message={error} />
          </div>
        </div>

        <div className={`${card} space-y-3 self-start`}>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Example fares with these rates</span>
          {EXAMPLES.map(([from, to, size, fragile, cod]) => {
            const q = quote(rates, from, to, { size, fragile, cod });
            return (
              <div key={`${from}-${to}`} className="flex items-start justify-between gap-3 text-xs">
                <span className="text-slate-600 dark:text-slate-300">
                  {getLandmark(from)?.name.split(' (')[0]} → {getLandmark(to)?.name.split(' (')[0]}
                  <span className="block text-slate-400">~{q.km} km · {size}{fragile ? ', fragile' : ''}{cod ? `, CoD ${naira(cod)}` : ''}</span>
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">{naira(q.fee)}</span>
              </div>
            );
          })}
        </div>
      </form>
    </div>
  );
}
