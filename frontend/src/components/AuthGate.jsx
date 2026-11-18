import React, { useState } from 'react';
import { Shield, Truck, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { login } from '../services/api';

export default function AuthGate({ targetRole, currentUser, onLoginSuccess }) {
  const isRiderTarget = targetRole === 'rider';

  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login({ role: targetRole, identifier: identifier.trim(), secret });
      setSecret('');
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signedInAsOtherRole = currentUser && currentUser.role !== targetRole;

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12">
      <div className="flex justify-center mb-6">
        <img src="/brand/fimrash-lockup.png" alt="Fimrash Logistics" className="h-11 w-auto dark:hidden" />
        <img src="/brand/fimrash-lockup-reversed.png" alt="Fimrash Logistics" className="h-11 w-auto hidden dark:block" />
      </div>
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2 relative z-10">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            {isRiderTarget ? <Truck className="w-7 h-7" /> : <Shield className="w-7 h-7" />}
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isRiderTarget ? 'Courier Sign In' : 'Station Operations Sign In'}
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isRiderTarget
              ? 'Use the phone number or bike plate and PIN given to you by the station.'
              : 'For station managers and finance staff only.'}
          </p>
        </div>

        {signedInAsOtherRole && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 relative z-10">
            You are signed in as {currentUser.role === 'admin' ? 'station staff' : 'a courier'}. This area needs a{' '}
            {isRiderTarget ? 'courier' : 'station'} account; signing in here will switch accounts.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label htmlFor="auth-identifier" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              {isRiderTarget ? 'Phone number or bike plate' : 'Work email'}
            </label>
            <input
              id="auth-identifier"
              type={isRiderTarget ? 'text' : 'email'}
              required
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={isRiderTarget ? 'e.g. 08031234567 or KN-942-TRN' : 'e.g. ops@fimrash.com'}
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold transition"
            />
          </div>

          <div>
            <label htmlFor="auth-secret" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              {isRiderTarget ? 'PIN' : 'Password'}
            </label>
            <div className="relative">
              <input
                id="auth-secret"
                type={showSecret ? 'text' : 'password'}
                required
                autoComplete="current-password"
                inputMode={isRiderTarget ? 'numeric' : undefined}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full rounded-xl px-4 py-3 pr-11 text-sm font-mono font-bold tracking-widest transition"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                aria-label={showSecret ? 'Hide' : 'Show'}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <span>{loading ? 'Signing in…' : 'Sign in'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center relative z-10">
          Forgot your {isRiderTarget ? 'PIN' : 'password'}? Ask the station manager to reset it.
        </p>
      </div>
    </div>
  );
}
