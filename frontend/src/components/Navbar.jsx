import React from 'react';
import { 
  Package, Truck, Search, Banknote, ShieldCheck, Zap, 
  Radio, Sun, Moon, LogOut, User, Lock
} from 'lucide-react';

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
    { id: 'rider', label: 'Rider Console', icon: Truck, badge: activeDeliveriesCount > 0 ? activeDeliveriesCount : null, restricted: true },
    { id: 'ledger', label: 'COD Settlement', icon: Banknote, badge: 'Vault', restricted: true }
  ];

  return (
    <>
      {/* Top Floating Glass Header (Both Desktop & Mobile) */}
      <header className="sticky top-2 sm:top-3 z-40 px-3 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="glass-card rounded-2xl px-3.5 sm:px-6 py-2 sm:py-3 shadow-xl flex items-center justify-between border border-white/10 transition-colors">
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('booking')}
          >
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 text-slate-950 font-black text-lg sm:text-xl group-hover:scale-105 transition-transform">
                F
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full" />
            </div>

            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-black text-base sm:text-lg tracking-tight text-white dark:text-white">
                  FIMRASH
                </span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 tracking-wider">
                  KANO
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden md:block">
                Courier Dispatch & Anti-Theft COD Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/70 p-1.5 rounded-xl border border-white/5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black scale-[1.02]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.restricted && !currentUser && (
                    <Lock className="w-2.5 h-2.5 text-slate-500" />
                  )}
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive
                          ? 'bg-slate-950 text-emerald-400'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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
              className="w-9 h-9 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-emerald-400 transition cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            {/* Auth User Pill */}
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-950/80 border border-emerald-500/30 pl-2.5 pr-1.5 py-1 rounded-xl text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white max-w-[90px] sm:max-w-none truncate text-[11px]">
                  {currentUser.name}
                </span>
                <button
                  onClick={onLogout}
                  className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('rider')}
                className="hidden sm:flex items-center space-x-1.5 bg-slate-950/60 hover:bg-slate-900 text-slate-300 hover:text-emerald-400 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold transition"
              >
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (App Dock - Fixed at Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around shadow-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl relative transition-all ${
                isActive
                  ? 'text-emerald-400 font-extrabold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {tab.restricted && !currentUser && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-950" />
                )}
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-emerald-500 text-slate-950 text-[8px] font-black px-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight font-medium">
                {tab.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
