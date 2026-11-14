import React from 'react';
import { 
  Package, Truck, Search, Banknote, ShieldCheck, Zap, 
  Radio, Sun, Moon, LogOut, User, Lock, Server
} from 'lucide-react';
import { isBackendConnected } from '../services/api';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  activeDeliveriesCount,
  theme,
  setTheme,
  currentUser,
  onLogout
}) {
  const tabs = [
    { id: 'booking', label: 'Book Dispatch', icon: Package, badge: null, restricted: false },
    { id: 'tracking', label: 'Live Tracking', icon: Search, badge: null, restricted: false },
    { id: 'rider', label: 'Courier Console', icon: Truck, badge: activeDeliveriesCount > 0 ? activeDeliveriesCount : null, restricted: true },
    { id: 'ledger', label: 'Delivery Ledger', icon: Banknote, badge: 'Vault', restricted: true }
  ];

  return (
    <>
      {/* Top Floating Header */}
      <header className="sticky top-2 sm:top-3 z-40 px-3 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="glass-card rounded-2xl px-3.5 sm:px-6 py-2.5 sm:py-3 shadow-sm flex items-center justify-between transition-colors">
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('booking')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-sm">
              F
            </div>

            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  FIMRASH
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase px-1.5 sm:px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  KANO METRO
                </span>
                {isBackendConnected() ? (
                  <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>API Connected</span>
                  </span>
                ) : (
                  <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Local Mesh
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden md:block">
                Intra-State Goods &amp; Parcel Courier Dispatch
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.restricted && !currentUser && (
                    <Lock className="w-2.5 h-2.5 opacity-60" />
                  )}
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-emerald-800 text-emerald-100'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls: Theme Switcher & Auth Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Auth User Pill */}
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-2.5 pr-1.5 py-1 rounded-xl text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-900 dark:text-white max-w-[90px] sm:max-w-none truncate text-[11px]">
                  {currentUser.name}
                </span>
                <button
                  onClick={onLogout}
                  className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('rider')}
                className="hidden sm:flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
              >
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Dock */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded-full">
                    {tab.badge}
                  </span>
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
