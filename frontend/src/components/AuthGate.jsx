import React, { useState } from 'react';
import { Shield, Lock, Truck, Key, UserCheck, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AuthGate({ targetRole, onLoginSuccess, theme }) {
  const isRiderTarget = targetRole === 'rider';

  const [identifier, setIdentifier] = useState(isRiderTarget ? 'RIDER-04' : 'ops@fimrash.com');
  const [pin, setPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRiderTarget) {
      if (pin === '1234' || pin.length === 4) {
        onLoginSuccess({
          role: 'rider',
          id: 'rider_04',
          name: 'Musa Garba',
          bikeNumber: 'KN-942-TRN',
          zone: 'Kano Central'
        });
      } else {
        setError('Invalid Courier PIN. For demo access use: 1234');
      }
    } else {
      // Operations Admin
      if (pin === '1234' || pin.length >= 4) {
        onLoginSuccess({
          role: 'admin',
          id: 'admin_ops',
          name: 'Kano Station Dispatcher',
          email: identifier,
          clearance: 'Level-3 Financial Controller'
        });
      } else {
        setError('Invalid Security Key. For demo access use: 1234');
      }
    }
  };

  const handleQuickDemo = (roleType) => {
    if (roleType === 'rider') {
      onLoginSuccess({
        role: 'rider',
        id: 'rider_04',
        name: 'Musa Garba',
        bikeNumber: 'KN-942-TRN',
        zone: 'Kano Central'
      });
    } else {
      onLoginSuccess({
        role: 'admin',
        id: 'admin_ops',
        name: 'Kano Station Dispatcher',
        email: 'ops.kano@fimrash.com',
        clearance: 'Level-3 Financial Controller'
      });
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 px-4">
      <div className="glass-card rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          {/* Header Icon */}
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200">
              {isRiderTarget ? <Truck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> : <Shield className="w-6 h-6 text-slate-700 dark:text-slate-300" />}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {isRiderTarget ? 'Fleet Restricted' : 'Finance Clearance'}
              </span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
            {isRiderTarget ? 'Courier Field Sign-In' : 'Station Operations Gate'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            {isRiderTarget 
              ? 'Enter your Fimrash courier ID and 4-digit shift security PIN to access the Kano delivery queue.'
              : 'Authorized personnel only. Access to cash custody vault and vendor bank settlements is audited.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isRiderTarget ? 'Rider / Courier ID' : 'Station Controller Email'}
              </label>
              <input
                type={isRiderTarget ? "text" : "email"}
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={isRiderTarget ? "e.g. RIDER-04" : "ops@fimrash.com"}
                className="w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isRiderTarget ? '4-Digit Rider PIN' : 'Admin Security Key'}
                </label>
                <span className="text-[10px] text-slate-400">Demo PIN: 1234</span>
              </div>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  required
                  maxLength={isRiderTarget ? 4 : 32}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono tracking-widest transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs p-2.5 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{isRiderTarget ? 'Authenticate Courier' : 'Unlock Operations Hub'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider text-center">
              One-Tap Pilot Demo Login
            </span>
            <button
              type="button"
              onClick={() => handleQuickDemo(targetRole)}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {isRiderTarget 
                  ? 'Quick Sign-In as Musa Garba (Rider #04)' 
                  : 'Quick Sign-In as Kano Station Controller'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
