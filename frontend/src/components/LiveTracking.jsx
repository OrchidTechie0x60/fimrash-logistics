import React, { useCallback, useEffect, useState } from 'react';
import KanoRouteMap from './KanoRouteMap';
import { Search, CheckCircle2, ShieldCheck, Phone, AlertCircle, Copy, RefreshCw, XCircle } from 'lucide-react';
import { trackDelivery } from '../services/api';
import { getLandmark } from '../data/kanoLandmarks';
import { findMyBooking, getMyBookings } from '../lib/myBookings';
import { dateTimeOf, naira, statusLabel, timeOf } from '../lib/format';

const STEPS = [
  { key: 'pending', title: 'Booked', desc: 'Order logged' },
  { key: 'assigned', title: 'Assigned', desc: 'Courier matched' },
  { key: 'picked_up', title: 'Picked Up', desc: 'Parcel collected' },
  { key: 'in_transit', title: 'In Transit', desc: 'On the way' },
  { key: 'arrived', title: 'Arrived', desc: 'At your landmark' },
  { key: 'delivered', title: 'Delivered', desc: 'Handover complete' },
];
const STEP_INDEX = Object.fromEntries(STEPS.map((s, i) => [s.key, i]));
const POLL_MS = 30000;

export default function LiveTracking({ trackingCode, onSearch }) {
  const [searchCode, setSearchCode] = useState(trackingCode || '');
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [copied, setCopied] = useState(false);
  const myBookings = getMyBookings();

  const load = useCallback(async (code, { quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    try {
      const d = await trackDelivery(code);
      setDelivery(d);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (!quiet) {
        setDelivery(null);
        setError(err.status === 404 ? 'not_found' : err.message);
      }
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSearchCode(trackingCode || '');
    if (trackingCode) load(trackingCode);
    else { setDelivery(null); setError(null); }
  }, [trackingCode, load]);

  // Refresh while the parcel is moving.
  useEffect(() => {
    if (!trackingCode || !delivery || ['delivered', 'cancelled'].includes(delivery.status)) return undefined;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load(trackingCode, { quiet: true });
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [trackingCode, delivery, load]);

  const handleSearch = (e) => {
    e.preventDefault();
    const code = searchCode.trim().toUpperCase();
    if (!code) return;
    if (code === trackingCode) load(code);
    else onSearch(code);
  };

  // The handover code exists only on the sender's own device (saved at booking time).
  const ownBooking = delivery ? findMyBooking(delivery.trackingCode) : null;
  const isCancelled = delivery?.status === 'cancelled';
  const currentStep = delivery ? STEP_INDEX[delivery.status] ?? 0 : 0;
  const eventTime = (key) => delivery?.timeline?.filter((e) => e.event === key).pop()?.at;

  const handleCopyOtp = async () => {
    try {
      await navigator.clipboard.writeText(ownBooking.otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="glass-card rounded-2xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Track Your Parcel
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Status updates from your courier, refreshed automatically while your parcel is on the way.
            </p>
          </div>

          {myBookings.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto text-xs py-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">My bookings:</span>
              {myBookings.slice(0, 5).map((b) => (
                <button
                  key={b.trackingCode}
                  onClick={() => onSearch(b.trackingCode)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    trackingCode === b.trackingCode
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {b.trackingCode}
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              aria-label="Waybill code"
              placeholder="Enter waybill code (e.g. FMR-KN-7Q2X9A)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full rounded-xl pl-11 pr-4 py-3 sm:py-3.5 text-sm sm:text-base uppercase tracking-wider font-mono font-semibold transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base transition cursor-pointer shadow-sm"
          >
            {loading ? 'Searching…' : 'Track'}
          </button>
        </form>
      </div>

      {error && (
        <div className="glass-card rounded-2xl p-8 text-center text-slate-500 space-y-2">
          <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            {error === 'not_found' ? 'Waybill not found' : 'Could not load tracking'}
          </h3>
          <p className="text-xs">
            {error === 'not_found' ? 'Check the code on your SMS, WhatsApp message or printed pass.' : error}
          </p>
        </div>
      )}

      {!trackingCode && !error && (
        <div className="glass-card rounded-2xl p-8 text-center text-slate-500 text-sm">
          Enter your waybill code above to see where your parcel is.
        </div>
      )}

      {delivery && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <KanoRouteMap
              pickupLandmark={getLandmark(delivery.senderLandmarkId)}
              dropoffLandmark={getLandmark(delivery.recipientLandmarkId)}
              activeRiderName={delivery.rider?.name || null}
            />

            {delivery.rider ? (
              <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-lg border border-emerald-200 dark:border-emerald-800/40">
                    🏍️
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-sm">{delivery.rider.name}</span>
                    <span className="text-slate-500 text-xs">Plate: {delivery.rider.bikeNumber}</span>
                  </div>
                </div>
                <a
                  href={`tel:${delivery.rider.phone}`}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl font-semibold flex items-center space-x-1.5 transition text-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Call {delivery.rider.phone}</span>
                </a>
              </div>
            ) : (
              !['delivered', 'cancelled'].includes(delivery.status) && (
                <div className="glass-card rounded-2xl p-4 text-xs text-slate-500">
                  We are matching your parcel with an available courier. Call the desk on 0815 666 1246 if it is urgent.
                </div>
              )
            )}
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="glass-card rounded-2xl p-5 sm:p-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Waybill</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono flex flex-wrap items-center gap-3 mt-0.5">
                    <span>{delivery.trackingCode}</span>
                    <span className={`text-xs font-sans px-2.5 py-0.5 rounded-lg font-bold uppercase ${
                      delivery.status === 'delivered'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                        : isCancelled
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                        : 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                    }`}>
                      {statusLabel(delivery.status)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {delivery.itemCategory} from <strong className="text-slate-800 dark:text-slate-200">{delivery.senderName}</strong> to {delivery.recipientName}
                  </p>
                  {lastUpdated && (
                    <button
                      type="button"
                      onClick={() => load(trackingCode)}
                      className="mt-1 text-[11px] text-slate-400 hover:text-emerald-600 inline-flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Updated {timeOf(lastUpdated.toISOString())} · refresh</span>
                    </button>
                  )}
                </div>

                {ownBooking?.otp && !['delivered', 'cancelled'].includes(delivery.status) ? (
                  <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-3.5 rounded-2xl space-y-1 max-w-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-amber-800 dark:text-amber-300 text-[10px] uppercase font-bold tracking-wider">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Handover code (sender copy)</span>
                      </div>
                      <button onClick={handleCopyOtp} className="text-amber-700 dark:text-amber-400" aria-label="Copy handover code">
                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-2xl font-bold text-amber-900 dark:text-amber-300 font-mono tracking-widest block">
                      {ownBooking.otp}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Share with the recipient only — never with the courier.</span>
                  </div>
                ) : (
                  !['delivered', 'cancelled'].includes(delivery.status) && (
                    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl text-[11px] text-slate-600 dark:text-slate-300 max-w-xs flex items-start space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Receiving this parcel?</strong> Your 4-digit handover code was sent to you by the sender or by SMS.
                        Give it to the courier only after you have checked your parcel.
                      </span>
                    </div>
                  )
                )}
              </div>

              {isCancelled ? (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-sm text-rose-700 dark:text-rose-300 flex items-center space-x-2">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>This delivery was cancelled. Contact the sender or the Fimrash desk for details.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Progress</span>
                  <ol className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {STEPS.map((step, idx) => {
                      const isPassed = currentStep >= idx;
                      const isCurrent = currentStep === idx;
                      const at = eventTime(step.key);
                      return (
                        <li
                          key={step.key}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isCurrent
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-600 dark:text-emerald-300 font-bold'
                              : isPassed
                              ? 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300'
                              : 'bg-slate-50/40 border-slate-100 text-slate-400 dark:bg-slate-950/30 dark:border-slate-900 dark:text-slate-500'
                          }`}
                        >
                          <div className="text-xs font-bold mb-0.5 flex items-center justify-center space-x-1">
                            {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                            <span>{step.title}</span>
                          </div>
                          <span className="text-[10px] block leading-tight opacity-75">{at ? timeOf(at) : step.desc}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="border-l-2 border-emerald-600 dark:border-emerald-500 pl-3.5 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">From</span>
                  <span className="font-bold text-slate-900 dark:text-white block">{getLandmark(delivery.senderLandmarkId)?.name}</span>
                  <span className="text-slate-400 text-[11px] block">Booked {dateTimeOf(delivery.createdAt)}</span>
                </div>
                <div className="border-l-2 border-slate-400 dark:border-slate-600 pl-3.5 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">To</span>
                  <span className="font-bold text-slate-900 dark:text-white block">{getLandmark(delivery.recipientLandmarkId)?.name}</span>
                  {delivery.deliveredAt && (
                    <span className="text-emerald-600 dark:text-emerald-400 text-[11px] block">Delivered {dateTimeOf(delivery.deliveredAt)}</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="text-slate-800 dark:text-slate-200 font-bold block text-sm">
                    {delivery.paymentMode === 'pay_on_delivery' ? 'Delivery fee: pay on arrival' : 'Delivery fee: prepaid by sender'}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {delivery.codAmount > 0
                      ? `Includes item price (CoD) of ${naira(delivery.codAmount)}`
                      : delivery.paymentMode === 'pay_on_delivery'
                      ? 'Pay the courier in cash when you receive the parcel.'
                      : 'Nothing to pay on delivery.'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono">{naira(delivery.amountDue)}</span>
                  <span className="text-[10px] text-slate-400 block">{delivery.amountDue > 0 ? 'Due on handover' : 'Nothing due'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
