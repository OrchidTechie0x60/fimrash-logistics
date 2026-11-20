import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRefreshHandler } from '../lib/refresh';
import {
  MapPin, Phone, ShieldCheck, CheckCircle2, AlertTriangle, Navigation, Package, RefreshCw, Wallet, Lock,
} from 'lucide-react';
import { listDeliveries, setAvailability, updateDeliveryStatus, verifyOtp } from '../services/api';
import { getLandmark } from '../data/kanoLandmarks';
import { naira, statusLabel, timeOf } from '../lib/format';

const POLL_MS = 45000;
const STATUS_ACTIONS = [
  { next: 'picked_up', from: ['assigned'], label: '1. Na Karɓi Kayan (Picked Up)' },
  { next: 'in_transit', from: ['picked_up'], label: '2. Ina Kan Hanya (In Transit)' },
  { next: 'arrived', from: ['picked_up', 'in_transit'], label: '3. Na Isa (Arrived)' },
];

export default function RiderConsole({ currentUser, onUserChange }) {
  const [deliveries, setDeliveries] = useState([]);
  const [cashHeld, setCashHeld] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [deliveryCashConfirmed, setDeliveryCashConfirmed] = useState(false);
  const [codCashConfirmed, setCodCashConfirmed] = useState(false);
  const otpRefs = useRef([]);

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    try {
      const data = await listDeliveries();
      setDeliveries(data.deliveries || []);
      setCashHeld(data.cashHeld || 0);
      setLoadError(null);
    } catch (err) {
      if (!quiet) setLoadError(err.message);
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useRefreshHandler(() => load());

  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load({ quiet: true });
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const activeDeliveries = deliveries.filter((d) => !['delivered', 'cancelled'].includes(d.status));
  const completedToday = deliveries.filter((d) => d.status === 'delivered');
  const currentDelivery = activeDeliveries.find((d) => d.id === selectedId) || activeDeliveries[0] || null;

  const resetHandover = () => {
    setOtpDigits(['', '', '', '']);
    setDeliveryCashConfirmed(false);
    setCodCashConfirmed(false);
    setActionError(null);
  };

  const replaceDelivery = (updated) => setDeliveries((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));

  const handleStatus = async (next) => {
    setBusy(true);
    setActionError(null);
    try {
      replaceDelivery(await updateDeliveryStatus(currentDelivery.id, next));
    } catch (err) {
      setActionError(err.message);
      if (err.status === 409) load({ quiet: true });
    } finally {
      setBusy(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 1) {
      // Pasted or autofilled the whole code.
      const next = digits.slice(0, 4).split('');
      setOtpDigits([0, 1, 2, 3].map((i) => next[i] || ''));
      otpRefs.current[Math.min(next.length, 3)]?.focus();
      return;
    }
    const next = [...otpDigits];
    next[index] = digits;
    setOtpDigits(next);
    if (digits && index < 3) otpRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleVerifyHandshake = async (e) => {
    e.preventDefault();
    if (!currentDelivery) return;
    const isPayOnDelivery = currentDelivery.paymentMode === 'pay_on_delivery';
    const isCod = currentDelivery.codAmount > 0;

    if (isPayOnDelivery && !deliveryCashConfirmed) {
      setActionError(`Tabbatar ka karɓi kuɗin jigila ${naira(currentDelivery.deliveryFee)} — confirm you collected the delivery fee first.`);
      return;
    }
    if (isCod && !codCashConfirmed) {
      setActionError(`Tabbatar ka karɓi kuɗin kaya ${naira(currentDelivery.codAmount)} — confirm you collected the item price (CoD) first.`);
      return;
    }
    const otp = otpDigits.join('');
    if (otp.length !== 4) {
      setActionError('Shigar da lamba 4 — enter all 4 digits of the recipient’s code.');
      return;
    }

    setBusy(true);
    setActionError(null);
    try {
      const res = await verifyOtp(currentDelivery.id, otp);
      replaceDelivery(res.delivery);
      setCashHeld(res.cashHeld);
      setNotice(
        res.cashCollected > 0
          ? `${currentDelivery.trackingCode} delivered. Keep ${naira(res.cashCollected)} safe for the station.`
          : `${currentDelivery.trackingCode} delivered.`,
      );
      setTimeout(() => setNotice(null), 6000);
      resetHandover();
      setSelectedId(null);
    } catch (err) {
      if (err.status === 422 && err.data?.attemptsRemaining !== undefined) {
        setActionError(
          err.data.locked
            ? 'Too many wrong codes. This delivery is now locked — call the dispatch desk.'
            : `Lambar sirri ba daidai ba — wrong code. ${err.data.attemptsRemaining} attempt(s) left before the delivery locks.`,
        );
        setOtpDigits(['', '', '', '']);
        otpRefs.current[0]?.focus();
      } else {
        setActionError(err.message);
      }
      load({ quiet: true });
    } finally {
      setBusy(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      onUserChange(await setAvailability(currentUser.status === 'available' ? 'off_duty' : 'available'));
    } catch (err) {
      setActionError(err.message);
    }
  };

  const onDuty = currentUser.status === 'available';
  const senderLandmark = currentDelivery && getLandmark(currentDelivery.senderLandmarkId);
  const recipientLandmark = currentDelivery && getLandmark(currentDelivery.recipientLandmarkId);
  const canHandover = currentDelivery && ['picked_up', 'in_transit', 'arrived'].includes(currentDelivery.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Rider identity, duty status & cash pouch */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl">
              🏍️
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">{currentUser.name}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Bike: {currentUser.bikeNumber}</p>
              <button
                type="button"
                onClick={toggleAvailability}
                className={`mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                  onDuty
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {onDuty ? '● On duty — tap to go off duty' : '○ Off duty — tap to receive jobs'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-5 text-right">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">Cash to remit</span>
              <span className="text-xl font-bold text-amber-700 dark:text-amber-400 font-mono flex items-center justify-end gap-1">
                <Wallet className="w-4 h-4" />
                {naira(cashHeld)}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">Active</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{activeDeliveries.length}</span>
            </div>
            <button
              type="button"
              onClick={() => load()}
              aria-label="Refresh jobs"
              className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {notice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {loadError && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-xs text-red-700 dark:text-red-300">
            {loadError}
          </div>
        )}

        {activeDeliveries.length > 0 ? (
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {activeDeliveries.map((del) => (
              <button
                key={del.id}
                onClick={() => { setSelectedId(del.id); resetHandover(); }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap border shrink-0 transition-all flex items-center space-x-2 cursor-pointer ${
                  currentDelivery?.id === del.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>{del.trackingCode}</span>
                <span className="opacity-75 text-xs font-normal">{statusLabel(del.status)}</span>
              </button>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              Babu aiki a yanzu — no active jobs. {onDuty ? 'New jobs appear here automatically.' : 'Go on duty to receive jobs.'}
            </div>
          )
        )}
      </div>

      {currentDelivery && (
        <div className="glass-card rounded-2xl p-5 sm:p-7 space-y-6 shadow-sm">
          <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Waybill</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">{currentDelivery.trackingCode}</span>
              <span className="text-xs px-2 py-0.5 rounded-md font-bold uppercase bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {statusLabel(currentDelivery.status)}
              </span>
              {currentDelivery.isFragile && (
                <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  ⚠️ Fragile
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Kaya: <strong className="text-slate-900 dark:text-white">{currentDelivery.itemDescription}</strong> ({currentDelivery.itemCategory}, {currentDelivery.parcelSize || 'small'})
            </p>
            {currentDelivery.specialInstructions && (
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Note: {currentDelivery.specialInstructions}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="flex items-center space-x-1 text-slate-400 text-xs font-bold uppercase">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Wajen Karɓa (Pickup)</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                {currentDelivery.senderOtherArea ? `${currentDelivery.senderOtherArea} (near ${senderLandmark?.name})` : senderLandmark?.name}
              </span>
              <span className="text-slate-600 dark:text-slate-300 block text-xs">{currentDelivery.senderDetail}</span>
              <span className="text-slate-400 text-[11px] block">Mai aikawa: {currentDelivery.senderName}</span>
              <a href={`tel:${currentDelivery.senderPhone}`} className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline pt-1">
                <Phone className="w-3.5 h-3.5" />
                <span>Kira: {currentDelivery.senderPhone}</span>
              </a>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="flex items-center space-x-1 text-slate-400 text-xs font-bold uppercase">
                <Navigation className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Wajen Kaiwa (Drop-off)</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                {currentDelivery.recipientOtherArea ? `${currentDelivery.recipientOtherArea} (near ${recipientLandmark?.name})` : recipientLandmark?.name}
              </span>
              <span className="text-slate-600 dark:text-slate-300 block text-xs">{currentDelivery.recipientDetail}</span>
              <span className="text-slate-400 text-[11px] block">Mai karɓa: {currentDelivery.recipientName}</span>
              <a href={`tel:${currentDelivery.recipientPhone}`} className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline pt-1">
                <Phone className="w-3.5 h-3.5" />
                <span>Kira: {currentDelivery.recipientPhone}</span>
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Sabunta Matsayi (Update status)</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {STATUS_ACTIONS.map((a) => (
                <button
                  key={a.next}
                  type="button"
                  onClick={() => handleStatus(a.next)}
                  disabled={busy || !a.from.includes(currentDelivery.status)}
                  className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold py-3 px-3 rounded-xl text-slate-800 dark:text-slate-200 transition cursor-pointer"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white text-xs sm:text-sm font-bold uppercase tracking-wider">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Handover: recipient’s 4-digit code</span>
            </div>

            {currentDelivery.otpLocked ? (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-300 flex items-center space-x-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Locked after too many wrong codes. Call the dispatch desk (0815 666 1246) to issue a new code.</span>
              </div>
            ) : !canHandover ? (
              <p className="text-xs sm:text-sm text-slate-500">Mark the parcel as picked up first.</p>
            ) : (
              <>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Kada ka miƙa kayan har sai mai karɓa ya faɗa maka lambar sirri — ask the recipient for their code. You do not have it; only they do.
                </p>

                <form onSubmit={handleVerifyHandshake} className="space-y-4">
                  {currentDelivery.paymentMode === 'pay_on_delivery' ? (
                    <label className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={deliveryCashConfirmed}
                        onChange={(e) => setDeliveryCashConfirmed(e.target.checked)}
                        className="mt-0.5 w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold">
                        Na karɓi kuɗin jigila <span className="font-bold underline text-emerald-600 dark:text-emerald-400">{naira(currentDelivery.deliveryFee)}</span> — I collected the delivery fee.
                      </span>
                    </label>
                  ) : (
                    <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-3.5 rounded-xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                      ✅ Delivery fee prepaid — babu kuɗin jigila da za ka karɓa.
                    </div>
                  )}

                  {currentDelivery.codAmount > 0 && (
                    <label className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-4 rounded-xl flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={codCashConfirmed}
                        onChange={(e) => setCodCashConfirmed(e.target.checked)}
                        className="mt-0.5 w-5 h-5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                      />
                      <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold">
                        Na karɓi kuɗin kaya (CoD) <span className="font-bold underline text-amber-700 dark:text-amber-400 font-mono">{naira(currentDelivery.codAmount)}</span> — I collected the item price for the vendor.
                      </span>
                    </label>
                  )}

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Shigar da Lambar Sirri (Enter code)</span>
                    <div className="flex justify-center gap-3 sm:gap-4">
                      {[0, 1, 2, 3].map((idx) => (
                        <input
                          key={idx}
                          ref={(el) => { otpRefs.current[idx] = el; }}
                          aria-label={`Code digit ${idx + 1}`}
                          type="text"
                          inputMode="numeric"
                          autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                          maxLength={idx === 0 ? 4 : 1}
                          value={otpDigits[idx]}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          className="w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl font-bold font-mono rounded-xl bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-900 dark:text-white transition"
                        />
                      ))}
                    </div>
                  </div>

                  {actionError && (
                    <div role="alert" className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{actionError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-4 px-6 rounded-xl text-center text-sm sm:text-base shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{busy ? 'Checking…' : 'Kammala Isarwa (Complete delivery)'}</span>
                  </button>
                </form>
              </>
            )}

            {!canHandover && actionError && (
              <div role="alert" className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl text-red-700 dark:text-red-300 text-xs">
                {actionError}
              </div>
            )}
          </div>
        </div>
      )}

      {completedToday.length > 0 && (
        <div className="glass-card rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Completed today ({completedToday.length})</span>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
            {completedToday.map((d) => (
              <li key={d.id} className="py-2 flex items-center justify-between">
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{d.trackingCode}</span>
                <span className="text-slate-500">{getLandmark(d.recipientLandmarkId)?.name}</span>
                <span className="text-slate-400">{timeOf(d.deliveredAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
