import React, { useEffect, useState } from 'react';
import {
  Package, Truck, Search, Banknote,
  Sun, Moon, LogOut, Lock, Menu, X, Compass, ChevronRight,
} from 'lucide-react';
import { checkHealth } from '../services/api';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  theme,
  setTheme,
  currentUser,
  onLogout
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(null); // null = checking

  useEffect(() => {
    let cancelled = false;
    const ping = () => checkHealth().then(() => !cancelled && setApiOnline(true)).catch(() => !cancelled && setApiOnline(false));
    ping();
    const timer = setInterval(ping, 60000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  const mainTabs = [
    { 
      id: 'booking', 
      label: 'Book Dispatch', 
      description: 'Request parcel pickup',
      icon: Package, 
      badge: null, 
      restricted: false 
    },
    { 
      id: 'tracking', 
      label: 'Live Tracking', 
      description: 'Waybill status & timeline',
      icon: Search, 
      badge: null, 
      restricted: false 
    },
  ];

  const adminTabs = [
    { 
      id: 'rider', 
      label: 'Courier Console', 
      description: 'Rider dispatch & OTP check',
      icon: Truck, 
      badge: null, 
      restricted: true 
    },
    { 
      id: 'ledger', 
      label: 'Station Ops', 
      description: 'Dispatch, cash & fleet',
      icon: Banknote, 
      badge: null, 
      restricted: true 
    }
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. MOBILE TOP HEADER (< md screen)
          ───────────────────────────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2.5 cursor-pointer"
          onClick={() => handleSelectTab('booking')}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            F
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                FIMRASH
              </span>
              <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                KANO
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Theme switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {/* Mobile drawer toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DESKTOP PERMANENT VERTICAL LEFT SIDEBAR (>= md screens)
          ───────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 lg:w-72 bg-[var(--bg-surface)] border-r border-[var(--border-card)] flex-col justify-between z-40 transition-colors">
        {/* Top: Brand & Logo */}
        <div className="p-5 lg:p-6 pb-4 border-b border-[var(--border-card)]">
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => handleSelectTab('booking')}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              F
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  FIMRASH
                </span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                  KANO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                Intra-State Logistics Services
              </p>
            </div>
          </div>

          {/* Connection status badge */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Service:</span>
            {apiOnline ? (
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Online</span>
              </span>
            ) : (
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border flex items-center space-x-1.5 ${
                apiOnline === false
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${apiOnline === false ? 'bg-rose-500' : 'bg-slate-400'}`} />
                <span>{apiOnline === false ? 'Unreachable' : 'Checking'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Center: Vertical Navigation Groups */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
          {/* Group 1: Public Services */}
          <div>
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Customer Services
            </span>
            <div className="space-y-1">
              {mainTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-semibold'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'}`} />
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm block truncate leading-tight">
                          {tab.label}
                        </span>
                        <span className={`text-[10px] block truncate mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {tab.description}
                        </span>
                      </div>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 2: Dispatch & Operations (Protected) */}
          <div>
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Fleet &amp; Operations
            </span>
            <div className="space-y-1">
              {adminTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-semibold'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'}`} />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs sm:text-sm block truncate leading-tight">
                            {tab.label}
                          </span>
                          {tab.restricted && !currentUser && (
                            <Lock className="w-2.5 h-2.5 text-slate-400 opacity-70" />
                          )}
                        </div>
                        <span className={`text-[10px] block truncate mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {tab.description}
                        </span>
                      </div>
                    </div>
                    {tab.badge && (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isActive 
                          ? 'bg-emerald-800 text-emerald-100' 
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kano Metro Quick Telemetry Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Kano Coverage</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">12 Corridors</span>
            </div>
            <p className="text-[10.5px] text-slate-500 leading-relaxed">
              Gyadi-Gyadi, Naibawa, Hotoro, Kwari, Farm Centre, BUK, Zoo Road.
            </p>
          </div>
        </div>

        {/* Bottom: Theme Switcher & User Profile */}
        <div className="p-4 border-t border-[var(--border-card)] space-y-3">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <span className="flex items-center space-x-2">
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Toggle</span>
          </button>

          {/* User Account / Sign In Pill */}
          {currentUser ? (
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block truncate">
                    {currentUser.role === 'admin' ? 'Station Staff' : `Courier · ${currentUser.bikeNumber}`}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleSelectTab('rider')}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign In (Courier / Admin)</span>
            </button>
          )}

          <div className="text-center pt-1">
            <span className="text-[10px] text-slate-400">
              OrchidByte Solutions © 2026
            </span>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          3. SLIDE-OUT MOBILE DRAWER (< md screens when toggled)
          ───────────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
          <div className="w-72 max-w-[80%] bg-white dark:bg-slate-900 h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base">
                    F
                  </div>
                  <div>
                    <span className="font-bold text-base text-slate-900 dark:text-white">FIMRASH</span>
                    <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Kano Metropolis</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation links in mobile drawer */}
              <div className="mt-5 space-y-2">
                {[...mainTabs, ...adminTabs].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleSelectTab(tab.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition ${
                        isActive
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-semibold">{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom logout / user in drawer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              {currentUser ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</span>
                  <button onClick={onLogout} className="text-xs text-rose-600 font-semibold">Sign Out</button>
                </div>
              ) : (
                <button
                  onClick={() => handleSelectTab('rider')}
                  className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. MOBILE BOTTOM DOCK (For quick 1-tap thumb access)
          ───────────────────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[...mainTabs, ...adminTabs].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl relative transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                {tab.restricted && !currentUser && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
