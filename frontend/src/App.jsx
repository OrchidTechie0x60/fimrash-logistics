import React, { useState, useEffect } from 'react';
import BookingForm from './components/BookingForm';
import LiveTracking from './components/LiveTracking';
import RiderConsole from './components/RiderConsole';
import ReconciliationHub from './components/ReconciliationHub';
import AuthGate from './components/AuthGate';
import Landing from './components/public/Landing';
import { PublicHeader, PublicFooter, MobileDock, BrandLogo } from './components/public/PublicShell';
import { LanguageProvider } from './i18n';
import { fetchMe, getToken, logout, onUnauthorized } from './services/api';
import { navigate, useRoute, PUBLIC_TABS } from './lib/router';
import { LogOut, Moon, Sun } from 'lucide-react';
import PullToRefresh from './components/PullToRefresh';

const readTheme = () => {
  try { return localStorage.getItem('fimrash_theme') || 'dark'; } catch { return 'dark'; }
};

// Staff and riders reach /rider and /ops by URL only; nothing on the public site links here.
function InternalHeader({ title, currentUser, theme, setTheme, onLogout }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandLogo variant="mark" on="light" height={26} alt="Fimrash" className="dark:hidden" />
          <BrandLogo variant="mark" on="dark" height={26} alt="Fimrash" className="hidden dark:block" />
          <span className="font-bold text-slate-900 dark:text-white truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-lg grid place-items-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {currentUser && (
            <button
              type="button"
              onClick={onLogout}
              className="h-9 px-3 rounded-lg inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{currentUser.name} ·</span> Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const route = useRoute();
  const isPublic = PUBLIC_TABS.has(route.tab);
  const [theme, setTheme] = useState(readTheme);

  // The session is restored from the server, never trusted from localStorage.
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(() => !getToken());

  // Public pages always render in the light indigo world; the theme toggle is for the consoles.
  useEffect(() => {
    const applied = isPublic ? 'light' : theme;
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(applied);
    try { localStorage.setItem('fimrash_theme', theme); } catch { /* ignore */ }
  }, [theme, isPublic]);

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
  };

  if (isPublic) {
    return (
      <LanguageProvider>
        <div className="min-h-screen flex flex-col bg-[#14215c]">
          <PullToRefresh />
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-[#f1eadb] focus:text-[#0b1240] focus:px-4 focus:py-2 focus:rounded-lg">
            Skip to content
          </a>
          <PublicHeader active={route.tab} />
          <main id="main" className="flex-1">
            {route.tab === 'home' && <Landing />}
            {route.tab !== 'home' && (
              <div className="legacy skin-indigo min-h-full">
                <div className="max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 md:pb-12">
                  {route.tab === 'booking' && (
                    <BookingForm initialQuery={route.query} onNavigateToTracking={(code) => navigate('tracking', code)} />
                  )}
                  {route.tab === 'tracking' && (
                    <LiveTracking trackingCode={route.code} onSearch={(code) => navigate('tracking', code)} />
                  )}
                </div>
              </div>
            )}
          </main>
          <PublicFooter />
          <MobileDock active={route.tab} />
        </div>
      </LanguageProvider>
    );
  }

  const role = route.tab === 'rider' ? 'rider' : 'admin';
  let content;
  if (!sessionChecked) {
    content = <div className="py-20 text-center text-sm text-slate-500">Checking your session…</div>;
  } else if (currentUser?.role !== role) {
    content = <AuthGate targetRole={role} currentUser={currentUser} onLoginSuccess={setCurrentUser} />;
  } else if (role === 'rider') {
    content = <RiderConsole currentUser={currentUser} onUserChange={setCurrentUser} />;
  } else {
    content = <ReconciliationHub />;
  }

  return (
    <div className="legacy skin-brand min-h-screen bg-ambient-grid flex flex-col">
      <PullToRefresh />
      <InternalHeader
        title={role === 'rider' ? 'Fimrash · Courier' : 'Fimrash · Station Ops'}
        currentUser={currentUser?.role === role ? currentUser : null}
        theme={theme}
        setTheme={setTheme}
        onLogout={handleLogout}
      />
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">{content}</main>
    </div>
  );
}
