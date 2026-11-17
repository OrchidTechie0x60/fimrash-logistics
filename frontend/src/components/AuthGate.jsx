import React, { useState } from 'react';
import { Shield, Lock, Truck, Key, UserCheck, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { loginApi } from '../services/api';

export default function AuthGate({ targetRole, onLoginSuccess, theme }) {
  const isRiderTarget = targetRole === 'rider';

  const [identifier, setIdentifier] = useState(isRiderTarget ? 'rider_04' : 'ops.kano@fimrash.com');
  const [pin, setPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await loginApi({ identifier, pin, role: targetRole });
    setLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setError(res.error || 'Invalid credentials. Default PIN: 1234');
    }
  };

  const handleQuickDemo = async (roleType) => {
    setLoading(true);
    setError(null);

    const res = await loginApi({
      identifier: roleType === 'rider' ? 'rider_04' : 'ops.kano@fimrash.com',
      pin: '1234',
      role: roleType
    });
    setLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      onLoginSuccess({
        role: roleType,
        id: roleType === 'rider' ? 'rider_04' : 'admin_ops',
        name: roleType === 'rider' ? 'Musa Garba' : 'Kano Station Dispatcher',
        phone: '08156661246',
        bikeNumber: 'KN-942-TRN',
        zone: 'Kano Central'
      });
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12">
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2 relative z-10">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            {isRiderTarget ? <Truck className="w-7 h-7" /> : <Shield className="w-7 h-7" />}
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isRiderTarget ? 'Courier Console Gateway' : 'Station Ledger Vault Gateway'}
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isRiderTarget 
              ? 'Authorized Kano motorcycle fleet dispatch clearance required.'
              : 'Station administrator & financial reconciliation clearance required.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              {isRiderTarget ? 'Courier ID or Phone Number' : 'Station Officer Email / Staff ID'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={isRiderTarget ? 'e.g. rider_04 or 08156661246' : 'e.g. ops.kano@fimrash.com'}
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              {isRiderTarget ? '4-Digit Fleet PIN' : 'Security Master Key'}
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full rounded-xl px-4 py-3 text-sm font-mono font-bold tracking-widest transition"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating with Whogohost...' : isRiderTarget ? 'Authenticate Courier' : 'Unlock Ledger Vault'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials Access */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center relative z-10">
          <span className="text-[11px] text-slate-400 block mb-2 font-medium">
            Demo Environment Access (PIN: 1234)
          </span>
          <button
            type="button"
            onClick={() => handleQuickDemo(targetRole)}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
          >
            Instant 1-Click Access as {isRiderTarget ? 'Musa Garba (Rider #04)' : 'Operations Admin'}
          </button>
        </div>
      </div>
    </div>
  );
}
