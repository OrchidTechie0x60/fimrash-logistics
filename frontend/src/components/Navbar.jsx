import React from 'react';
import { Package, Truck, Search, Banknote, ShieldCheck, Zap, Radio } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, activeDeliveriesCount }) {
  const tabs = [
    { id: 'booking', label: 'Book Dispatch', icon: Package, badge: null },
    { id: 'tracking', label: 'Live Tracking', icon: Search, badge: null },
    { id: 'rider', label: 'Rider Console', icon: Truck, badge: activeDeliveriesCount > 0 ? activeDeliveriesCount : null },
    { id: 'ledger', label: 'COD Settlement', icon: Banknote, badge: 'Live' }
  ];

  return (
    <header className="sticky top-3 z-50 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      <div className="glass-card rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 shadow-2xl flex items-center justify-between border border-white/10">
        {/* Brand identity */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setActiveTab('booking')}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 text-slate-950 font-black text-xl group-hover:scale-105 transition-transform">
              F
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                FIMRASH
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 tracking-wider">
                KANO METRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Courier Dispatch & Anti-Theft COD Platform
            </p>
          </div>
        </div>

        {/* Desktop Role Tabs */}
        <nav className="hidden md:flex items-center space-x-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
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

        {/* Real-time Status Badge */}
        <div className="flex items-center space-x-2">
          <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-300 bg-emerald-950/40 border border-emerald-500/25 px-3 py-1.5 rounded-xl">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-300 text-[11px]">Metropolitan Mesh Active</span>
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setActiveTab(activeTab === 'rider' ? 'booking' : 'rider')}
              className="bg-emerald-500 text-slate-950 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-md"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Rider App</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Strip */}
      <div className="flex md:hidden overflow-x-auto py-2 px-1 space-x-2 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                  : 'bg-slate-900/80 text-slate-300 border border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] px-1 bg-slate-950 text-emerald-400 rounded-full font-black">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
