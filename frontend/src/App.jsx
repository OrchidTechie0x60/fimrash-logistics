import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BookingForm from './components/BookingForm';
import LiveTracking from './components/LiveTracking';
import RiderConsole from './components/RiderConsole';
import ReconciliationHub from './components/ReconciliationHub';
import AuthGate from './components/AuthGate';
import { fetchMe, getToken, logout, onUnauthorized } from './services/api';
import { navigate, useRoute } from './lib/router';

const readTheme = () => {
  try { return localStorage.getItem('fimrash_theme') || 'dark'; } catch { return 'dark'; }
};

export default function App() {
  const route = useRoute();
  const [theme, setTheme] = useState(readTheme);

  // The session is restored from the server, never trusted from localStorage.
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(() => !getToken());

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    try { localStorage.setItem('fimrash_theme', theme); } catch { /* ignore */ }
  }, [theme]);

  useEffect(() => {
    // Clear the old demo-era keys so stale fake data can never resurface.
    try {
      ['fimrash_user', 'fimrash_deliveries_v2', 'fimrash_rider_cash_v2'].forEach((k) => localStorage.removeItem(k));
    } catch { /* ignore */ }

    const unsubscribe = onUnauthorized(() => setCurrentUser(null));
    if (getToken()) {
      fetchMe()
        .then(setCurrentUser)
        .catch(() => setCurrentUser(null))
        .finally(() => setSessionChecked(true));
    }
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    if (route.tab === 'rider' || route.tab === 'ledger') navigate('booking');
  };

  const renderProtected = (role, content) => {
    if (!sessionChecked) {
      return <div className="py-20 text-center text-sm text-slate-500">Checking your session…</div>;
    }
    if (currentUser?.role === role) return content;
    return <AuthGate targetRole={role} currentUser={currentUser} onLoginSuccess={setCurrentUser} />;
  };

  return (
    <div className="min-h-screen bg-ambient-grid text-slate-100 dark:text-slate-100 flex flex-col font-sans relative selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-300">
      <Navbar
        activeTab={route.tab}
        setActiveTab={(tab) => navigate(tab)}
        theme={theme}
        setTheme={setTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area offset by the permanent vertical left sidebar on desktop */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 lg:pl-72 transition-all">
        <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 md:pb-8 relative z-10">
          {route.tab === 'booking' && (
            <BookingForm onNavigateToTracking={(code) => navigate('tracking', code)} />
          )}

          {route.tab === 'tracking' && (
            <LiveTracking trackingCode={route.code} onSearch={(code) => navigate('tracking', code)} />
          )}

          {route.tab === 'rider' &&
            renderProtected('rider', <RiderConsole currentUser={currentUser} onUserChange={setCurrentUser} />)}

          {route.tab === 'ledger' && renderProtected('admin', <ReconciliationHub />)}
        </main>

        {/* Calm Institutional Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-6 text-xs text-slate-500 dark:text-slate-400 relative z-10 mb-14 md:mb-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="font-bold text-slate-900 dark:text-white tracking-tight">FIMRASH LOGISTICS SERVICES</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span>Kano Intra-State Goods &amp; Parcel Dispatch</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span>Hubs: Gyadi-Gyadi • Naibawa • Kwari • BUK</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Engineered by OrchidByte Solutions</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
