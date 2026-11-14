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
    <div className="max-w-md mx-auto py-6 sm:py-12 px-4">
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
          isRiderTarget ? 'bg-emerald-500/15' : 'bg-cyan-500/15'
        }`} />

        <div className="relative z-10">
          {/* Header Icon */}
          <div className="flex items-center justify-between mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${
              isRiderTarget 
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/20' 
                : 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-slate-950 shadow-cyan-500/20'
            }`}>
              {isRiderTarget ? <Truck className="w-7 h-7" /> : <Shield className="w-7 h-7" />}
            </div>

            <div className="text-right">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                isRiderTarget
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              }`}>
                {isRiderTarget ? 'Fleet Restricted' : 'Finance Clearance'}
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-black text-white dark:text-white tracking-tight mb-1">
            {isRiderTarget ? 'Courier Field Sign-In' : 'Station Operations Gate'}
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            {isRiderTarget 
              ? 'Enter your Fimrash courier ID and 4-digit shift security PIN to access the Kano delivery queue.'
              : 'Authorized personnel only. Access to cash custody vault and vendor bank settlements is audited.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isRiderTarget ? 'Rider / Courier ID' : 'Station Controller Email'}
              </label>
              <div className="relative">
                <input
                  type={isRiderTarget ? "text" : "email"}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={isRiderTarget ? "e.g. RIDER-04" : "ops@fimrash.com"}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">
                  {isRiderTarget ? '4-Digit Rider PIN' : 'Admin Security Key'}
                </label>
                <span className="text-[10px] text-slate-500">Demo PIN: 1234</span>
              </div>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  required
                  maxLength={isRiderTarget ? 4 : 32}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className={`w-full text-slate-950 font-black py-3.5 px-4 rounded-xl text-sm shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                isRiderTarget
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-cyan-500/20'
              }`}
            >
              <span>{isRiderTarget ? 'Authenticate Courier' : 'Unlock Operations Hub'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider text-center">
              One-Tap Pilot Demo Login
            </span>
            <button
              type="button"
              onClick={() => handleQuickDemo(targetRole)}
              className="w-full bg-slate-950 hover:bg-slate-900 border border-white/10 text-slate-200 text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
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
